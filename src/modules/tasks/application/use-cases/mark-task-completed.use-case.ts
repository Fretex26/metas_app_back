import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { UpdateMilestoneStatusUseCase } from '../../../milestones/application/use-cases/update-milestone-status.use-case';

/**
 * Caso de uso para marcar una tarea como completada
 * 
 * Una tarea se considera completada cuando todos sus checklist items requeridos están marcados.
 * Al marcar una tarea como completada, se actualiza automáticamente el estado de la milestone.
 */
@Injectable()
export class MarkTaskCompletedUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly updateMilestoneStatusUseCase: UpdateMilestoneStatusUseCase,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    // Obtener la tarea
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar ownership
    const sprint = await this.sprintRepository.findById(task.sprintId);
    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    const milestone = await this.milestoneRepository.findById(
      sprint.milestoneId,
    );
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

    // Calcular cuántas tareas del milestone están completadas
    const milestoneSprints = await this.sprintRepository.findByMilestoneId(
      milestone.id,
    );

    let completedTasksCount = 0;
    let totalTasksCount = 0;

    for (const milestoneSprint of milestoneSprints) {
      const milestoneTasks = await this.taskRepository.findBySprintId(
        milestoneSprint.id,
      );
      totalTasksCount += milestoneTasks.length;

      for (const milestoneTask of milestoneTasks) {
        const taskChecklistItems =
          await this.checklistItemRepository.findByTaskId(milestoneTask.id);
        const taskRequiredItems = taskChecklistItems.filter(
          (item) => item.isRequired,
        );

        let isTaskCompleted = false;

        if (taskRequiredItems.length === 0) {
          // Si no hay items requeridos, considerar completada si todos los items están marcados
          if (taskChecklistItems.length > 0) {
            isTaskCompleted = taskChecklistItems.every(
              (item) => item.isChecked,
            );
          } else {
            // Si no hay items, considerar que la tarea está completada si es la que acabamos de marcar
            isTaskCompleted = milestoneTask.id === taskId;
          }
        } else {
          // Verificar si todos los items requeridos están marcados
          isTaskCompleted = taskRequiredItems.every(
            (item) => item.isChecked === true,
          );
        }

        if (isTaskCompleted) {
          completedTasksCount++;
        }
      }
    }

    // Actualizar automáticamente el estado de la milestone
    await this.updateMilestoneStatusUseCase.execute(
      milestone.id,
      completedTasksCount,
      totalTasksCount,
    );
  }
}
