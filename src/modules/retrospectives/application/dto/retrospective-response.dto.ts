import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un retrospective
 */
export class RetrospectiveResponseDto {
  @ApiProperty({
    description: 'ID de la retrospectiva',
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
    description: 'Lo que salió bien durante el sprint',
  })
  whatWentWell: string;

  @ApiProperty({
    description: 'Lo que salió mal durante el sprint',
  })
  whatWentWrong: string;

  @ApiPropertyOptional({
    description: 'Mejoras propuestas para futuros sprints',
  })
  improvements?: string;

  @ApiProperty({
    description: 'Indica si la retrospectiva es pública',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
