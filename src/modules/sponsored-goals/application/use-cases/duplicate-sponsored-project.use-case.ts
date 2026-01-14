import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { Project } from '../../../projects/domain/entities/project.entity';
import { Milestone } from '../../../milestones/domain/entities/milestone.entity';
import { Sprint } from '../../../sprints/domain/entities/sprint.entity';
import { Task } from '../../../tasks/domain/entities/task.entity';
import { MilestoneStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para duplicar un proyecto patrocinado completo
 * Duplica el proyecto con todas sus milestones, sprints y tasks
 */
@Injectable()
export class DuplicateSponsoredProjectUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    sponsoredGoalId: string,
    userId: string,
    enrollmentId: string,
  ): Promise<Project> {
    // Obtener el sponsored goal
    const sponsoredGoal = await this.sponsoredGoalRepository.findById(
      sponsoredGoalId,
    );
    if (!sponsoredGoal) {
      throw new NotFoundException('Objetivo patrocinado no encontrado');
    }

    // Obtener el proyecto original del sponsor
    const originalProject = await this.projectRepository.findById(
      sponsoredGoal.projectId,
    );
    if (!originalProject) {
      throw new NotFoundException('Proyecto original no encontrado');
    }

    // Crear el proyecto duplicado para el usuario
    const duplicatedProject = new Project(
      uuidv4(),
      userId,
      originalProject.name,
      originalProject.description,
      originalProject.purpose || '',
      originalProject.budget,
      originalProject.finalDate,
      originalProject.resourcesAvailable,
      originalProject.resourcesNeeded,
      originalProject.schedule,
      sponsoredGoalId, // sponsoredGoalId
      enrollmentId, // enrollmentId
      true, // isActive
      new Date(),
    );

    const savedProject = await this.projectRepository.create(duplicatedProject);

    // Obtener milestones del proyecto original
    const originalMilestones = await this.milestoneRepository.findByProjectId(
      originalProject.id,
    );

    // Mapa para rastrear los IDs antiguos y nuevos de milestones y sprints
    const milestoneMap = new Map<string, string>();
    const sprintMap = new Map<string, string>();

    // Duplicar milestones
    for (const originalMilestone of originalMilestones) {
      const duplicatedMilestone = new Milestone(
        uuidv4(),
        savedProject.id,
        originalMilestone.name,
        originalMilestone.description,
        MilestoneStatus.PENDING, // Estado inicial siempre PENDING
        new Date(),
      );

      const savedMilestone =
        await this.milestoneRepository.create(duplicatedMilestone);
      milestoneMap.set(originalMilestone.id, savedMilestone.id);

      // Obtener sprints del milestone original
      const originalSprints = await this.sprintRepository.findByMilestoneId(
        originalMilestone.id,
      );

      // Duplicar sprints
      for (const originalSprint of originalSprints) {
        const duplicatedSprint = new Sprint(
          uuidv4(),
          savedMilestone.id,
          originalSprint.name,
          originalSprint.description,
          originalSprint.acceptanceCriteria,
          originalSprint.startDate,
          originalSprint.endDate,
          originalSprint.resourcesAvailable,
          originalSprint.resourcesNeeded,
          new Date(),
        );

        const savedSprint = await this.sprintRepository.create(duplicatedSprint);
        sprintMap.set(originalSprint.id, savedSprint.id);

        // Obtener tasks del sprint original
        const originalTasks = await this.taskRepository.findBySprintId(
          originalSprint.id,
        );

        // Duplicar tasks
        for (const originalTask of originalTasks) {
          const duplicatedTask = new Task(
            uuidv4(),
            savedSprint.id,
            originalTask.name,
            originalTask.description,
            originalTask.startDate,
            originalTask.endDate,
            originalTask.resourcesAvailable,
            originalTask.resourcesNeeded,
            originalTask.incentivePoints,
            new Date(),
          );

          await this.taskRepository.create(duplicatedTask);
        }
      }
    }

    return savedProject;
  }
}
