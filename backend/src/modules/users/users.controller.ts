import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar colaboradores do escritório' })
  findAll(@CurrentUser('officeId') officeId: string) {
    return this.usersService.findAll(officeId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário logado' })
  me(@CurrentUser('sub') id: string, @CurrentUser('officeId') officeId: string) {
    return this.usersService.findOne(id, officeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.usersService.findOne(id, officeId);
  }

  @Post()
  @ApiOperation({ summary: 'Convidar/criar novo colaborador' })
  create(@Body() dto: CreateUserDto, @CurrentUser('officeId') officeId: string) {
    return this.usersService.create(dto, officeId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('officeId') officeId: string,
    @CurrentUser('sub') requesterId: string,
  ) {
    return this.usersService.update(id, dto, officeId, requesterId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Ativar ou desativar colaborador' })
  toggleActive(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.usersService.toggleActive(id, officeId);
  }

  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.usersService.changePassword(id, dto, officeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.usersService.remove(id, officeId);
  }
}
