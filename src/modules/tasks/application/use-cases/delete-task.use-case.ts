import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { IDailyEntryRepository } from '../../../daily-entries/domain/repositories/daily-entry.repository';

/**
 * Caso de uso para eliminar un task
 *
 * Elimina en cascada:
 * - Todos los checklist items de la task
 * - Todos los daily entries relacionados con la task
 */
@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('IDailyEntryRepository')
    private readonly dailyEntryRepository: IDailyEntryRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    // Obtener el task para verificar ownership
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar ownership
    // Si la tarea tiene sprint, verificamos a través del sprint -> milestone -> project
    // Si no tiene sprint, verificamos directamente a través del milestone -> project
    let milestone;
    if (task.sprintId) {
      const sprint = await this.sprintRepository.findById(task.sprintId);
      if (!sprint) {
        throw new NotFoundException('Sprint no encontrado');
      }
      milestone = await this.milestoneRepository.findById(sprint.milestoneId);
    } else {
      milestone = await this.milestoneRepository.findById(task.milestoneId);
    }

    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta tarea',
      );
    }

    // Obtener todos los checklist items de la task
    const checklistItems =
      await this.checklistItemRepository.findByTaskId(taskId);

    // Eliminar todos los checklist items
    for (const checklistItem of checklistItems) {
      await this.checklistItemRepository.delete(checklistItem.id);
    }

    // Eliminar daily entries relacionados con la task
    const dailyEntries = await this.dailyEntryRepository.findByTaskId(taskId);
    for (const dailyEntry of dailyEntries) {
      await this.dailyEntryRepository.delete(dailyEntry.id);
    }

    // Finalmente eliminar la task
    await this.taskRepository.delete(taskId);
  }
}
