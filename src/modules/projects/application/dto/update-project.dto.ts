import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

/**
 * DTO para actualizar un proyecto existente
 */
export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Nombre del proyecto',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del proyecto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Propósito personal del proyecto' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Presupuesto del proyecto' })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: 'Fecha final del proyecto' })
  @IsOptional()
  @IsDateString()
  finalDate?: string;

  @ApiPropertyOptional({ description: 'Recursos disponibles (JSON)' })
  @IsOptional()
  @IsObject()
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Recursos necesarios (JSON)' })
  @IsOptional()
  @IsObject()
  resourcesNeeded?: Record<string, any>;
}
