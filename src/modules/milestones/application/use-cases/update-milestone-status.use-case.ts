import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
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
  ) {}

  async execute(
    milestoneId: string,
    completedTasksCount: number = 0,
    totalTasksCount: number = 0,
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

    // Si no se proporcionaron los conteos, calcularlos
    if (totalTasksCount === 0) {
      const sprints = await this.sprintRepository.findByMilestoneId(milestoneId);
      for (const sprint of sprints) {
        const tasks = await this.taskRepository.findBySprintId(sprint.id);
        totalTasksCount += tasks.length;
      }
    }

    // Determinar el nuevo estado
    let newStatus: MilestoneStatus;

    if (completedTasksCount === 0) {
      newStatus = MilestoneStatus.PENDING;
    } else if (completedTasksCount === totalTasksCount && totalTasksCount > 0) {
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
      milestone.createdAt,
    );

    return await this.milestoneRepository.update(updatedMilestone);
  }
}
