import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Difficulty, EnergyChange } from '../../../../shared/types/enums';

/**
 * DTO para crear un nuevo daily entry
 */
export class CreateDailyEntryDto {
  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la tarea debe ser un UUID válido' })
  taskId?: string;

  @ApiPropertyOptional({
    description: 'ID del sprint relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del sprint debe ser un UUID válido' })
  sprintId?: string;

  @ApiProperty({
    description: 'Notas sobre lo que se hizo ayer',
    example: 'Completé la autenticación y el diseño de la base de datos',
  })
  @IsNotEmpty({ message: 'Las notas de ayer son requeridas' })
  @IsString({ message: 'Las notas de ayer deben ser una cadena de texto' })
  notesYesterday: string;

  @ApiProperty({
    description: 'Notas sobre lo que se planea hacer hoy',
    example: 'Implementar el módulo de usuarios y comenzar con proyectos',
  })
  @IsNotEmpty({ message: 'Las notas de hoy son requeridas' })
  @IsString({ message: 'Las notas de hoy deben ser una cadena de texto' })
  notesToday: string;

  @ApiProperty({
    description: 'Nivel de dificultad experimentado',
    enum: Difficulty,
    example: Difficulty.MEDIUM,
  })
  @IsNotEmpty({ message: 'El nivel de dificultad es requerido' })
  @IsEnum(Difficulty, {
    message: 'La dificultad debe ser: low, medium o high',
  })
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Cambio en el nivel de energía',
    enum: EnergyChange,
    example: EnergyChange.STABLE,
  })
  @IsNotEmpty({ message: 'El cambio de energía es requerido' })
  @IsEnum(EnergyChange, {
    message: 'El cambio de energía debe ser: increased, stable o decreased',
  })
  energyChange: EnergyChange;
}
