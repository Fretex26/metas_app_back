import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Sprint } from '../../domain/entities/sprint.entity';

/**
 * Caso de uso para obtener un sprint por ID
 */
@Injectable()
export class GetSprintByIdUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(sprintId: string, userId: string): Promise<Sprint> {
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Verificar que el milestone y proyecto pertenecen al usuario
    const milestone = await this.milestoneRepository.findById(
      sprint.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este sprint',
      );
    }

    return sprint;
  }
}
