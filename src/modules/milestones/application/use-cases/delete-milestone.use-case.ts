import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../../tasks/domain/repositories/checklist-item.repository';
import type { IReviewRepository } from '../../../reviews/domain/repositories/review.repository';
import type { IRetrospectiveRepository } from '../../../retrospectives/domain/repositories/retrospective.repository';
import type { IDailyEntryRepository } from '../../../daily-entries/domain/repositories/daily-entry.repository';

/**
 * Caso de uso para eliminar un milestone
 * 
 * Elimina en cascada:
 * - Todos los sprints del milestone
 * - Todas las reviews de esos sprints
 * - Todas las retrospectives de esos sprints
 * - Todas las tasks del milestone
 * - Todos los checklist items de esas tasks
 * - Todos los daily entries relacionados (con taskId o sprintId)
 */
@Injectable()
export class DeleteMilestoneUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(milestoneId: string, userId: string): Promise<void> {
    // Obtener el milestone para verificar ownership
    const milestone = await this.milestoneRepository.findById(milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Verificar ownership del proyecto
    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este milestone',
      );
    }

    // Obtener todos los sprints del milestone
    const sprints = await this.sprintRepository.findByMilestoneId(milestoneId);

    // Para cada sprint, eliminar reviews, retrospectives y daily entries
    for (const sprint of sprints) {
      // Eliminar review si existe (relación 1:1)
      const review = await this.reviewRepository.findBySprintId(sprint.id);
      if (review) {
        await this.reviewRepository.delete(review.id);
      }

      // Eliminar retrospective si existe (relación 1:1)
      const retrospective = await this.retrospectiveRepository.findBySprintId(sprint.id);
      if (retrospective) {
        await this.retrospectiveRepository.delete(retrospective.id);
      }

      // Eliminar daily entries relacionados con el sprint
      const dailyEntriesBySprint = await this.dailyEntryRepository.findBySprintId(sprint.id);
      for (const dailyEntry of dailyEntriesBySprint) {
        await this.dailyEntryRepository.delete(dailyEntry.id);
      }

      // Eliminar el sprint
      await this.sprintRepository.delete(sprint.id);
    }

    // Obtener todas las tasks del milestone
    const tasks = await this.taskRepository.findByMilestoneId(milestoneId);

    // Para cada task, eliminar sus checklist items y daily entries
    for (const task of tasks) {
      // Eliminar checklist items
      const checklistItems = await this.checklistItemRepository.findByTaskId(task.id);
      for (const checklistItem of checklistItems) {
        await this.checklistItemRepository.delete(checklistItem.id);
      }

      // Eliminar daily entries relacionados con la task
      const dailyEntriesByTask = await this.dailyEntryRepository.findByTaskId(task.id);
      for (const dailyEntry of dailyEntriesByTask) {
        await this.dailyEntryRepository.delete(dailyEntry.id);
      }

      // Eliminar la task
      await this.taskRepository.delete(task.id);
    }

    // Finalmente eliminar el milestone
    await this.milestoneRepository.delete(milestoneId);
  }
}
