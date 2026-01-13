import { Injectable, Inject } from '@nestjs/common';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';
import { CreateDailyEntryDto } from '../dto/create-daily-entry.dto';
import { v4 as uuidv4 } from 'uuid';

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
    // Crear la entidad de dominio
    const dailyEntry = new DailyEntry(
      uuidv4(),
      userId,
      createDailyEntryDto.taskId || null,
      createDailyEntryDto.sprintId || null,
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
