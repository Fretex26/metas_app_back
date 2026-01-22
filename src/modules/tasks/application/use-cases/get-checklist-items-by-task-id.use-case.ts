import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';

/**
 * Caso de uso para obtener todos los checklist items de una task
 */
@Injectable()
export class GetChecklistItemsByTaskIdUseCase {
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

  async execute(taskId: string, userId: string): Promise<ChecklistItem[]> {
    // Verificar que la tarea existe y pertenece al usuario
    const task = await this.taskRepository.findById(taskId);
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
        'No tienes permiso para acceder a los checklist items de esta tarea',
      );
    }

    return await this.checklistItemRepository.findByTaskId(taskId);
  }
}
