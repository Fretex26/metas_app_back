import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Milestone } from '../../../milestones/domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../../shared/types/enums';
import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * Caso de uso para verificar la completitud de una milestone
 * Solo funciona para proyectos patrocinados y método MANUAL
 */
@Injectable()
export class VerifyMilestoneCompletionUseCase {
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
    milestoneId: string,
    sponsorUserId: string,
  ): Promise<Milestone> {
    // Verificar que la milestone existe
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrada');
    }

    // Verificar que el usuario es un sponsor
    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden verificar milestones',
      );
    }

    // Verificar que el proyecto es patrocinado
    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || !project.sponsoredGoalId) {
      throw new BadRequestException(
        'Solo se pueden verificar milestones de proyectos patrocinados',
      );
    }

    // Verificar que el sponsored goal pertenece al sponsor
    const sponsoredGoal = await this.sponsoredGoalRepository.findById(
      project.sponsoredGoalId,
    );
    if (!sponsoredGoal || sponsoredGoal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para verificar esta milestone',
      );
    }

    // Verificar que el método de verificación es MANUAL
    if (sponsoredGoal.verificationMethod !== VerificationMethod.MANUAL) {
      throw new BadRequestException(
        'Este objetivo patrocinado no utiliza verificación manual',
      );
    }

    // Actualizar el estado de la milestone a COMPLETED
    const updatedMilestone = new Milestone(
      milestone.id,
      milestone.projectId,
      milestone.name,
      milestone.description,
      MilestoneStatus.COMPLETED,
      milestone.rewardId,
      milestone.createdAt,
    );

    return await this.milestoneRepository.update(updatedMilestone);
  }
}
