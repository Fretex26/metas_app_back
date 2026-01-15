import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import type { ICategoryRepository } from '../../../categories/domain/repositories/category.repository';
import { Category } from '../../../categories/domain/entities/category.entity';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { CreateSponsoredGoalDto } from '../dto/create-sponsored-goal.dto';
import { SponsorStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo sponsored goal
 */
@Injectable()
export class CreateSponsoredGoalUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    createSponsoredGoalDto: CreateSponsoredGoalDto,
    userId: string,
  ): Promise<SponsoredGoal> {
    // Verificar que el usuario tiene un perfil de sponsor
    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    // Verificar que el sponsor está aprobado
    if (sponsor.status !== SponsorStatus.APPROVED) {
      throw new ForbiddenException(
        'Solo los patrocinadores aprobados pueden crear objetivos patrocinados',
      );
    }

    // Validar que las fechas son válidas
    const startDate = new Date(createSponsoredGoalDto.startDate);
    const endDate = new Date(createSponsoredGoalDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar que maxUsers es mayor a 0
    if (createSponsoredGoalDto.maxUsers <= 0) {
      throw new BadRequestException(
        'El número máximo de usuarios debe ser mayor a 0',
      );
    }

    // Validar que el proyecto existe y pertenece al sponsor
    const project = await this.projectRepository.findById(createSponsoredGoalDto.projectId);
    if (!project) {
      throw new NotFoundException('El proyecto especificado no existe');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException(
        'El proyecto no pertenece al patrocinador',
      );
    }

    // Validar que el proyecto tiene al menos una milestone
    const milestones = await this.milestoneRepository.findByProjectId(project.id);
    if (milestones.length === 0) {
      throw new BadRequestException(
        'El proyecto debe tener al menos una milestone',
      );
    }

    // Validar que cada milestone tiene al menos una task
    for (const milestone of milestones) {
      const sprints = await this.sprintRepository.findByMilestoneId(milestone.id);
      
      // Si no hay sprints, buscar tasks directamente en el milestone
      // Nota: En la estructura actual, las tasks están dentro de sprints
      // Así que verificamos que hay sprints y que cada sprint tiene al menos una task
      if (sprints.length === 0) {
        throw new BadRequestException(
          `La milestone "${milestone.name}" debe tener al menos un sprint con una task`,
        );
      }

      let hasAtLeastOneTask = false;
      for (const sprint of sprints) {
        const tasks = await this.taskRepository.findBySprintId(sprint.id);
        if (tasks.length > 0) {
          hasAtLeastOneTask = true;
          break;
        }
      }

      if (!hasAtLeastOneTask) {
        throw new BadRequestException(
          `La milestone "${milestone.name}" debe tener al menos una task`,
        );
      }
    }

    // Validar y obtener categorías si se proporcionan
    let categories: Category[] = [];
    if (createSponsoredGoalDto.categoryIds && createSponsoredGoalDto.categoryIds.length > 0) {
      categories = await this.categoryRepository.findByIds(createSponsoredGoalDto.categoryIds);
      if (categories.length !== createSponsoredGoalDto.categoryIds.length) {
        throw new BadRequestException(
          'Una o más categorías especificadas no existen',
        );
      }
    }

    // Crear la entidad de dominio
    const sponsoredGoal = new SponsoredGoal(
      uuidv4(),
      sponsor.id,
      createSponsoredGoalDto.projectId,
      createSponsoredGoalDto.name,
      createSponsoredGoalDto.description || '',
      categories,
      startDate,
      endDate,
      createSponsoredGoalDto.verificationMethod,
      createSponsoredGoalDto.rewardId || null,
      createSponsoredGoalDto.maxUsers,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.sponsoredGoalRepository.create(sponsoredGoal);
  }
}
