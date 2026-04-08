import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ObligationsService } from './obligations.service';
import { CreateObligationDto, UpdateObligationDto, CreateClientObligationDto } from './dto/obligation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Obrigações')
@ApiBearerAuth()
@Controller('obligations')
export class ObligationsController {
  constructor(private readonly obligationsService: ObligationsService) {}

  // Templates de obrigações do escritório
  @Get() findAll(@CurrentUser('officeId') officeId: string) {
    return this.obligationsService.findAll(officeId);
  }

  @Post()
  create(@Body() dto: CreateObligationDto, @CurrentUser('officeId') officeId: string) {
    return this.obligationsService.create(dto, officeId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateObligationDto, @CurrentUser('officeId') officeId: string) {
    return this.obligationsService.update(id, dto, officeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.obligationsService.remove(id, officeId);
  }

  // Instâncias por cliente
  @Get('client-obligations')
  @ApiOperation({ summary: 'Listar obrigações dos clientes com filtros' })
  findClientObligations(
    @CurrentUser('officeId') officeId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.obligationsService.findClientObligations(officeId, { status, clientId });
  }

  @Post('client-obligations')
  @ApiOperation({ summary: 'Associar obrigação a um cliente' })
  assignToClient(@Body() dto: CreateClientObligationDto, @CurrentUser('officeId') officeId: string) {
    return this.obligationsService.assignToClient(dto, officeId);
  }

  @Patch('client-obligations/:id/status')
  @ApiOperation({ summary: 'Atualizar status da obrigação do cliente' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.obligationsService.updateClientObligation(id, status, officeId);
  }
}
