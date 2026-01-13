import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PointsSourceType } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para una transacción de puntos
 */
export class PointsTransactionResponseDto {
  @ApiProperty({
    description: 'ID de la transacción',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Cambio de puntos (positivo para ganancias, negativo para gastos)',
    example: 10,
  })
  change: number;

  @ApiProperty({
    description: 'Razón de la transacción',
    example: 'Completaste una tarea',
  })
  reason: string;

  @ApiProperty({
    description: 'Tipo de fuente',
    enum: PointsSourceType,
    example: PointsSourceType.TASK,
  })
  sourceType: PointsSourceType;

  @ApiPropertyOptional({
    description: 'ID de la fuente (tarea, badge, etc.)',
  })
  sourceId?: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
