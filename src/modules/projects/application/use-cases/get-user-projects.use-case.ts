import { Injectable, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';

/**
 * Caso de uso para obtener todos los proyectos de un usuario
 */
@Injectable()
export class GetUserProjectsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(userId: string): Promise<Project[]> {
    const projects = await this.projectRepository.findByUserId(userId);
    
    // Filtrar proyectos: solo mostrar proyectos personales (sponsoredGoalId IS NULL)
    // o proyectos patrocinados que estén activos (isActive = true)
    return projects.filter(
      (project) =>
        !project.sponsoredGoalId ||
        (project.sponsoredGoalId && project.isActive !== false),
    );
  }
}
