import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectStatus, MilestoneStatus } from '../../../../shared/types/enums';
import { RewardService } from '../../../gamification/domain/services/reward.service';

/**
 * Caso de uso para actualizar automáticamente el estado de un proyecto
 * 
 * Lógica:
 * - PENDING: ninguna checklist item completada (todas las milestones en PENDING)
 * - IN_PROGRESS: al menos una checklist item completada (al menos una milestone en IN_PROGRESS o COMPLETED, pero no todas COMPLETED)
 * - COMPLETED: todas las milestones están COMPLETED
 * 
 * Este caso de uso se debe llamar cuando se actualice el estado de una milestone.
 */
@Injectable()
export class UpdateProjectStatusUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    private readonly rewardService: RewardService,
  ) {}

  async execute(projectId: string): Promise<Project> {
    // Obtener el proyecto
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Obtener todas las milestones del proyecto
    const milestones = await this.milestoneRepository.findByProjectId(projectId);

    // Si no hay milestones, el proyecto permanece en su estado actual o PENDING
    if (milestones.length === 0) {
      if (project.status === ProjectStatus.PENDING) {
        return project;
      }
      // Si había milestones y se eliminaron todas, volver a PENDING
      const updatedProject = new Project(
        project.id,
        project.userId,
        project.name,
        project.description,
        project.purpose,
        project.budget,
        project.finalDate,
        project.resourcesAvailable,
        project.resourcesNeeded,
        project.sponsoredGoalId,
        project.enrollmentId,
        project.isActive,
        ProjectStatus.PENDING,
        project.rewardId,
        project.createdAt,
      );
      return await this.projectRepository.update(updatedProject);
    }

    // Contar milestones por estado
    const completedMilestones = milestones.filter(
      (m) => m.status === MilestoneStatus.COMPLETED,
    ).length;
    const inProgressMilestones = milestones.filter(
      (m) => m.status === MilestoneStatus.IN_PROGRESS,
    ).length;
    const pendingMilestones = milestones.filter(
      (m) => m.status === MilestoneStatus.PENDING,
    ).length;

    // Determinar el nuevo estado
    let newStatus: ProjectStatus;

    if (completedMilestones === milestones.length && milestones.length > 0) {
      // Todas las milestones están COMPLETED
      newStatus = ProjectStatus.COMPLETED;
    } else if (inProgressMilestones > 0 || completedMilestones > 0) {
      // Al menos una milestone está en IN_PROGRESS o COMPLETED
      newStatus = ProjectStatus.IN_PROGRESS;
    } else {
      // Todas las milestones están en PENDING
      newStatus = ProjectStatus.PENDING;
    }

    // Solo actualizar si el estado cambió
    if (project.status === newStatus) {
      return project;
    }

    // Actualizar el proyecto
    const updatedProject = new Project(
      project.id,
      project.userId,
      project.name,
      project.description,
      project.purpose,
      project.budget,
      project.finalDate,
      project.resourcesAvailable,
      project.resourcesNeeded,
      project.sponsoredGoalId,
      project.enrollmentId,
      project.isActive,
      newStatus,
      project.rewardId,
      project.createdAt,
    );

    const savedProject = await this.projectRepository.update(updatedProject);

    // Si el proyecto se completó y tiene un reward, actualizar el UserReward a CLAIMED
    if (newStatus === ProjectStatus.COMPLETED && savedProject.rewardId) {
      await this.rewardService.claimReward(project.userId, savedProject.rewardId);
    }

    return savedProject;
  }
}
