import { Injectable, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';

/**
 * Caso de uso para listar objetivos patrocinados disponibles
 */
@Injectable()
export class ListAvailableSponsoredGoalsUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
  ) {}

  async execute(): Promise<SponsoredGoal[]> {
    // Obtener objetivos activos (fechas válidas)
    const goals = await this.sponsoredGoalRepository.findAvailableGoals();

    // Nota: La validación de cupo disponible (max_users) se hace en el use case de enrollment
    return goals;
  }
}
