import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
  IsNumber,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * DTO para crear un nuevo task
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'ID del milestone al que pertenece la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El milestoneId es requerido' })
  @IsUUID('4', { message: 'El milestoneId debe ser un UUID válido' })
  milestoneId: string;

  @ApiPropertyOptional({
    description: 'ID del sprint al que se asigna la tarea (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El sprintId debe ser un UUID válido' })
  sprintId?: string;

  @ApiProperty({
    description: 'Nombre de la tarea',
    example: 'Implementar autenticación',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la tarea',
    example: 'Implementar sistema de autenticación con Firebase',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la tarea',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener un formato válido' },
  )
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin de la tarea',
    example: '2024-01-07',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  endDate: string;

  @ApiPropertyOptional({
    description: 'Recursos disponibles (JSON)',
    example: { time: '1 hora diaria', tools: ['VS Code'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos disponibles deben ser un objeto JSON' })
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos necesarios (JSON)',
    example: { skills: ['Firebase', 'NestJS'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos necesarios deben ser un objeto JSON' })
  resourcesNeeded?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Puntos de incentivo al completar la tarea',
    example: 10,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los puntos de incentivo deben ser un número' })
  @Min(0, { message: 'Los puntos de incentivo no pueden ser negativos' })
  incentivePoints?: number;
}
