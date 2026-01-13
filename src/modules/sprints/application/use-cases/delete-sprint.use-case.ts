import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';

/**
 * Caso de uso para eliminar un sprint
 */
@Injectable()
export class DeleteSprintUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(sprintId: string, userId: string): Promise<void> {
    // Obtener el sprint para verificar ownership
    const sprint = await this.sprintRepository.findById(sprintId);

    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Verificar ownership
    const milestone = await this.milestoneRepository.findById(
      sprint.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este sprint',
      );
    }

    await this.sprintRepository.delete(sprintId);
  }
}
