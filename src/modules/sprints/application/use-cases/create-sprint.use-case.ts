import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Sprint } from '../../domain/entities/sprint.entity';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo sprint
 */
@Injectable()
export class CreateSprintUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    createSprintDto: CreateSprintDto,
    milestoneId: string,
    userId: string,
  ): Promise<Sprint> {
    // Verificar que el milestone existe y pertenece al usuario
    const milestone = await this.milestoneRepository.findById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Validar que las fechas son válidas
    const startDate = new Date(createSprintDto.startDate);
    const endDate = new Date(createSprintDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar que el periodo no exceda el del milestone (máximo 4 semanas = 28 días)
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 28) {
      throw new BadRequestException(
        'El periodo del sprint no debe exceder 4 semanas (28 días)',
      );
    }

    // Crear la entidad de dominio
    const sprint = new Sprint(
      uuidv4(),
      milestoneId,
      createSprintDto.name,
      createSprintDto.description || '',
      createSprintDto.acceptanceCriteria || null,
      startDate,
      endDate,
      createSprintDto.resourcesAvailable || null,
      createSprintDto.resourcesNeeded || null,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.sprintRepository.create(sprint);
  }
}
