import { Sprint } from '../../domain/entities/sprint.entity';
import { SprintOrmEntity } from '../persistence/sprint.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Sprint
 */
export class SprintMapper {
  static toDomain(ormEntity: SprintOrmEntity): Sprint {
    return new Sprint(
      ormEntity.id,
      ormEntity.milestoneId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.acceptanceCriteria,
      ormEntity.startDate,
      ormEntity.endDate,
      ormEntity.resourcesAvailable,
      ormEntity.resourcesNeeded,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Sprint): Partial<SprintOrmEntity> {
    return {
      id: domainEntity.id,
      milestoneId: domainEntity.milestoneId,
      name: domainEntity.name,
      description: domainEntity.description,
      acceptanceCriteria: domainEntity.acceptanceCriteria,
      startDate: domainEntity.startDate,
      endDate: domainEntity.endDate,
      resourcesAvailable: domainEntity.resourcesAvailable,
      resourcesNeeded: domainEntity.resourcesNeeded,
    };
  }

  static toDomainList(ormEntities: SprintOrmEntity[]): Sprint[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
