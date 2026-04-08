import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os clientes DO ESCRITÓRIO logado.
   * O officeId vem do JWT — nunca do body ou query params.
   */
  async findAll(officeId: string) {
    return this.prisma.client.findMany({
      where: { officeId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, officeId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, officeId },
      include: {
        obligations: { include: { obligation: true } },
        tasks: true,
        fees: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async create(dto: CreateClientDto, officeId: string) {
    // Verificar duplicidade de CNPJ/CPF
    const existing = await this.prisma.client.findUnique({
      where: { document: dto.document },
    });

    if (existing) {
      throw new ConflictException('Já existe um cliente com este CPF/CNPJ');
    }

    return this.prisma.client.create({
      data: {
        ...dto,
        officeId,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto, officeId: string) {
    // Garantir que o cliente pertence ao escritório
    await this.findOne(id, officeId);

    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, officeId: string) {
    await this.findOne(id, officeId);

    return this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
