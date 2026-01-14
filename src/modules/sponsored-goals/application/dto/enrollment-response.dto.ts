import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para un enrollment
 */
export class EnrollmentResponseDto {
  @ApiProperty({
    description: 'ID del enrollment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del objetivo patrocinado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sponsoredGoalId: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Estado del enrollment',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @ApiProperty({
    description: 'Fecha de inscripción',
    example: '2024-01-01T00:00:00.000Z',
  })
  enrolledAt: Date;
}
