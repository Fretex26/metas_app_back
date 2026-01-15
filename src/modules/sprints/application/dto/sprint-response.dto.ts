import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un sprint
 */
export class SprintResponseDto {
  @ApiProperty({
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  milestoneId: string;

  @ApiProperty({
    description: 'Nombre del sprint',
    example: 'Sprint 1: Diseño de UI',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del sprint',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Criterios de aceptación',
  })
  acceptanceCriteria?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de inicio del sprint',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del sprint',
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
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
