import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../../../shared/types/enums';
import { UpdateMilestoneStatusUseCase } from '../../../milestones/application/use-cases/update-milestone-status.use-case';

/**
 * Caso de uso para actualizar automáticamente el estado de una task
 *
 * Lógica:
 * - PENDING: ninguna checklist item completada o no hay checklist items
 * - IN_PROGRESS: al menos una checklist item completada pero no todas
 * - COMPLETED: todas las checklist items requeridas están completadas
 *
 * Este caso de uso se debe llamar cuando se actualice un checklist item.
 */
@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    private readonly updateMilestoneStatusUseCase: UpdateMilestoneStatusUseCase,
  ) {}

  async execute(taskId: string): Promise<Task> {
    // Obtener la task
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Obtener todos los checklist items de la task
    const checklistItems =
      await this.checklistItemRepository.findByTaskId(taskId);

    let newStatus: TaskStatus;

    if (checklistItems.length === 0) {
      // Si no hay checklist items, la task permanece en PENDING
      newStatus = TaskStatus.PENDING;
    } else {
      const requiredItems = checklistItems.filter((item) => item.isRequired);

      if (requiredItems.length > 0) {
        // Si hay items requeridos, verificar si todos están marcados
        const allRequiredChecked = requiredItems.every(
          (item) => item.isChecked === true,
        );

        if (allRequiredChecked) {
          newStatus = TaskStatus.COMPLETED;
        } else {
          // Verificar si al menos uno está marcado
          const atLeastOneChecked = requiredItems.some(
            (item) => item.isChecked === true,
          );
          newStatus = atLeastOneChecked
            ? TaskStatus.IN_PROGRESS
            : TaskStatus.PENDING;
        }
      } else {
        // Si no hay items requeridos, verificar si todos los items están marcados
        const allChecked = checklistItems.every((item) => item.isChecked);

        if (allChecked && checklistItems.length > 0) {
          newStatus = TaskStatus.COMPLETED;
        } else {
          // Verificar si al menos uno está marcado
          const atLeastOneChecked = checklistItems.some(
            (item) => item.isChecked,
          );
          newStatus = atLeastOneChecked
            ? TaskStatus.IN_PROGRESS
            : TaskStatus.PENDING;
        }
      }
    }

    // Solo actualizar si el estado cambió
    if (task.status === newStatus) {
      return task;
    }

    // Actualizar la task
    const updatedTask = new Task(
      task.id,
      task.milestoneId,
      task.sprintId,
      task.name,
      task.description,
      newStatus,
      task.startDate,
      task.endDate,
      task.resourcesAvailable,
      task.resourcesNeeded,
      task.incentivePoints,
      task.createdAt,
    );

    const savedTask = await this.taskRepository.update(updatedTask);

    // Actualizar automáticamente el estado de la milestone
    await this.updateMilestoneStatusUseCase.execute(task.milestoneId);

    return savedTask;
  }
}
