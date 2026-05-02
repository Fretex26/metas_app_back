import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';
import { CreateDailyEntryDto } from '../dto/create-daily-entry.dto';
import { v4 as uuidv4 } from 'uuid';
import { utcYmdFromDate } from '../../../../shared/utils/daily-entry-day-bounds.util';

/**
 * Caso de uso para crear un nuevo daily entry
 */
@Injectable()
export class CreateDailyEntryUseCase {
  constructor(
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(
    createDailyEntryDto: CreateDailyEntryDto,
    userId: string,
  ): Promise<DailyEntry> {
    // Misma fecha civil y desfase que el cliente (evita desajuste con la zona del servidor).
    const timeZoneOffsetMinutes =
      createDailyEntryDto.timezoneOffsetMinutes ?? 0;
    const dateYmd =
      createDailyEntryDto.localDate?.trim() || utcYmdFromDate(new Date());
    const existingEntry =
      await this.dailyEntryRepository.findByUserIdAndDateAndSprintId(
        userId,
        dateYmd,
        createDailyEntryDto.sprintId,
        timeZoneOffsetMinutes,
      );

    if (existingEntry) {
      throw new ConflictException(
        'Ya existe una entrada diaria para hoy en este sprint. Solo se permite una por día y sprint.',
      );
    }

    // Crear la entidad de dominio
    const dailyEntry = new DailyEntry(
      uuidv4(),
      userId,
      createDailyEntryDto.taskId || null,
      createDailyEntryDto.sprintId,
      createDailyEntryDto.notesYesterday,
      createDailyEntryDto.notesToday,
      createDailyEntryDto.difficulty,
      createDailyEntryDto.energyChange,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.dailyEntryRepository.create(dailyEntry);
  }
}
