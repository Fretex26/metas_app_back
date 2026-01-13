import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';

/**
 * Caso de uso para obtener todos los tasks de un sprint
 */
@Injectable()
export class GetSprintTasksUseCase {
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

  async execute(sprintId: string, userId: string): Promise<Task[]> {
    // Verificar que el sprint existe y pertenece al usuario
    const sprint = await this.sprintRepository.findById(sprintId);
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
      throw new NotFoundException('Sprint no encontrado');
    }

    return await this.taskRepository.findBySprintId(sprintId);
  }
}
