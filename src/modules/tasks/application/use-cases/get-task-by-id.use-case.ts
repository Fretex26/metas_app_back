import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';

/**
 * Caso de uso para obtener un task por ID
 */
@Injectable()
export class GetTaskByIdUseCase {
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

  async execute(taskId: string, userId: string): Promise<Task> {
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
        'No tienes permiso para acceder a esta tarea',
      );
    }

    return task;
  }
}
