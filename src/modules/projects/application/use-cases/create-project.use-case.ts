import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import type { IRewardRepository } from '../../../gamification/domain/repositories/reward.repository';
import { ProjectDomainService } from '../../domain/services/project.domain-service';
import { Project } from '../../domain/entities/project.entity';
import { Reward } from '../../../gamification/domain/entities/reward.entity';
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
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
    private readonly projectDomainService: ProjectDomainService,
  ) {}

  async execute(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    // Validar límite de proyectos
    await this.projectDomainService.validateProjectLimit(userId);

    // Crear la reward primero
    const reward = new Reward(
      uuidv4(),
      null, // sponsorId - las rewards de proyectos no tienen sponsor
      createProjectDto.reward.name,
      createProjectDto.reward.description || null,
      createProjectDto.reward.claimInstructions || null,
      createProjectDto.reward.claimLink || null,
      new Date(),
    );

    const createdReward = await this.rewardRepository.create(reward);

    // Crear la entidad de dominio del proyecto
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
      null, // sponsoredGoalId
      null, // enrollmentId
      true, // isActive
      createdReward.id,
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
