import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tarefas')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarefas do escritório' })
  findAll(
    @CurrentUser('officeId') officeId: string,
    @Query('status') status?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.tasksService.findAll(officeId, { status, assignedToId, clientId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.tasksService.findOne(id, officeId);
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('officeId') officeId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tasksService.create(dto, officeId, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser('officeId') officeId: string) {
    return this.tasksService.update(id, dto, officeId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mover tarefa no kanban' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('officeId') officeId: string,
  ) {
    return this.tasksService.update(id, { status: status as any }, officeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('officeId') officeId: string) {
    return this.tasksService.remove(id, officeId);
  }
}
