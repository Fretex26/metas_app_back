import { Injectable, Inject } from '@nestjs/common';
import type { IPointsWalletRepository } from '../../../gamification/domain/repositories/points-wallet.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';

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

    // Obtener tareas completadas (simplificado - se puede mejorar con estado de tareas)
    // Por ahora retornamos 0, ya que no tenemos un campo de estado en tasks
    const completedTasksCount = 0;

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
