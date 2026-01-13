import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { SponsoredGoalOrmEntity } from '../persistence/sponsored-goal.orm-entity';
import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de SponsoredGoal
 */
export class SponsoredGoalMapper {
  static toDomain(ormEntity: SponsoredGoalOrmEntity): SponsoredGoal {
    return new SponsoredGoal(
      ormEntity.id,
      ormEntity.sponsorId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.criteria,
      ormEntity.startDate,
      ormEntity.endDate,
      ormEntity.verificationMethod as VerificationMethod,
      ormEntity.rewardId,
      ormEntity.maxUsers,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: SponsoredGoal,
  ): Partial<SponsoredGoalOrmEntity> {
    return {
      id: domainEntity.id,
      sponsorId: domainEntity.sponsorId,
      name: domainEntity.name,
      description: domainEntity.description,
      criteria: domainEntity.criteria,
      startDate: domainEntity.startDate,
      endDate: domainEntity.endDate,
      verificationMethod: domainEntity.verificationMethod as VerificationMethod,
      rewardId: domainEntity.rewardId,
      maxUsers: domainEntity.maxUsers,
    };
  }

  static toDomainList(ormEntities: SponsoredGoalOrmEntity[]): SponsoredGoal[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
