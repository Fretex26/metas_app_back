import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { Milestone } from '../../../milestones/domain/entities/milestone.entity';

/**
 * Caso de uso para que un sponsor obtenga las milestones de un proyecto patrocinado
 * de un usuario normal
 */
@Injectable()
export class GetSponsoredProjectMilestonesUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(
    projectId: string,
    sponsorUserId: string,
  ): Promise<Milestone[]> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que el proyecto es patrocinado
    if (!project.sponsoredGoalId) {
      throw new ForbiddenException(
        'Este proyecto no es un proyecto patrocinado',
      );
    }

    // Verificar que el usuario es un sponsor
    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden ver milestones de proyectos patrocinados',
      );
    }

    // Verificar que el sponsored goal pertenece al sponsor
    const sponsoredGoal = await this.sponsoredGoalRepository.findById(
      project.sponsoredGoalId,
    );
    if (!sponsoredGoal || sponsoredGoal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para ver las milestones de este proyecto',
      );
    }

    // Obtener las milestones del proyecto
    return await this.milestoneRepository.findByProjectId(projectId);
  }
}
