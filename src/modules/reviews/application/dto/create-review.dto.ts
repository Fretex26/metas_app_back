import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO para crear un nuevo review
 */
export class CreateReviewDto {
  @ApiProperty({
    description: 'Porcentaje de progreso del sprint (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty({ message: 'El porcentaje de progreso es requerido' })
  @IsNumber({}, { message: 'El porcentaje de progreso debe ser un número' })
  @Min(0, { message: 'El porcentaje de progreso no puede ser menor a 0' })
  @Max(100, { message: 'El porcentaje de progreso no puede ser mayor a 100' })
  progressPercentage: number;

  @ApiPropertyOptional({
    description: 'Puntos extra otorgados en esta revisión',
    example: 5,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los puntos extra deben ser un número' })
  @Min(0, { message: 'Los puntos extra no pueden ser negativos' })
  extraPoints?: number;

  @ApiPropertyOptional({
    description: 'Resumen de la revisión',
    example: 'El sprint fue exitoso, completamos la mayoría de las tareas planificadas',
  })
  @IsOptional()
  @IsString({ message: 'El resumen debe ser una cadena de texto' })
  summary?: string;
}
