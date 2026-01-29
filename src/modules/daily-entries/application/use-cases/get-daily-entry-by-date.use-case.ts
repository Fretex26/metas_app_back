import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';

/**
 * Caso de uso para obtener un daily entry por fecha y sprint.
 * Cada daily entry pertenece a un sprint; se filtra por ambos para evitar devolver
 * la entrada de otro sprint (p. ej. en la página de detalle de un sprint).
 */
@Injectable()
export class GetDailyEntryByDateUseCase {
  constructor(
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(
    userId: string,
    date: Date,
    sprintId: string,
  ): Promise<DailyEntry> {
    const entry = await this.dailyEntryRepository.findByUserIdAndDateAndSprintId(
      userId,
      date,
      sprintId,
    );
    if (!entry) {
      throw new NotFoundException(
        `No se encontró entrada diaria para la fecha indicada en este sprint`,
      );
    }
    return entry;
  }
}
