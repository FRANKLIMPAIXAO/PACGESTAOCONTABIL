import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes do escritório' })
  findAll(@CurrentUser('officeId') officeId: string) {
    return this.clientsService.findAll(officeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.clientsService.findOne(id, officeId);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  create(@Body() dto: CreateClientDto, @CurrentUser('officeId') officeId: string) {
    return this.clientsService.create(dto, officeId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.clientsService.update(id, dto, officeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar cliente (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.clientsService.remove(id, officeId);
  }
}
