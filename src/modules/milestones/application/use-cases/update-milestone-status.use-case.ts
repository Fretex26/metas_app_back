import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { RewardService } from '../../../gamification/domain/services/reward.service';
import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneStatus, TaskStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar automáticamente el estado de una milestone
 * 
 * Lógica:
 * - PENDING: ninguna task completada (todas en PENDING)
 * - IN_PROGRESS: al menos una task en IN_PROGRESS o COMPLETED (pero no todas COMPLETED)
 * - COMPLETED: 
 *   - Para proyectos personales: automáticamente cuando todas las tasks estén COMPLETED
 *   - Para proyectos patrocinados: solo cuando el sponsor lo verifique (no se actualiza automáticamente aquí)
 * 
 * Si una milestone está COMPLETED y una task pasa a IN_PROGRESS, la milestone también cambia a IN_PROGRESS
 * (excepto para proyectos patrocinados donde solo el sponsor puede cambiar el estado)
 * 
 * Nota: Este caso de uso se debe llamar cuando se actualice el estado de una task.
 */
@Injectable()
export class UpdateMilestoneStatusUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    private readonly rewardService: RewardService,
  ) {}

  async execute(
    milestoneId: string,
    completedTasksCount?: number,
    totalTasksCount?: number,
  ): Promise<Milestone> {
    // Obtener el milestone
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrada');
    }

    // Verificar si el proyecto es patrocinado
    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isSponsored = !!project.sponsoredGoalId;

    // Obtener todas las tasks del milestone (a través de los sprints)
    const sprints = await this.sprintRepository.findByMilestoneId(milestoneId);
    const allTasks: any[] = [];
    
    for (const sprint of sprints) {
      const tasks = await this.taskRepository.findBySprintId(sprint.id);
      allTasks.push(...tasks);
    }

    // Si no hay tasks, la milestone permanece en su estado actual o PENDING
    if (allTasks.length === 0) {
      return milestone;
    }

    // Contar tasks por estado
    const completedTasks = allTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    ).length;
    const inProgressTasks = allTasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS,
    ).length;
    const pendingTasks = allTasks.filter(
      (task) => task.status === TaskStatus.PENDING,
    ).length;

    // Determinar el nuevo estado
    let newStatus: MilestoneStatus;

    if (completedTasks === allTasks.length && allTasks.length > 0) {
      // Todas las tasks están COMPLETED
      if (isSponsored) {
        // Para proyectos patrocinados, no actualizamos automáticamente a COMPLETED
        // El sponsor debe verificar manualmente
        // Pero si la milestone ya está COMPLETED, no la cambiamos
        if (milestone.status === MilestoneStatus.COMPLETED) {
          return milestone;
        }
        newStatus = MilestoneStatus.IN_PROGRESS;
      } else {
        // Para proyectos personales, automáticamente COMPLETED
        newStatus = MilestoneStatus.COMPLETED;
      }
    } else if (inProgressTasks > 0 || completedTasks > 0) {
      // Al menos una task está en IN_PROGRESS o COMPLETED
      // Si la milestone está COMPLETED y una task pasa a IN_PROGRESS, cambiar a IN_PROGRESS
      // (excepto para proyectos patrocinados donde solo el sponsor puede cambiar)
      if (
        milestone.status === MilestoneStatus.COMPLETED &&
        !isSponsored &&
        inProgressTasks > 0
      ) {
        newStatus = MilestoneStatus.IN_PROGRESS;
      } else if (milestone.status === MilestoneStatus.PENDING) {
        // Si estaba en PENDING y ahora hay progreso, cambiar a IN_PROGRESS
        newStatus = MilestoneStatus.IN_PROGRESS;
      } else {
        // Mantener IN_PROGRESS si ya estaba en ese estado
        newStatus = MilestoneStatus.IN_PROGRESS;
      }
    } else {
      // Todas las tasks están en PENDING
      newStatus = MilestoneStatus.PENDING;
    }

    // Solo actualizar si el estado cambió
    if (milestone.status === newStatus) {
      return milestone;
    }

    // Actualizar el milestone
    const updatedMilestone = new Milestone(
      milestone.id,
      milestone.projectId,
      milestone.name,
      milestone.description,
      newStatus,
      milestone.rewardId,
      milestone.createdAt,
    );

    const savedMilestone = await this.milestoneRepository.update(updatedMilestone);

    // Si el milestone se completó y es de un proyecto de usuario normal (no patrocinado)
    // y tiene un reward, otorgarlo automáticamente
    if (
      newStatus === MilestoneStatus.COMPLETED &&
      !isSponsored &&
      savedMilestone.rewardId
    ) {
      await this.rewardService.grantReward(project.userId, savedMilestone.rewardId);
    }

    // Si el milestone se completó y es de un proyecto de usuario normal,
    // verificar si todas las milestones están completadas para otorgar el reward del proyecto
    if (newStatus === MilestoneStatus.COMPLETED && !isSponsored && project.rewardId) {
      const allMilestones = await this.milestoneRepository.findByProjectId(project.id);
      const allCompleted = allMilestones.every(
        (m) => m.status === MilestoneStatus.COMPLETED,
      );

      if (allCompleted) {
        // Todas las milestones están completadas
        // El proyecto se considera completado (aunque no tenga campo de estado explícito)
        // Otorgar el reward del proyecto
        await this.rewardService.grantReward(project.userId, project.rewardId);
      }
    }

    return savedMilestone;
  }
}
