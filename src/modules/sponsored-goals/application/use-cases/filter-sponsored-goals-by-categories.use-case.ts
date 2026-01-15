import { Injectable, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';

/**
 * Caso de uso para filtrar objetivos patrocinados por categorías
 */
@Injectable()
export class FilterSponsoredGoalsByCategoriesUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
  ) {}

  async execute(categoryIds: string[]): Promise<SponsoredGoal[]> {
    if (!categoryIds || categoryIds.length === 0) {
      // Si no se proporcionan categorías, retornar todos los disponibles
      return await this.sponsoredGoalRepository.findAvailableGoals();
    }

    // Filtrar por las categorías especificadas
    return await this.sponsoredGoalRepository.findByCategoryIds(categoryIds);
  }
}
