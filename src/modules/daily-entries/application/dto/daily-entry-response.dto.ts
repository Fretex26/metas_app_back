import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, EnergyChange } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para un daily entry
 */
export class DailyEntryResponseDto {
  @ApiProperty({
    description: 'ID de la entrada diaria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
  })
  taskId?: string | null;

  @ApiProperty({
    description: 'ID del sprint relacionado',
  })
  sprintId: string;

  @ApiProperty({
    description: 'Notas sobre lo que se hizo ayer',
  })
  notesYesterday: string;

  @ApiProperty({
    description: 'Notas sobre lo que se planea hacer hoy',
  })
  notesToday: string;

  @ApiProperty({
    description: 'Nivel de dificultad',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Cambio en el nivel de energía',
    enum: EnergyChange,
  })
  energyChange: EnergyChange;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
