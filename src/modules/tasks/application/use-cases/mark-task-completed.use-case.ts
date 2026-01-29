import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../../../shared/types/enums';
import { UpdateTaskStatusUseCase } from './update-task-status.use-case';

/**
 * Caso de uso para marcar una tarea como completada manualmente
 *
 * Este caso de uso verifica que todos los checklist items requeridos estén marcados
 * y actualiza el estado de la task a COMPLETED.
 * El estado de la milestone se actualiza automáticamente.
 */
@Injectable()
export class MarkTaskCompletedUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    // Obtener la tarea
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar ownership a través del milestone
    const milestone = await this.milestoneRepository.findById(task.milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrada');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta tarea',
      );
    }

    // Obtener todos los checklist items de la tarea
    const checklistItems =
      await this.checklistItemRepository.findByTaskId(taskId);
    const requiredItems = checklistItems.filter((item) => item.isRequired);

    // Verificar si la tarea puede ser marcada como completada
    if (requiredItems.length > 0) {
      // Si hay items requeridos, todos deben estar marcados
      const allRequiredChecked = requiredItems.every(
        (item) => item.isChecked === true,
      );

      if (!allRequiredChecked) {
        throw new BadRequestException(
          'No se puede marcar la tarea como completada. Todos los items requeridos deben estar marcados.',
        );
      }
    } else if (checklistItems.length > 0) {
      // Si no hay items requeridos pero hay items, todos deben estar marcados
      const allChecked = checklistItems.every((item) => item.isChecked);
      if (!allChecked) {
        throw new BadRequestException(
          'No se puede marcar la tarea como completada. Todos los items deben estar marcados.',
        );
      }
    }
    // Si no hay checklist items, la tarea se puede considerar completada directamente

    // Actualizar el estado de la task a COMPLETED
    const updatedTask = new Task(
      task.id,
      task.milestoneId,
      task.sprintId,
      task.name,
      task.description,
      TaskStatus.COMPLETED,
      task.startDate,
      task.endDate,
      task.resourcesAvailable,
      task.resourcesNeeded,
      task.incentivePoints,
      task.createdAt,
    );

    await this.taskRepository.update(updatedTask);

    // Actualizar automáticamente el estado de la milestone
    await this.updateTaskStatusUseCase.execute(taskId);
  }
}
