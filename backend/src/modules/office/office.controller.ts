import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OfficeService } from './office.service';
import { UpdateOfficeDto } from './dto/office.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Escritório')
@ApiBearerAuth()
@Controller('office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Get()
  @ApiOperation({ summary: 'Dados do escritório logado' })
  findOne(@CurrentUser('officeId') officeId: string) {
    return this.officeService.findOne(officeId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar dados do escritório' })
  update(@Body() dto: UpdateOfficeDto, @CurrentUser('officeId') officeId: string) {
    return this.officeService.update(officeId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do escritório para o dashboard' })
  getStats(@CurrentUser('officeId') officeId: string) {
    return this.officeService.getStats(officeId);
  }
}
