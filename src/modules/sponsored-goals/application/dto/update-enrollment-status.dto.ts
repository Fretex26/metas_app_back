import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * DTO para actualizar el estado de un enrollment
 */
export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del enrollment',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.INACTIVE,
  })
  @IsEnum(EnrollmentStatus, {
    message: 'El estado debe ser ACTIVE o INACTIVE',
  })
  status: EnrollmentStatus;
}
