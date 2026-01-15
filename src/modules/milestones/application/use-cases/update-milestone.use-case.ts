import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Milestone } from '../../domain/entities/milestone.entity';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';

/**
 * Caso de uso para actualizar un milestone
 */
@Injectable()
export class UpdateMilestoneUseCase {
  constructor(
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    milestoneId: string,
    userId: string,
    updateMilestoneDto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    // Obtener el milestone actual
    const currentMilestone = await this.milestoneRepository.findById(
      milestoneId,
    );

    if (!currentMilestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Verificar ownership del proyecto
    const project = await this.projectRepository.findById(
      currentMilestone.projectId,
    );
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este milestone',
      );
    }

    // Crear milestone actualizado
    const updatedMilestone = new Milestone(
      currentMilestone.id,
      currentMilestone.projectId,
      updateMilestoneDto.name ?? currentMilestone.name,
      updateMilestoneDto.description ?? currentMilestone.description,
      currentMilestone.status,
      currentMilestone.createdAt,
    );

    return await this.milestoneRepository.update(updatedMilestone);
  }
}
