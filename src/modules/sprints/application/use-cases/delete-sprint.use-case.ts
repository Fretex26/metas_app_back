import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IReviewRepository } from '../../../reviews/domain/repositories/review.repository';
import type { IRetrospectiveRepository } from '../../../retrospectives/domain/repositories/retrospective.repository';
import type { IDailyEntryRepository } from '../../../daily-entries/domain/repositories/daily-entry.repository';

/**
 * Caso de uso para eliminar un sprint
 * 
 * Elimina en cascada:
 * - La review del sprint (si existe, relación 1:1)
 * - La retrospective del sprint (si existe, relación 1:1)
 * - Todos los daily entries relacionados con el sprint
 * 
 * Nota: Las tasks que tienen este sprintId NO se eliminan, solo quedan sin sprint asignado
 * (sprintId = null), ya que las tasks pertenecen al milestone, no al sprint.
 */
@Injectable()
export class DeleteSprintUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(sprintId: string, userId: string): Promise<void> {
    // Obtener el sprint para verificar ownership
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Verificar ownership
    const milestone = await this.milestoneRepository.findById(
      sprint.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este sprint',
      );
    }

    // Eliminar review si existe (relación 1:1)
    const review = await this.reviewRepository.findBySprintId(sprintId);
    if (review) {
      await this.reviewRepository.delete(review.id);
    }

    // Eliminar retrospective si existe (relación 1:1)
    const retrospective = await this.retrospectiveRepository.findBySprintId(sprintId);
    if (retrospective) {
      await this.retrospectiveRepository.delete(retrospective.id);
    }

    // Eliminar daily entries relacionados con el sprint
    const dailyEntries = await this.dailyEntryRepository.findBySprintId(sprintId);
    for (const dailyEntry of dailyEntries) {
      await this.dailyEntryRepository.delete(dailyEntry.id);
    }

    // Finalmente eliminar el sprint
    // Nota: Las tasks que tienen este sprintId quedarán con sprintId = null
    // (no se eliminan porque pertenecen al milestone, no al sprint)
    await this.sprintRepository.delete(sprintId);
  }
}
