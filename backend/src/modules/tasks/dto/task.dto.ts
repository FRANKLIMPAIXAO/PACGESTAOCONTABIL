import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export enum TaskStatus { BACKLOG = 'BACKLOG', TODO = 'TODO', DOING = 'DOING', REVIEW = 'REVIEW', DONE = 'DONE' }
export enum TaskPriority { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', URGENT = 'URGENT' }

export class CreateTaskDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(TaskStatus) @IsOptional() status?: TaskStatus;
  @IsEnum(TaskPriority) @IsOptional() priority?: TaskPriority;
  @IsDateString() @IsOptional() dueDate?: string;
  @IsUUID() @IsOptional() clientId?: string;
  @IsUUID() @IsOptional() assignedToId?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
