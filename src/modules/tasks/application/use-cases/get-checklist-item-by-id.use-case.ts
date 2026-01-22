import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';

/**
 * Caso de uso para obtener un checklist item por ID
 */
@Injectable()
export class GetChecklistItemByIdUseCase {
  constructor(
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    checklistItemId: string,
    userId: string,
  ): Promise<ChecklistItem> {
    const checklistItem = await this.checklistItemRepository.findById(checklistItemId);
    if (!checklistItem) {
      throw new NotFoundException('Checklist item no encontrado');
    }

    // Si el checklist item pertenece a una task, verificar ownership
    if (checklistItem.taskId) {
      const task = await this.taskRepository.findById(checklistItem.taskId);
      if (!task) {
        throw new NotFoundException('Tarea no encontrada');
      }

      const milestone = await this.milestoneRepository.findById(task.milestoneId);
      if (!milestone) {
        throw new NotFoundException('Milestone no encontrada');
      }

      const project = await this.projectRepository.findById(milestone.projectId);
      if (!project || project.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a este checklist item',
        );
      }
    }

    return checklistItem;
  }
}
