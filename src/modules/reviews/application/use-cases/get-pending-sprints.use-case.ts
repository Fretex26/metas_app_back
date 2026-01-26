import { Injectable, Inject } from '@nestjs/common';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IReviewRepository } from '../../domain/repositories/review.repository';
import type { IRetrospectiveRepository } from '../../../retrospectives/domain/repositories/retrospective.repository';
import type { PendingSprintsResponseDto } from '../dto/pending-sprints-response.dto';

/**
 * Caso de uso para obtener sprints pendientes de review o retrospectiva
 */
@Injectable()
export class GetPendingSprintsUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
  ) {}

  async execute(userId: string): Promise<PendingSprintsResponseDto[]> {
    // Obtener la fecha de hoy (solo fecha, sin hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener todos los sprints del usuario con endDate <= hoy
    const sprints = await this.sprintRepository.findByUserIdWithEndDateBeforeOrEqual(
      userId,
      today,
    );

    const pendingSprints: PendingSprintsResponseDto[] = [];

    // Para cada sprint, verificar si tiene review y retrospectiva
    for (const sprint of sprints) {
      // Obtener milestone y proyecto para obtener nombres
      const milestone = await this.milestoneRepository.findById(
        sprint.milestoneId,
      );
      if (!milestone) {
        continue;
      }

      const project = await this.projectRepository.findById(
        milestone.projectId,
      );
      if (!project || project.userId !== userId) {
        continue;
      }

      // Verificar si tiene review
      const review = await this.reviewRepository.findBySprintId(sprint.id);
      const hasReview = review !== null;

      // Verificar si tiene retrospectiva
      const retrospective =
        await this.retrospectiveRepository.findBySprintId(sprint.id);
      const hasRetrospective = retrospective !== null;

      // Solo agregar si falta review o retrospectiva (o ambas)
      if (!hasReview || !hasRetrospective) {
        pendingSprints.push({
          sprintId: sprint.id,
          sprintName: sprint.name,
          endDate: sprint.endDate,
          projectId: project.id,
          projectName: project.name,
          milestoneId: milestone.id,
          milestoneName: milestone.name,
          needsReview: !hasReview,
          needsRetrospective: !hasRetrospective,
        });
      }
    }

    return pendingSprints;
  }
}
