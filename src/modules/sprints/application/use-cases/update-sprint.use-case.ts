import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Sprint } from '../../domain/entities/sprint.entity';
import { UpdateSprintDto } from '../dto/update-sprint.dto';

/**
 * Caso de uso para actualizar un sprint
 */
@Injectable()
export class UpdateSprintUseCase {
  constructor(
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    sprintId: string,
    userId: string,
    updateSprintDto: UpdateSprintDto,
  ): Promise<Sprint> {
    // Obtener el sprint actual
    const currentSprint = await this.sprintRepository.findById(sprintId);

    if (!currentSprint) {
      throw new NotFoundException('Sprint no encontrado');
    }

    // Verificar ownership
    const milestone = await this.milestoneRepository.findById(
      currentSprint.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este sprint',
      );
    }

    // Validar fechas si se proporcionan
    const startDate = updateSprintDto.startDate
      ? new Date(updateSprintDto.startDate)
      : currentSprint.startDate;
    const endDate = updateSprintDto.endDate
      ? new Date(updateSprintDto.endDate)
      : currentSprint.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar periodo máximo
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 28) {
      throw new BadRequestException(
        'El periodo del sprint no debe exceder 4 semanas (28 días)',
      );
    }

    // Crear sprint actualizado
    const updatedSprint = new Sprint(
      currentSprint.id,
      currentSprint.milestoneId,
      updateSprintDto.name ?? currentSprint.name,
      updateSprintDto.description ?? currentSprint.description,
      updateSprintDto.acceptanceCriteria ?? currentSprint.acceptanceCriteria,
      startDate,
      endDate,
      updateSprintDto.resourcesAvailable ?? currentSprint.resourcesAvailable,
      updateSprintDto.resourcesNeeded ?? currentSprint.resourcesNeeded,
      currentSprint.createdAt,
    );

    return await this.sprintRepository.update(updatedSprint);
  }
}
