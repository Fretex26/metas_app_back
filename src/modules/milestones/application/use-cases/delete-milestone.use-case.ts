import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';

/**
 * Caso de uso para eliminar un milestone
 */
@Injectable()
export class DeleteMilestoneUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(milestoneId: string, userId: string): Promise<void> {
    // Obtener el milestone para verificar ownership
    const milestone = await this.milestoneRepository.findById(milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Verificar ownership del proyecto
    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este milestone',
      );
    }

    await this.milestoneRepository.delete(milestoneId);
  }
}
