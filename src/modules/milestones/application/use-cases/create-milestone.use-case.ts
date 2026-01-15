import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Milestone } from '../../domain/entities/milestone.entity';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { MilestoneStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo milestone
 */
@Injectable()
export class CreateMilestoneUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    createMilestoneDto: CreateMilestoneDto,
    projectId: string,
    userId: string,
  ): Promise<Milestone> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }
    if (project.userId !== userId) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Crear la entidad de dominio
    const milestone = new Milestone(
      uuidv4(),
      projectId,
      createMilestoneDto.name,
      createMilestoneDto.description || '',
      MilestoneStatus.PENDING,
      createMilestoneDto.rewardId || null,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.milestoneRepository.create(milestone);
  }
}
