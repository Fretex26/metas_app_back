import { ApiProperty } from '@nestjs/swagger';
import { UserRewardStatus } from '../../../../shared/types/enums';

/**
 * DTO de respuesta para UserReward
 */
export class UserRewardResponseDto {
  @ApiProperty({
    description: 'ID del user reward',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'ID de la recompensa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  rewardId: string;

  @ApiProperty({
    description: 'Estado del user reward',
    enum: UserRewardStatus,
    example: UserRewardStatus.PENDING,
  })
  status: UserRewardStatus;

  @ApiProperty({
    description: 'Fecha en que se reclamó la recompensa',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  claimedAt: Date | null;

  @ApiProperty({
    description: 'Fecha en que se entregó la recompensa',
    example: '2024-01-16T10:30:00Z',
    nullable: true,
  })
  deliveredAt: Date | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-10T10:30:00Z',
  })
  createdAt: Date;
}
