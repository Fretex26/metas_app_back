import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Milestone } from '../../domain/entities/milestone.entity';

/**
 * Caso de uso para obtener todos los milestones de un proyecto
 */
@Injectable()
export class GetProjectMilestonesUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, userId: string): Promise<Milestone[]> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }
    if (project.userId !== userId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return await this.milestoneRepository.findByProjectId(projectId);
  }
}
