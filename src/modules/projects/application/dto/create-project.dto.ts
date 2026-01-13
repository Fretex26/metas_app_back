import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo proyecto
 */
export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Aplicación móvil de productividad',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del proyecto',
    example: 'Una aplicación para mejorar la productividad personal',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Propósito personal del proyecto',
    example: 'Mejorar mi organización y productividad diaria',
  })
  @IsOptional()
  @IsString({ message: 'El propósito debe ser una cadena de texto' })
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Presupuesto del proyecto',
    example: 1000.50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto debe ser un número' })
  budget?: number;

  @ApiPropertyOptional({
    description: 'Fecha final del proyecto',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha final debe tener un formato válido' })
  finalDate?: string;

  @ApiPropertyOptional({
    description: 'Recursos disponibles (JSON)',
    example: { time: '2 horas diarias', tools: ['laptop', 'IDE'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos disponibles deben ser un objeto JSON' })
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos necesarios (JSON)',
    example: { budget: 500, skills: ['React Native'] },
  })
  @IsOptional()
  @IsObject({ message: 'Los recursos necesarios deben ser un objeto JSON' })
  resourcesNeeded?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Calendario del proyecto (JSON)',
    example: { startDate: '2024-01-01', phases: [] },
  })
  @IsOptional()
  @IsObject({ message: 'El calendario debe ser un objeto JSON' })
  schedule?: Record<string, any>;
}
