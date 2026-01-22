import { Project } from '../../domain/entities/project.entity';
import { ProjectOrmEntity } from '../persistence/project.orm-entity';
import { ProjectStatus } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Project
 */
export class ProjectMapper {
  static toDomain(ormEntity: ProjectOrmEntity): Project {
    return new Project(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.purpose,
      ormEntity.budget ? parseFloat(ormEntity.budget.toString()) : null,
      ormEntity.finalDate,
      ormEntity.resourcesAvailable,
      ormEntity.resourcesNeeded,
      ormEntity.sponsoredGoalId ?? null,
      ormEntity.enrollmentId ?? null,
      ormEntity.isActive ?? true,
      ormEntity.status ?? ProjectStatus.PENDING,
      ormEntity.rewardId,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Project): Partial<ProjectOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      name: domainEntity.name,
      description: domainEntity.description,
      purpose: domainEntity.purpose,
      budget: domainEntity.budget,
      finalDate: domainEntity.finalDate,
      resourcesAvailable: domainEntity.resourcesAvailable,
      resourcesNeeded: domainEntity.resourcesNeeded,
      sponsoredGoalId: domainEntity.sponsoredGoalId ?? null,
      enrollmentId: domainEntity.enrollmentId ?? null,
      isActive: domainEntity.isActive ?? true,
      status: domainEntity.status ?? ProjectStatus.PENDING,
      rewardId: domainEntity.rewardId,
    };
  }

  static toDomainList(ormEntities: ProjectOrmEntity[]): Project[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
