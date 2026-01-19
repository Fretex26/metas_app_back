import { Reward } from '../../domain/entities/reward.entity';
import { RewardOrmEntity } from '../persistence/reward.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Reward
 */
export class RewardMapper {
  static toDomain(ormEntity: RewardOrmEntity): Reward {
    return new Reward(
      ormEntity.id,
      ormEntity.sponsorId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.claimInstructions,
      ormEntity.claimLink,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: Reward,
  ): Partial<RewardOrmEntity> {
    return {
      id: domainEntity.id,
      sponsorId: domainEntity.sponsorId,
      name: domainEntity.name,
      description: domainEntity.description ?? undefined,
      claimInstructions: domainEntity.claimInstructions ?? undefined,
      claimLink: domainEntity.claimLink ?? undefined,
    };
  }
}
