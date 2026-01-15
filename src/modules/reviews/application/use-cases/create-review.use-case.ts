import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import type { IReviewRepository } from '../../domain/repositories/review.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { Review } from '../../domain/entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { TaskStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo review
 */
@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    createReviewDto: CreateReviewDto,
    sprintId: string,
    userId: string,
  ): Promise<Review> {
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

    // Verificar que no existe ya una review para este sprint
    const existingReview = await this.reviewRepository.findBySprintId(sprintId);
    if (existingReview) {
      throw new ConflictException(
        'Ya existe una revisión para este sprint',
      );
    }

    // Calcular el porcentaje de progreso del proyecto
    const projectTasks = await this.taskRepository.findByProjectId(project.id);
    let progressPercentage = 0;
    
    if (projectTasks.length > 0) {
      const completedTasks = projectTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ).length;
      progressPercentage = Math.round(
        (completedTasks / projectTasks.length) * 100,
      );
    }

    // Crear la entidad de dominio
    const review = new Review(
      uuidv4(),
      sprintId,
      userId,
      progressPercentage,
      createReviewDto.extraPoints || 0,
      createReviewDto.summary || '',
      new Date(),
    );

    // Guardar en el repositorio
    return await this.reviewRepository.create(review);
  }
}
