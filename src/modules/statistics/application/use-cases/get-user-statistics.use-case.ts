import { Injectable, Inject } from '@nestjs/common';
import type { IPointsWalletRepository } from '../../../gamification/domain/repositories/points-wallet.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { TaskStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para obtener estadísticas generales del usuario
 */
@Injectable()
export class GetUserStatisticsUseCase {
  constructor(
    @Inject('IPointsWalletRepository')
    private readonly pointsWalletRepository: IPointsWalletRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string): Promise<{
    totalPoints: number;
    badgesCount: number;
    activeProjectsCount: number;
    completedTasksCount: number;
  }> {
    // Obtener puntos totales
    const wallet = await this.pointsWalletRepository.findByUserId(userId);
    const totalPoints = wallet?.balance || 0;

    // Obtener proyectos activos
    const projects = await this.projectRepository.findByUserId(userId);
    const activeProjectsCount = projects.length;

    // Obtener tareas completadas de todos los proyectos del usuario
    let completedTasksCount = 0;
    for (const project of projects) {
      const projectTasks = await this.taskRepository.findByProjectId(
        project.id,
      );
      const completedTasks = projectTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      );
      completedTasksCount += completedTasks.length;
    }

    // Badges count (por ahora 0, se puede implementar cuando se agregue el módulo de badges)
    const badgesCount = 0;

    return {
      totalPoints,
      badgesCount,
      activeProjectsCount,
      completedTasksCount,
    };
  }
}
