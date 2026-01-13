import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Milestone } from '../../domain/entities/milestone.entity';

/**
 * Caso de uso para obtener un milestone por ID
 */
@Injectable()
export class GetMilestoneByIdUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(milestoneId: string, userId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findById(milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este milestone',
      );
    }

    return milestone;
  }
}
