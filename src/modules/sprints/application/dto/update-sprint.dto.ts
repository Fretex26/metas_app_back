import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

/**
 * DTO para actualizar un sprint existente
 */
export class UpdateSprintDto {
  @ApiPropertyOptional({
    description: 'Nombre del sprint',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del sprint' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Criterios de aceptación' })
  @IsOptional()
  @IsObject()
  acceptanceCriteria?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fecha de inicio del sprint' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del sprint' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Recursos disponibles (JSON)' })
  @IsOptional()
  @IsObject()
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Recursos necesarios (JSON)' })
  @IsOptional()
  @IsObject()
  resourcesNeeded?: Record<string, any>;
}
