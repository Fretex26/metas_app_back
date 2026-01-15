import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IRetrospectiveRepository } from '../../domain/repositories/retrospective.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Retrospective } from '../../domain/entities/retrospective.entity';

/**
 * Caso de uso para obtener la retrospectiva de un sprint
 */
@Injectable()
export class GetSprintRetrospectiveUseCase {
  constructor(
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    sprintId: string,
    userId: string,
  ): Promise<Retrospective> {
    // Verificar que el sprint existe
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Buscar la retrospectiva
    const retrospective =
      await this.retrospectiveRepository.findBySprintId(sprintId);
    if (!retrospective) {
      throw new NotFoundException(
        'No se encontró retrospectiva para este sprint',
      );
    }

    // Si es pública, cualquiera puede verla
    // Si no es pública, solo el dueño puede verla
    if (!retrospective.isPublic) {
      const milestone = await this.milestoneRepository.findById(
        sprint.milestoneId,
      );
      if (!milestone) {
        throw new NotFoundException('Milestone no encontrado');
      }

      const project = await this.projectRepository.findById(
        milestone.projectId,
      );
      if (!project || project.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a esta retrospectiva',
        );
      }
    }

    return retrospective;
  }
}
