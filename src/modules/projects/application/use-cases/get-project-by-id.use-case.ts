import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';

/**
 * Caso de uso para obtener un proyecto por ID
 */
@Injectable()
export class GetProjectByIdUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que el proyecto pertenece al usuario
    if (project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este proyecto',
      );
    }

    return project;
  }
}
