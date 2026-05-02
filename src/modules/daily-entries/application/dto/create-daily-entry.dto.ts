import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiProperty({
    description: 'ID del sprint relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El ID del sprint es requerido' })
  @IsUUID('4', { message: 'El ID del sprint debe ser un UUID válido' })
  sprintId: string;

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

  @ApiPropertyOptional({
    description:
      'Fecha civil local del daily (YYYY-MM-DD). Recomendado para alinear "hoy" con el dispositivo.',
    example: '2026-05-02',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'localDate debe ser YYYY-MM-DD',
  })
  localDate?: string;

  @ApiPropertyOptional({
    description:
      'Desfase respecto a UTC en minutos (DateTime.timeZoneOffset.inMinutes en Flutter).',
    example: 120,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-840)
  @Max(840)
  timezoneOffsetMinutes?: number;
}
