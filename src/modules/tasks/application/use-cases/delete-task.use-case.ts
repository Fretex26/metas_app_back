import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';

/**
 * Caso de uso para eliminar un task
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
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    // Obtener el task para verificar ownership
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
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta tarea',
      );
    }

    await this.taskRepository.delete(taskId);
  }
}
