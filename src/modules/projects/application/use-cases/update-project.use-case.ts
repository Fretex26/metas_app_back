import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectDto } from '../dto/update-project.dto';

/**
 * Caso de uso para actualizar un proyecto
 */
@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    // Obtener el proyecto actual
    const currentProject = await this.projectRepository.findById(projectId);

    if (!currentProject) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar ownership
    if (currentProject.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este proyecto',
      );
    }

    // Crear proyecto actualizado
    const updatedProject = new Project(
      currentProject.id,
      currentProject.userId,
      updateProjectDto.name ?? currentProject.name,
      updateProjectDto.description ?? currentProject.description,
      updateProjectDto.purpose ?? currentProject.purpose,
      updateProjectDto.budget ?? currentProject.budget,
      updateProjectDto.finalDate
        ? new Date(updateProjectDto.finalDate)
        : currentProject.finalDate,
      updateProjectDto.resourcesAvailable ?? currentProject.resourcesAvailable,
      updateProjectDto.resourcesNeeded ?? currentProject.resourcesNeeded,
      updateProjectDto.schedule ?? currentProject.schedule,
      currentProject.sponsoredGoalId,
      currentProject.enrollmentId,
      currentProject.isActive,
      currentProject.createdAt,
    );

    return await this.projectRepository.update(updatedProject);
  }
}
