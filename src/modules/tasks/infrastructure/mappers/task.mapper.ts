import { Task } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from '../persistence/task.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Task
 */
export class TaskMapper {
  static toDomain(ormEntity: TaskOrmEntity): Task {
    return new Task(
      ormEntity.id,
      ormEntity.sprintId,
      ormEntity.name,
      ormEntity.description,
      ormEntity.startDate,
      ormEntity.endDate,
      ormEntity.resourcesAvailable,
      ormEntity.resourcesNeeded,
      ormEntity.incentivePoints,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Task): Partial<TaskOrmEntity> {
    return {
      id: domainEntity.id,
      sprintId: domainEntity.sprintId,
      name: domainEntity.name,
      description: domainEntity.description,
      startDate: domainEntity.startDate,
      endDate: domainEntity.endDate,
      resourcesAvailable: domainEntity.resourcesAvailable,
      resourcesNeeded: domainEntity.resourcesNeeded,
      incentivePoints: domainEntity.incentivePoints,
    };
  }

  static toDomainList(ormEntities: TaskOrmEntity[]): Task[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
