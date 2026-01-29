import { UserReward } from '../entities/user-reward.entity';

/**
 * Interfaz del repositorio de user reward
 */
export interface IUserRewardRepository {
  findById(id: string): Promise<UserReward | null>;
  findByIdWithReward(
    id: string,
  ): Promise<{ userReward: UserReward; rewardSponsorId: string | null } | null>;
  findByRewardId(rewardId: string): Promise<UserReward[]>;
  findByUserId(userId: string): Promise<UserReward[]>;
  create(userReward: UserReward): Promise<UserReward>;
  update(userReward: UserReward): Promise<UserReward>;
}
