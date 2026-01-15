import { UserReward } from '../../domain/entities/user-reward.entity';
import { UserRewardOrmEntity } from '../persistence/user-reward.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de UserReward
 */
export class UserRewardMapper {
  static toDomain(ormEntity: UserRewardOrmEntity): UserReward {
    return new UserReward(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.rewardId,
      ormEntity.status,
      ormEntity.claimedAt,
      ormEntity.deliveredAt,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: UserReward,
  ): Partial<UserRewardOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      rewardId: domainEntity.rewardId,
      status: domainEntity.status,
      claimedAt: domainEntity.claimedAt,
      deliveredAt: domainEntity.deliveredAt,
    };
  }
}
