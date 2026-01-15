import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethod } from '../../../../shared/types/enums';
import { CategoryResponseDto } from '../../../categories/application/dto/category-response.dto';

/**
 * DTO de respuesta para un sponsored goal
 */
export class SponsoredGoalResponseDto {
  @ApiProperty({
    description: 'ID del objetivo patrocinado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del patrocinador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sponsorId: string;

  @ApiProperty({
    description: 'ID del proyecto asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Nombre del objetivo patrocinado',
    example: 'Completa 10 tareas este mes',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del objetivo patrocinado',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Categorías asociadas',
    type: [CategoryResponseDto],
  })
  categories?: CategoryResponseDto[];

  @ApiProperty({
    description: 'Fecha de inicio del objetivo',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del objetivo',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Método de verificación',
    enum: VerificationMethod,
  })
  verificationMethod: VerificationMethod;

  @ApiPropertyOptional({
    description: 'ID de la recompensa asociada',
  })
  rewardId?: string | null;

  @ApiProperty({
    description: 'Número máximo de usuarios que pueden inscribirse',
    example: 100,
  })
  maxUsers: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
