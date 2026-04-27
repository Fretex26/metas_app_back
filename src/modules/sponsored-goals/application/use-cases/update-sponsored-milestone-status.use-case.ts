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
import {
  MilestoneStatus,
  VerificationMethod,
} from '../../../../shared/types/enums';

@Injectable()
export class UpdateSponsoredMilestoneStatusUseCase {
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
    status: MilestoneStatus,
  ): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrada');
    }

    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden actualizar milestones',
      );
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || !project.sponsoredGoalId) {
      throw new BadRequestException(
        'Solo se pueden actualizar milestones de proyectos patrocinados',
      );
    }

    const sponsoredGoal = await this.sponsoredGoalRepository.findById(
      project.sponsoredGoalId,
    );
    if (!sponsoredGoal || sponsoredGoal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta milestone',
      );
    }

    if (sponsoredGoal.verificationMethod !== VerificationMethod.MANUAL) {
      throw new BadRequestException(
        'Este objetivo patrocinado no utiliza verificación manual',
      );
    }

    if (milestone.status === status) {
      return milestone;
    }

    const updatedMilestone = new Milestone(
      milestone.id,
      milestone.projectId,
      milestone.name,
      milestone.description,
      status,
      milestone.rewardId,
      milestone.createdAt,
    );

    return this.milestoneRepository.update(updatedMilestone);
  }
}
