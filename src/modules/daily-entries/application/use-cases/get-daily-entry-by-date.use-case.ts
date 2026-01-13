import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';

/**
 * Caso de uso para obtener un daily entry por fecha
 */
@Injectable()
export class GetDailyEntryByDateUseCase {
  constructor(
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(userId: string, date: Date): Promise<DailyEntry | null> {
    return await this.dailyEntryRepository.findByUserIdAndDate(userId, date);
  }
}
