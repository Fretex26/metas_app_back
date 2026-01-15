import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un task
 */
export class TaskResponseDto {
  @ApiProperty({
    description: 'ID de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del milestone al que pertenece la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  milestoneId: string;

  @ApiPropertyOptional({
    description: 'ID del sprint al que está asignada la tarea (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sprintId?: string | null;

  @ApiProperty({
    description: 'Nombre de la tarea',
    example: 'Implementar autenticación',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la tarea',
  })
  description?: string;

  @ApiProperty({
    description: 'Estado de la tarea',
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed'],
  })
  status: string;

  @ApiProperty({
    description: 'Fecha de inicio de la tarea',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin de la tarea',
  })
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Recursos disponibles (JSON)',
  })
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos necesarios (JSON)',
  })
  resourcesNeeded?: Record<string, any>;

  @ApiProperty({
    description: 'Puntos de incentivo al completar la tarea',
    example: 10,
  })
  incentivePoints: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
