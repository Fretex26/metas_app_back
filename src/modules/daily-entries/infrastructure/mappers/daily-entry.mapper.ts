import { DailyEntry } from '../../domain/entities/daily-entry.entity';
import { DailyEntryOrmEntity } from '../persistence/daily-entry.orm-entity';
import { Difficulty, EnergyChange } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de DailyEntry
 */
export class DailyEntryMapper {
  static toDomain(ormEntity: DailyEntryOrmEntity): DailyEntry {
    return new DailyEntry(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.taskId,
      ormEntity.sprintId,
      ormEntity.notesYesterday,
      ormEntity.notesToday,
      ormEntity.difficulty as 'low' | 'medium' | 'high',
      ormEntity.energyChange as 'increased' | 'stable' | 'decreased',
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: DailyEntry,
  ): Partial<DailyEntryOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      taskId: domainEntity.taskId,
      sprintId: domainEntity.sprintId,
      notesYesterday: domainEntity.notesYesterday,
      notesToday: domainEntity.notesToday,
      difficulty: domainEntity.difficulty as Difficulty,
      energyChange: domainEntity.energyChange as EnergyChange,
    };
  }

  static toDomainList(ormEntities: DailyEntryOrmEntity[]): DailyEntry[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
