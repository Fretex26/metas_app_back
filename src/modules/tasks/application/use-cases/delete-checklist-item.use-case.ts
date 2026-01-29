import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { UpdateTaskStatusUseCase } from './update-task-status.use-case';

/**
 * Caso de uso para eliminar un checklist item
 */
@Injectable()
export class DeleteChecklistItemUseCase {
  constructor(
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
  ) {}

  async execute(checklistItemId: string, userId: string): Promise<void> {
    const checklistItem =
      await this.checklistItemRepository.findById(checklistItemId);
    if (!checklistItem) {
      throw new NotFoundException('Checklist item no encontrado');
    }

    // Si el checklist item pertenece a una task, verificar ownership
    const taskId = checklistItem.taskId;
    if (taskId) {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException('Tarea no encontrada');
      }

      const milestone = await this.milestoneRepository.findById(
        task.milestoneId,
      );
      if (!milestone) {
        throw new NotFoundException('Milestone no encontrada');
      }

      const project = await this.projectRepository.findById(
        milestone.projectId,
      );
      if (!project || project.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para eliminar este checklist item',
        );
      }
    }

    // Guardar el taskId antes de eliminar
    const taskIdToUpdate = taskId;

    // Eliminar el checklist item
    await this.checklistItemRepository.delete(checklistItemId);

    // Si el checklist item pertenecía a una task, actualizar el estado de la task
    if (taskIdToUpdate) {
      await this.updateTaskStatusUseCase.execute(taskIdToUpdate);
    }
  }
}
