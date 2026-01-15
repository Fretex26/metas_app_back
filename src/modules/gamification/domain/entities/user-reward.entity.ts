import { UserRewardStatus } from '../../../../shared/types/enums';

/**
 * Entidad de dominio UserReward
 * Representa una recompensa otorgada a un usuario
 */
export class UserReward {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly rewardId: string,
    public readonly status: UserRewardStatus,
    public readonly claimedAt: Date | null,
    public readonly deliveredAt: Date | null,
    public readonly createdAt: Date,
  ) {}
}
