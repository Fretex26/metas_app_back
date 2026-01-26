import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * DTO para crear un nuevo review
 * El progressPercentage se calcula automáticamente según las tareas completadas del proyecto
 */
export class CreateReviewDto {
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

  @ApiProperty({
    description: 'Resumen de la revisión',
    example:
      'El sprint fue exitoso, completamos la mayoría de las tareas planificadas',
  })
  @IsNotEmpty({ message: 'El resumen es requerido' })
  @IsString({ message: 'El resumen debe ser una cadena de texto' })
  summary: string;
}
