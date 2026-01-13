import { ApiProperty } from '@nestjs/swagger';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * DTO de respuesta detallada para un sponsor
 */
export class SponsorDetailResponseDto {
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
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  userName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  userEmail: string;

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
    description: 'URL del logo',
    required: false,
  })
  logoUrl?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'contact@techsolutions.com',
  })
  contactEmail: string;

  @ApiProperty({
    description: 'Estado del sponsor',
    enum: SponsorStatus,
    example: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @ApiProperty({
    description: 'ID del administrador que revisó',
    required: false,
  })
  reviewedBy?: string;

  @ApiProperty({
    description: 'Nombre del administrador que revisó',
    required: false,
  })
  reviewerName?: string;

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
