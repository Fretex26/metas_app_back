import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  IsUUID,
  MaxLength,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear una recompensa
 */
export class CreateRewardDto {
  @ApiProperty({
    description: 'Nombre de la recompensa',
    example: 'Recompensa por completar proyecto',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre de la recompensa es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la recompensa',
    example: 'Una recompensa especial por completar este proyecto',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones para reclamar la recompensa',
    example: 'Contacta con el administrador para reclamar tu recompensa',
  })
  @IsOptional()
  @IsString({ message: 'Las instrucciones deben ser una cadena de texto' })
  claimInstructions?: string;

  @ApiPropertyOptional({
    description: 'Link para reclamar la recompensa',
    example: 'https://example.com/claim-reward',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({}, { message: 'El link debe ser una URL válida' })
  @MaxLength(500, { message: 'El link no puede exceder 500 caracteres' })
  claimLink?: string;
}

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
    example: 1000.5,
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

  @ApiProperty({
    description: 'Recompensa asociada al proyecto (obligatoria)',
    type: CreateRewardDto,
  })
  @IsNotEmpty({ message: 'La recompensa es requerida' })
  @ValidateNested()
  @Type(() => CreateRewardDto)
  reward: CreateRewardDto;
}
