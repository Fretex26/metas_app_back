import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para sprints pendientes de review o retrospectiva
 */
export class PendingSprintsResponseDto {
  @ApiProperty({
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sprintId: string;

  @ApiProperty({
    description: 'Nombre del sprint',
    example: 'Sprint 1',
  })
  sprintName: string;

  @ApiProperty({
    description: 'Fecha de finalización del sprint',
    example: '2026-01-25T00:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Proyecto 1',
  })
  projectName: string;

  @ApiProperty({
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  milestoneId: string;

  @ApiProperty({
    description: 'Nombre del milestone',
    example: 'Milestone 1',
  })
  milestoneName: string;

  @ApiProperty({
    description: 'Indica si el sprint necesita review',
    example: true,
  })
  needsReview: boolean;

  @ApiProperty({
    description: 'Indica si el sprint necesita retrospectiva',
    example: true,
  })
  needsRetrospective: boolean;
}
