import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
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
 * DTO para crear un nuevo sponsored goal
 */
export class CreateSponsoredGoalDto {
  @ApiProperty({
    description: 'Nombre del objetivo patrocinado',
    example: 'Completa 10 tareas este mes',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del objetivo patrocinado',
    example: 'Completa 10 tareas en tu proyecto personal durante este mes',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({
    description: 'ID del proyecto asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El ID del proyecto es requerido' })
  @IsUUID('4', { message: 'El ID del proyecto debe ser un UUID válido' })
  projectId: string;

  @ApiPropertyOptional({
    description: 'IDs de las categorías asociadas',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser un array' })
  @IsUUID('4', { each: true, message: 'Cada ID de categoría debe ser un UUID válido' })
  categoryIds?: string[];

  @ApiProperty({
    description: 'Fecha de inicio del objetivo',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del objetivo',
    example: '2024-01-31',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  endDate: string;

  @ApiProperty({
    description: 'Método de verificación',
    enum: VerificationMethod,
    example: VerificationMethod.CHECKLIST,
  })
  @IsNotEmpty({ message: 'El método de verificación es requerido' })
  @IsEnum(VerificationMethod, {
    message: 'El método de verificación debe ser uno de: qr, checklist, manual, external_api',
  })
  verificationMethod: VerificationMethod;

  @ApiPropertyOptional({
    description: 'ID de la recompensa asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la recompensa debe ser un UUID válido' })
  rewardId?: string;

  @ApiProperty({
    description: 'Número máximo de usuarios que pueden inscribirse',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'El número máximo de usuarios es requerido' })
  @IsNumber({}, { message: 'El número máximo de usuarios debe ser un número' })
  @Min(1, { message: 'El número máximo de usuarios debe ser al menos 1' })
  maxUsers: number;
}
