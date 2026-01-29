import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  IsArray,
  IsUUID,
} from 'class-validator';

/**
 * DTO para actualizar un usuario existente
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'IDs de las categorías de interés del usuario',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de categoría debe ser un UUID válido',
  })
  categoryIds?: string[];
}
