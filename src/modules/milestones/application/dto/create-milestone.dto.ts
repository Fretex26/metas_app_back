import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo milestone
 */
export class CreateMilestoneDto {
  @ApiProperty({
    description: 'Nombre del milestone',
    example: 'Fase 1: Diseño',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del milestone',
    example: 'Completar el diseño de la interfaz de usuario',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;
}
