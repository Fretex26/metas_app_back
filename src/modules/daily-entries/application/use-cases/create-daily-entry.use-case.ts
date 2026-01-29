import { Injectable, Inject, ConflictException } from '@nestjs/common';
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
    // Validar que no exista ya una entrada diaria para el día actual en este sprint.
    // Cada daily entry pertenece a un sprint; se permite una por usuario por día por sprint.
    const today = new Date();
    const existingEntry =
      await this.dailyEntryRepository.findByUserIdAndDateAndSprintId(
        userId,
        today,
        createDailyEntryDto.sprintId,
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
