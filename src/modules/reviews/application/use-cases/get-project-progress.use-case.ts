import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { TaskStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para obtener el porcentaje de progreso de un proyecto
 * Calcula el porcentaje basado en tareas completadas vs total de tareas
 */
@Injectable()
export class GetProjectProgressUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<{
    progressPercentage: number;
    completedTasks: number;
    totalTasks: number;
  }> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Obtener todas las tareas del proyecto
    const projectTasks = await this.taskRepository.findByProjectId(projectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    ).length;

    // Calcular el porcentaje de progreso
    let progressPercentage = 0;
    if (totalTasks > 0) {
      progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    }

    return {
      progressPercentage,
      completedTasks,
      totalTasks,
    };
  }
}
