import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un review
 */
export class ReviewResponseDto {
  @ApiProperty({
    description: 'ID de la revisión',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sprintId: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Porcentaje de progreso del sprint (0-100)',
    example: 75,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Puntos extra otorgados',
    example: 5,
  })
  extraPoints: number;

  @ApiPropertyOptional({
    description: 'Resumen de la revisión',
  })
  summary?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
