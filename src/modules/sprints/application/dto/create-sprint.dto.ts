import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo sprint
 */
export class CreateSprintDto {
  @ApiProperty({
    description: 'Nombre del sprint',
    example: 'Sprint 1: Diseño de UI',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del sprint',
    example: 'Sprint enfocado en el diseño de la interfaz de usuario',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Criterios de aceptación',
    example: { nombre: 'Criterio 1', descripcion: 'Todos los componentes deben estar diseñados y aprobados' },
  })
  @IsOptional()
  @IsObject({ message: 'Los criterios de aceptación deben ser un objeto JSON' })
  acceptanceCriteria?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de inicio del sprint',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del sprint',
    example: '2024-01-14',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  endDate: string;

  @ApiPropertyOptional({
    description: 'Recursos disponibles (JSON)',
    example: { time: '2 horas diarias', tools: ['Figma', 'VS Code'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos disponibles deben ser un objeto JSON' })
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos necesarios (JSON)',
    example: { budget: 100, skills: ['UI/UX Design'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos necesarios deben ser un objeto JSON' })
  resourcesNeeded?: Record<string, any>;
}
