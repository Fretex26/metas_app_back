import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para una categoría
 */
export class CategoryResponseDto {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Tecnología',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
