import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para estadísticas generales del usuario
 */
export class UserStatisticsResponseDto {
  @ApiProperty({
    description: 'Total de puntos del usuario',
    example: 500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Número de badges obtenidos',
    example: 5,
  })
  badgesCount: number;

  @ApiProperty({
    description: 'Número de proyectos activos',
    example: 3,
  })
  activeProjectsCount: number;

  @ApiProperty({
    description: 'Número de tareas completadas',
    example: 25,
  })
  completedTasksCount: number;
}
