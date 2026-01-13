import { DailyEntry } from '../entities/daily-entry.entity';

/**
 * Interfaz del repositorio de daily entries
 */
export interface IDailyEntryRepository {
  create(dailyEntry: DailyEntry): Promise<DailyEntry>;
  findById(id: string): Promise<DailyEntry | null>;
  findByUserId(userId: string): Promise<DailyEntry[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<DailyEntry | null>;
  findByTaskId(taskId: string): Promise<DailyEntry[]>;
  findBySprintId(sprintId: string): Promise<DailyEntry[]>;
  update(dailyEntry: DailyEntry): Promise<DailyEntry>;
  delete(id: string): Promise<void>;
}
