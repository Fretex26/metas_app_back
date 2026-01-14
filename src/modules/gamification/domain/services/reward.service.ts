import { Injectable, Inject } from '@nestjs/common';
import type { IUserRewardRepository } from '../repositories/user-reward.repository';
import { UserReward } from '../entities/user-reward.entity';
import { UserRewardStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio de dominio para otorgar rewards automáticamente
 */
@Injectable()
export class RewardService {
  constructor(
    @Inject('IUserRewardRepository')
    private readonly userRewardRepository: IUserRewardRepository,
  ) {}

  /**
   * Otorga un reward a un usuario automáticamente (estado DELIVERED)
   * Si ya existe un UserReward para este usuario y reward, lo actualiza a DELIVERED
   * Si no existe, crea uno nuevo con estado DELIVERED
   */
  async grantReward(
    userId: string,
    rewardId: string,
  ): Promise<UserReward> {
    // Buscar si ya existe un UserReward para este usuario y reward
    const existingUserRewards = await this.userRewardRepository.findByUserId(userId);
    const existingUserReward = existingUserRewards.find(
      (ur) => ur.rewardId === rewardId,
    );

    if (existingUserReward) {
      // Si ya existe, actualizar a DELIVERED
      const updatedUserReward = new UserReward(
        existingUserReward.id,
        existingUserReward.userId,
        existingUserReward.rewardId,
        UserRewardStatus.DELIVERED,
        existingUserReward.claimedAt,
        new Date(), // deliveredAt
        existingUserReward.createdAt,
      );
      return await this.userRewardRepository.update(updatedUserReward);
    } else {
      // Si no existe, crear uno nuevo con estado DELIVERED
      const newUserReward = new UserReward(
        uuidv4(),
        userId,
        rewardId,
        UserRewardStatus.DELIVERED,
        null, // claimedAt
        new Date(), // deliveredAt
        new Date(), // createdAt
      );
      return await this.userRewardRepository.create(newUserReward);
    }
  }
}
