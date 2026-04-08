import { IsString, IsOptional } from 'class-validator';

export class UpdateOfficeDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() cnpj?: string;
}
