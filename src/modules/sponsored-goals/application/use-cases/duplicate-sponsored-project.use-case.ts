import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';
import type { IChecklistItemRepository } from '../../../tasks/domain/repositories/checklist-item.repository';
import { Project } from '../../../projects/domain/entities/project.entity';
import { Milestone } from '../../../milestones/domain/entities/milestone.entity';
import { Task } from '../../../tasks/domain/entities/task.entity';
import { ChecklistItem } from '../../../tasks/domain/entities/checklist-item.entity';
import { MilestoneStatus, TaskStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para duplicar un proyecto patrocinado completo.
 * Los proyectos de sponsors tienen milestones, tasks y checklists (sin sprints).
 * Los sprints los crean los usuarios después de inscribirse.
 * Duplica: proyecto → milestones → tasks (sprintId null) → checklist items por task.
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
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
  ) {}

  async execute(
    sponsoredGoalId: string,
    userId: string,
    enrollmentId: string,
  ): Promise<Project> {
    // Obtener el sponsored goal
    const sponsoredGoal =
      await this.sponsoredGoalRepository.findById(sponsoredGoalId);
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
      sponsoredGoalId, // sponsoredGoalId
      enrollmentId, // enrollmentId
      true, // isActive
      originalProject.status, // status
      originalProject.rewardId, // rewardId
      new Date(), // createdAt
    );

    const savedProject = await this.projectRepository.create(duplicatedProject);

    // Obtener milestones del proyecto original
    const originalMilestones = await this.milestoneRepository.findByProjectId(
      originalProject.id,
    );

    // Duplicar milestones → tasks (sprintId null) → checklist items por task
    for (const originalMilestone of originalMilestones) {
      const duplicatedMilestone = new Milestone(
        uuidv4(),
        savedProject.id,
        originalMilestone.name,
        originalMilestone.description,
        MilestoneStatus.PENDING,
        originalMilestone.rewardId,
        new Date(),
      );

      const savedMilestone =
        await this.milestoneRepository.create(duplicatedMilestone);

      const originalTasks = await this.taskRepository.findByMilestoneId(
        originalMilestone.id,
      );

      for (const originalTask of originalTasks) {
        const duplicatedTask = new Task(
          uuidv4(),
          savedMilestone.id,
          null, // sprintId: los sprints los crea el usuario después
          originalTask.name,
          originalTask.description,
          TaskStatus.PENDING,
          originalTask.startDate,
          originalTask.endDate,
          originalTask.resourcesAvailable,
          originalTask.resourcesNeeded,
          originalTask.incentivePoints,
          new Date(),
        );

        const savedTask = await this.taskRepository.create(duplicatedTask);

        const checklistItems = await this.checklistItemRepository.findByTaskId(
          originalTask.id,
        );
        for (const item of checklistItems) {
          const duplicatedItem = new ChecklistItem(
            uuidv4(),
            savedTask.id,
            null, // sponsoredGoalId: pertenecen a la task duplicada
            item.description,
            item.isRequired,
            false, // isChecked: siempre sin marcar al duplicar
            new Date(),
          );
          await this.checklistItemRepository.create(duplicatedItem);
        }
      }
    }

    return savedProject;
  }
}
