import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';

const SELECT_USER = {
  id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(officeId: string) {
    return this.prisma.user.findMany({
      where: { officeId },
      select: SELECT_USER,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, officeId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, officeId }, select: SELECT_USER });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(dto: CreateUserDto, officeId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashedPassword, role: dto.role, officeId },
      select: SELECT_USER,
    });
  }

  async update(id: string, dto: UpdateUserDto, officeId: string, requesterId: string) {
    const user = await this.findOne(id, officeId);
    if (user.role === 'OWNER' && id !== requesterId) {
      throw new ForbiddenException('Não é possível alterar o proprietário');
    }
    return this.prisma.user.update({ where: { id }, data: dto, select: SELECT_USER });
  }

  async toggleActive(id: string, officeId: string) {
    const user = await this.findOne(id, officeId);
    if (user.role === 'OWNER') throw new ForbiddenException('Não é possível desativar o proprietário');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: SELECT_USER,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto, officeId: string) {
    await this.findOne(id, officeId);
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    return { message: 'Senha alterada com sucesso' };
  }

  async remove(id: string, officeId: string) {
    const user = await this.findOne(id, officeId);
    if (user.role === 'OWNER') throw new ForbiddenException('Não é possível remover o proprietário');
    return this.prisma.user.delete({ where: { id } });
  }
}
