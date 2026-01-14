import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistItemOrmEntity } from '../persistence/checklist-item.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de ChecklistItem
 */
export class ChecklistItemMapper {
  static toDomain(ormEntity: ChecklistItemOrmEntity): ChecklistItem {
    return new ChecklistItem(
      ormEntity.id,
      ormEntity.taskId,
      ormEntity.sponsoredGoalId,
      ormEntity.description,
      ormEntity.isRequired,
      ormEntity.isChecked,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: ChecklistItem,
  ): Partial<ChecklistItemOrmEntity> {
    return {
      id: domainEntity.id,
      taskId: domainEntity.taskId,
      sponsoredGoalId: domainEntity.sponsoredGoalId,
      description: domainEntity.description,
      isRequired: domainEntity.isRequired,
      isChecked: domainEntity.isChecked,
    };
  }

  static toDomainList(ormEntities: ChecklistItemOrmEntity[]): ChecklistItem[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
