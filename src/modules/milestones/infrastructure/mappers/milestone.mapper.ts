import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneOrmEntity } from '../persistence/milestone.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Milestone
 */
export class MilestoneMapper {
  static toDomain(ormEntity: MilestoneOrmEntity): Milestone {
    return new Milestone(
      ormEntity.id,
      ormEntity.projectId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Milestone): Partial<MilestoneOrmEntity> {
    return {
      id: domainEntity.id,
      projectId: domainEntity.projectId,
      name: domainEntity.name,
      description: domainEntity.description,
    };
  }

  static toDomainList(ormEntities: MilestoneOrmEntity[]): Milestone[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
