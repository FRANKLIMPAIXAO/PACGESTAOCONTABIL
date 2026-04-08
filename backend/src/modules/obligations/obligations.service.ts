import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObligationDto, UpdateObligationDto, CreateClientObligationDto } from './dto/obligation.dto';

@Injectable()
export class ObligationsService {
  constructor(private prisma: PrismaService) {}

  // ── Obrigações base (templates) ──────────────────────────────────────────

  async findAll(officeId: string) {
    return this.prisma.obligation.findMany({
      where: { officeId },
      include: { clients: { include: { client: { select: { id: true, name: true } } } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateObligationDto, officeId: string) {
    return this.prisma.obligation.create({ data: { ...dto, officeId } });
  }

  async update(id: string, dto: UpdateObligationDto, officeId: string) {
    await this.findOneObligation(id, officeId);
    return this.prisma.obligation.update({ where: { id }, data: dto });
  }

  async remove(id: string, officeId: string) {
    await this.findOneObligation(id, officeId);
    return this.prisma.obligation.delete({ where: { id } });
  }

  private async findOneObligation(id: string, officeId: string) {
    const ob = await this.prisma.obligation.findFirst({ where: { id, officeId } });
    if (!ob) throw new NotFoundException('Obrigação não encontrada');
    return ob;
  }

  // ── Obrigações por cliente (instâncias) ──────────────────────────────────

  async findClientObligations(officeId: string, filters?: { status?: string; clientId?: string }) {
    return this.prisma.clientObligation.findMany({
      where: {
        officeId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: { select: { id: true, name: true, type: true } },
        obligation: { select: { id: true, name: true, category: true, frequency: true } },
      },
      orderBy: { nextDue: 'asc' },
    });
  }

  async assignToClient(dto: CreateClientObligationDto, officeId: string) {
    const obligation = await this.findOneObligation(dto.obligationId, officeId);
    const nextDue = this.calcNextDue(obligation.dueDay);

    return this.prisma.clientObligation.create({
      data: {
        clientId: dto.clientId,
        obligationId: dto.obligationId,
        officeId,
        status: 'PENDING',
        nextDue,
      },
      include: {
        client: { select: { id: true, name: true } },
        obligation: { select: { id: true, name: true } },
      },
    });
  }

  async updateClientObligation(id: string, status: string, officeId: string) {
    const co = await this.prisma.clientObligation.findFirst({ where: { id, officeId } });
    if (!co) throw new NotFoundException('Instância de obrigação não encontrada');

    return this.prisma.clientObligation.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' && { lastDue: co.nextDue }),
      },
    });
  }

  private calcNextDue(dueDay: number): Date {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next;
  }
}
