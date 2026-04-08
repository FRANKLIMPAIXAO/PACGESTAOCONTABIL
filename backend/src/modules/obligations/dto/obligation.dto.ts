import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export enum ObligationCategory {
  FISCAL = 'FISCAL', CONTABIL = 'CONTABIL', TRABALHISTA = 'TRABALHISTA',
  PREVIDENCIARIA = 'PREVIDENCIARIA', MUNICIPAL = 'MUNICIPAL', OUTROS = 'OUTROS',
}

export class CreateObligationDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(ObligationCategory) category: ObligationCategory;
  @IsString() @IsNotEmpty() frequency: string; // MONTHLY | ANNUAL | QUARTERLY
  @IsInt() @Min(1) @Max(31) dueDay: number;
}

export class UpdateObligationDto extends PartialType(CreateObligationDto) {}

export class CreateClientObligationDto {
  @IsString() @IsNotEmpty() clientId: string;
  @IsString() @IsNotEmpty() obligationId: string;
}
