import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../../tasks/domain/repositories/checklist-item.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { RewardService } from '../../../gamification/domain/services/reward.service';
import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar automáticamente el estado de una milestone
 * 
 * Lógica:
 * - PENDING: ninguna task completada
 * - IN_PROGRESS: al menos una task completada (pero no todas)
 * - COMPLETED: 
 *   - Para proyectos personales: automáticamente cuando todas las tasks estén completadas
 *   - Para proyectos patrocinados: solo cuando el sponsor lo verifique (no se actualiza automáticamente aquí)
 * 
 * Nota: Este caso de uso se debe llamar cuando se actualice una task para recalcular el estado.
 * La verificación de tasks completadas se hace mediante algún mecanismo externo (checklist items, etc.)
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
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
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

    // Calcular automáticamente los conteos si no se proporcionaron
    let calculatedCompletedTasks = 0;
    let calculatedTotalTasks = 0;

    if (completedTasksCount === undefined || totalTasksCount === undefined) {
      const sprints = await this.sprintRepository.findByMilestoneId(milestoneId);
      
      for (const sprint of sprints) {
        const tasks = await this.taskRepository.findBySprintId(sprint.id);
        calculatedTotalTasks += tasks.length;

        // Para cada task, verificar si está completada
        // Una task está completada cuando todos sus checklist items requeridos están marcados
        for (const task of tasks) {
          const checklistItems =
            await this.checklistItemRepository.findByTaskId(task.id);
          const requiredItems = checklistItems.filter((item) => item.isRequired);

          if (requiredItems.length === 0) {
            // Si no hay items requeridos, considerar completada si tiene items y todos están marcados
            // O si no tiene items, considerar que no está completada
            if (checklistItems.length > 0) {
              const allChecked = checklistItems.every((item) => item.isChecked);
              if (allChecked) {
                calculatedCompletedTasks++;
              }
            }
          } else {
            // Verificar si todos los items requeridos están marcados
            const allRequiredChecked = requiredItems.every(
              (item) => item.isChecked === true,
            );

            if (allRequiredChecked) {
              calculatedCompletedTasks++;
            }
          }
        }
      }
    }

    // Usar los valores proporcionados o los calculados
    const finalCompletedTasks =
      completedTasksCount !== undefined
        ? completedTasksCount
        : calculatedCompletedTasks;
    const finalTotalTasks =
      totalTasksCount !== undefined ? totalTasksCount : calculatedTotalTasks;

    // Determinar el nuevo estado
    let newStatus: MilestoneStatus;

    if (finalCompletedTasks === 0) {
      newStatus = MilestoneStatus.PENDING;
    } else if (finalCompletedTasks === finalTotalTasks && finalTotalTasks > 0) {
      // Todas las tasks completadas
      if (isSponsored) {
        // Para proyectos patrocinados, no actualizamos automáticamente a COMPLETED
        // El sponsor debe verificar manualmente
        newStatus = MilestoneStatus.IN_PROGRESS;
      } else {
        // Para proyectos personales, automáticamente COMPLETED
        newStatus = MilestoneStatus.COMPLETED;
      }
    } else {
      // Al menos una pero no todas completadas
      newStatus = MilestoneStatus.IN_PROGRESS;
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
        // Todas las milestones están completadas, otorgar el reward del proyecto
        await this.rewardService.grantReward(project.userId, project.rewardId);
      }
    }

    return savedMilestone;
  }
}
