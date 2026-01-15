import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para un sponsor
 */
export class SponsorResponseDto {
  @ApiProperty({
    description: 'ID del patrocinador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre de la empresa o negocio',
    example: 'Tech Solutions Inc.',
  })
  businessName: string;

  @ApiProperty({
    description: 'Descripción de la empresa o negocio',
  })
  description: string;

  @ApiProperty({
    description: 'Categoría de la empresa',
    example: 'Technology',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la empresa',
  })
  logoUrl?: string | null;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'contact@techsolutions.com',
  })
  contactEmail: string;

  @ApiProperty({
    description: 'Estado del patrocinador',
    enum: SponsorStatus,
    example: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @ApiPropertyOptional({
    description: 'ID del administrador que revisó la solicitud',
  })
  reviewedBy?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de revisión',
  })
  reviewedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Razón de rechazo (si aplica)',
  })
  rejectionReason?: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
