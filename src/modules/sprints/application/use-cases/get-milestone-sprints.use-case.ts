import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Sprint } from '../../domain/entities/sprint.entity';

/**
 * Caso de uso para obtener todos los sprints de un milestone
 */
@Injectable()
export class GetMilestoneSprintsUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(milestoneId: string, userId: string): Promise<Sprint[]> {
    // Verificar que el milestone existe y pertenece al usuario
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Milestone no encontrado');
    }

    return await this.sprintRepository.findByMilestoneId(milestoneId);
  }
}
