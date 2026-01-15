import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import type { IRetrospectiveRepository } from '../../domain/repositories/retrospective.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Retrospective } from '../../domain/entities/retrospective.entity';
import { CreateRetrospectiveDto } from '../dto/create-retrospective.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo retrospective
 */
@Injectable()
export class CreateRetrospectiveUseCase {
  constructor(
    @Inject('IRetrospectiveRepository')
    private readonly retrospectiveRepository: IRetrospectiveRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    createRetrospectiveDto: CreateRetrospectiveDto,
    sprintId: string,
    userId: string,
  ): Promise<Retrospective> {
    // Verificar que el sprint existe y pertenece al usuario
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    const milestone = await this.milestoneRepository.findById(
      sprint.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Verificar que no existe ya una retrospectiva para este sprint
    const existingRetrospective =
      await this.retrospectiveRepository.findBySprintId(sprintId);
    if (existingRetrospective) {
      throw new ConflictException(
        'Ya existe una retrospectiva para este sprint',
      );
    }

    // Crear la entidad de dominio
    const retrospective = new Retrospective(
      uuidv4(),
      sprintId,
      userId,
      createRetrospectiveDto.whatWentWell,
      createRetrospectiveDto.whatWentWrong,
      createRetrospectiveDto.improvements || '',
      createRetrospectiveDto.isPublic || false,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.retrospectiveRepository.create(retrospective);
  }
}
