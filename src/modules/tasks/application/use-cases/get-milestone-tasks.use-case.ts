import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';

/**
 * Caso de uso para obtener todos los tasks de un milestone
 */
@Injectable()
export class GetMilestoneTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(milestoneId: string, userId: string): Promise<Task[]> {
    // Verificar que el milestone existe y pertenece al usuario
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Milestone no encontrado');
    }

    return await this.taskRepository.findByMilestoneId(milestoneId);
  }
}
