import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/swagger';

export enum UserRole { OWNER = 'OWNER', ADMIN = 'ADMIN', FISCAL = 'FISCAL', CONTABIL = 'CONTABIL', DP = 'DP', AUXILIAR = 'AUXILIAR' }

export class CreateUserDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsEnum(UserRole) role: UserRole;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class ChangePasswordDto {
  @IsString() @MinLength(6) newPassword: string;
}
