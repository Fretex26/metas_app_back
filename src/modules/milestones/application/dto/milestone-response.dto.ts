import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un milestone
 */
export class MilestoneResponseDto {
  @ApiProperty({
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Nombre del milestone',
    example: 'Fase 1: Diseño',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del milestone',
  })
  description?: string;

  @ApiProperty({
    description: 'Estado del milestone',
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed'],
  })
  status: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
