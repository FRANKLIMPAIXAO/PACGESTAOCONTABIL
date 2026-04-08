import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({ example: 'Construtora Horizonte Ltda' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: '12.345.678/0001-90', description: 'CPF ou CNPJ' })
  @IsString()
  @IsNotEmpty({ message: 'Documento é obrigatório' })
  document: string;

  @ApiPropertyOptional({ example: 'joao@horizonte.com.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0001' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ClientType, default: ClientType.PJ })
  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;
}

export class UpdateClientDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ClientType })
  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;
}
