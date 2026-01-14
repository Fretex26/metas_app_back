import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainService } from '../../domain/services/project.domain-service';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo proyecto
 */
@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly projectDomainService: ProjectDomainService,
  ) {}

  async execute(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    // Validar límite de proyectos
    await this.projectDomainService.validateProjectLimit(userId);

    // Crear la entidad de dominio
    const project = new Project(
      uuidv4(),
      userId,
      createProjectDto.name,
      createProjectDto.description || '',
      createProjectDto.purpose || '',
      createProjectDto.budget || null,
      createProjectDto.finalDate
        ? new Date(createProjectDto.finalDate)
        : null,
      createProjectDto.resourcesAvailable || null,
      createProjectDto.resourcesNeeded || null,
      createProjectDto.schedule || null,
      null, // sponsoredGoalId
      null, // enrollmentId
      true, // isActive
      createProjectDto.rewardId,
      new Date(),
    );

    // Guardar en el repositorio
    try {
      return await this.projectRepository.create(project);
    } catch (error) {
      if (error.message.includes('límite máximo')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
