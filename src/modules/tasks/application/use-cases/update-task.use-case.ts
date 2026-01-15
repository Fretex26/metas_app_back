import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Sprint } from '../../../sprints/domain/entities/sprint.entity';

/**
 * Caso de uso para actualizar un task
 */
@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    // Obtener el task actual
    const currentTask = await this.taskRepository.findById(taskId);

    if (!currentTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar ownership a través del milestone
    const milestone = await this.milestoneRepository.findById(
      currentTask.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta tarea',
      );
    }

    // Validar fechas si se proporcionan
    const startDate = updateTaskDto.startDate
      ? new Date(updateTaskDto.startDate)
      : currentTask.startDate;
    const endDate = updateTaskDto.endDate
      ? new Date(updateTaskDto.endDate)
      : currentTask.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Si la tarea tiene sprintId, validar que el periodo no exceda el del sprint
    let sprint: Sprint | null = null;
    if (currentTask.sprintId) {
      sprint = await this.sprintRepository.findById(currentTask.sprintId);
      if (!sprint) {
        throw new NotFoundException('Sprint no encontrado');
      }

      // Validar que el periodo no exceda el del sprint
      if (startDate < sprint.startDate || endDate > sprint.endDate) {
        throw new BadRequestException(
          'El periodo de la tarea no debe exceder el periodo del sprint',
        );
      }
    }

    // Crear task actualizado (mantener el status actual, no se puede actualizar manualmente)
    const updatedTask = new Task(
      currentTask.id,
      currentTask.milestoneId,
      currentTask.sprintId,
      updateTaskDto.name ?? currentTask.name,
      updateTaskDto.description ?? currentTask.description,
      currentTask.status, // El status se actualiza automáticamente basado en checklist items
      startDate,
      endDate,
      updateTaskDto.resourcesAvailable ?? currentTask.resourcesAvailable,
      updateTaskDto.resourcesNeeded ?? currentTask.resourcesNeeded,
      updateTaskDto.incentivePoints ?? currentTask.incentivePoints,
      currentTask.createdAt,
    );

    return await this.taskRepository.update(updatedTask);
  }
}
