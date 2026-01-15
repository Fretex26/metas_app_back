import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para el progreso del proyecto
 */
export class ProjectProgressResponseDto {
  @ApiProperty({
    description: 'Porcentaje de progreso del proyecto (0-100)',
    example: 75,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Número de tareas completadas',
    example: 15,
  })
  completedTasks: number;

  @ApiProperty({
    description: 'Número total de tareas del proyecto',
    example: 20,
  })
  totalTasks: number;
}
