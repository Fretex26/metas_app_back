import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * DTO para actualizar un objetivo patrocinado (campos opcionales).
 * Solo se envían los campos a modificar.
 */
export class UpdateSponsoredGoalDto {
  @ApiPropertyOptional({
    description: 'Nombre del objetivo patrocinado',
    example: 'Completa 10 tareas este mes',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del objetivo patrocinado',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'IDs de las categorías asociadas',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de categoría debe ser un UUID válido',
  })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de inicio del objetivo',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del objetivo',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Método de verificación',
    enum: VerificationMethod,
  })
  @IsOptional()
  @IsEnum(VerificationMethod, {
    message:
      'El método de verificación debe ser uno de: qr, checklist, manual, external_api',
  })
  verificationMethod?: VerificationMethod;

  @ApiPropertyOptional({
    description: 'ID de la recompensa asociada. Omitir para no cambiar.',
  })
  @IsOptional()
  @IsUUID('4')
  rewardId?: string;

  @ApiPropertyOptional({
    description: 'Número máximo de usuarios que pueden inscribirse',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'El número máximo de usuarios debe ser al menos 1' })
  maxUsers?: number;
}
