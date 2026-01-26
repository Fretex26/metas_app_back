import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
  IsNumber,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * DTO para actualizar un task existente
 */
export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Nombre de la tarea',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio de la tarea' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin de la tarea' })
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

  @ApiPropertyOptional({
    description: 'Puntos de incentivo al completar la tarea',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  incentivePoints?: number;

  @ApiPropertyOptional({
    description: 'ID del sprint al que se asigna la tarea (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El sprintId debe ser un UUID válido' })
  sprintId?: string;
}
