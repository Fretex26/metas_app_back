import { Injectable, Inject } from '@nestjs/common';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';

/**
 * Caso de uso para obtener todos los daily entries de un usuario
 */
@Injectable()
export class GetUserDailyEntriesUseCase {
  constructor(
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(userId: string): Promise<DailyEntry[]> {
    return await this.dailyEntryRepository.findByUserId(userId);
  }
}
