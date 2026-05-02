import { DailyEntry } from '../entities/daily-entry.entity';

/**
 * Interfaz del repositorio de daily entries
 */
export interface IDailyEntryRepository {
  create(dailyEntry: DailyEntry): Promise<DailyEntry>;
  findById(id: string): Promise<DailyEntry | null>;
  findByUserId(userId: string): Promise<DailyEntry[]>;
  findByUserIdAndDate(
    userId: string,
    dateYmd: string,
    timeZoneOffsetMinutes: number,
  ): Promise<DailyEntry | null>;
  /** Entrada del usuario para una fecha civil (YYYY-MM-DD) y un sprint, según TZ del cliente. */
  findByUserIdAndDateAndSprintId(
    userId: string,
    dateYmd: string,
    sprintId: string,
    timeZoneOffsetMinutes: number,
  ): Promise<DailyEntry | null>;
  findByTaskId(taskId: string): Promise<DailyEntry[]>;
  findBySprintId(sprintId: string): Promise<DailyEntry[]>;
  update(dailyEntry: DailyEntry): Promise<DailyEntry>;
  delete(id: string): Promise<void>;
}
