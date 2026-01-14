import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un proyecto
 */
export class ProjectResponseDto {
  @ApiProperty({
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Aplicación móvil de productividad',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del proyecto',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Propósito personal del proyecto',
  })
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Presupuesto del proyecto',
  })
  budget?: number;

  @ApiPropertyOptional({
    description: 'Fecha final del proyecto',
  })
  finalDate?: Date;

  @ApiPropertyOptional({
    description: 'Recursos disponibles (JSON)',
  })
  resourcesAvailable?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos necesarios (JSON)',
  })
  resourcesNeeded?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Calendario del proyecto (JSON)',
  })
  schedule?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID del objetivo patrocinado (si es un proyecto patrocinado)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sponsoredGoalId?: string | null;

  @ApiPropertyOptional({
    description: 'ID de la inscripción (si es un proyecto patrocinado)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  enrollmentId?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si el proyecto está activo (visible para el usuario)',
    example: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID de la recompensa asociada al proyecto (obligatorio)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  rewardId: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
