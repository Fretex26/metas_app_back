import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IReviewRepository } from '../../domain/repositories/review.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Review } from '../../domain/entities/review.entity';

/**
 * Caso de uso para obtener el review de un sprint
 */
@Injectable()
export class GetSprintReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(sprintId: string, userId: string): Promise<Review> {
    // Verificar que el sprint existe y pertenece al usuario
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

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

    // Buscar el review
    const review = await this.reviewRepository.findBySprintId(sprintId);
    if (!review) {
      throw new NotFoundException('No se encontró revisión para este sprint');
    }

    return review;
  }
}
