import { ApiProperty } from '@nestjs/swagger';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para listado de sponsors
 */
export class SponsorListItemDto {
  @ApiProperty({
    description: 'ID del sponsor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tech Solutions S.A.',
  })
  businessName: string;

  @ApiProperty({
    description: 'Descripción del negocio',
    example: 'Empresa dedicada a soluciones tecnológicas',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Categoría del negocio',
    example: 'Technology',
    required: false,
  })
  category?: string;

  @ApiProperty({
    description: 'Estado del sponsor',
    enum: SponsorStatus,
    example: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @ApiProperty({
    description: 'Fecha de revisión',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Razón de rechazo',
    required: false,
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
