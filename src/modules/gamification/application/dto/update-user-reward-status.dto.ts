import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRewardStatus } from '../../../../shared/types/enums';

/**
 * DTO para actualizar el estado de un user reward
 */
export class UpdateUserRewardStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del user reward',
    enum: UserRewardStatus,
    example: UserRewardStatus.DELIVERED,
  })
  @IsEnum(UserRewardStatus, {
    message: 'El estado debe ser uno de: pending, claimed, delivered',
  })
  status: UserRewardStatus;
}
