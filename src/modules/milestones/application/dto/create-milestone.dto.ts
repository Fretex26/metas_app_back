import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
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
    example: 'Recompensa por completar milestone',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre de la recompensa es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la recompensa',
    example: 'Una recompensa especial por completar este milestone',
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

  @ApiPropertyOptional({
    description: 'Recompensa asociada al milestone (opcional)',
    type: CreateRewardDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRewardDto)
  reward?: CreateRewardDto;
}
