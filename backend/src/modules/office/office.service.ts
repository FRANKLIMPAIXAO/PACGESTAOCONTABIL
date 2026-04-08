import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOfficeDto } from './dto/office.dto';

@Injectable()
export class OfficeService {
  constructor(private prisma: PrismaService) {}

  async findOne(officeId: string) {
    const office = await this.prisma.office.findUnique({
      where: { id: officeId },
      include: {
        _count: { select: { users: true, clients: true, tasks: true, obligations: true } },
      },
    });
    if (!office) throw new NotFoundException('Escritório não encontrado');
    return office;
  }

  async update(officeId: string, dto: UpdateOfficeDto) {
    return this.prisma.office.update({ where: { id: officeId }, data: dto });
  }

  async getStats(officeId: string) {
    const [clients, tasks, obligations, users] = await Promise.all([
      this.prisma.client.count({ where: { officeId, isActive: true } }),
      this.prisma.task.groupBy({ by: ['status'], where: { officeId }, _count: true }),
      this.prisma.clientObligation.groupBy({ by: ['status'], where: { officeId }, _count: true }),
      this.prisma.user.count({ where: { officeId, isActive: true } }),
    ]);
    return { clients, tasks, obligations, users };
  }
}
