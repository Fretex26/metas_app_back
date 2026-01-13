import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';

/**
 * Caso de uso para eliminar un proyecto
 */
@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, userId: string): Promise<void> {
    // Obtener el proyecto para verificar ownership
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar ownership
    if (project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este proyecto',
      );
    }

    await this.projectRepository.delete(projectId);
  }
}
