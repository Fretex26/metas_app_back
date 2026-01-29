import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { CreateChecklistItemDto } from '../dto/create-checklist-item.dto';
import { UpdateTaskStatusUseCase } from './update-task-status.use-case';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un checklist item
 */
@Injectable()
export class CreateChecklistItemUseCase {
  constructor(
    @Inject('IChecklistItemRepository')
    private readonly checklistItemRepository: IChecklistItemRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    createDto: CreateChecklistItemDto,
  ): Promise<ChecklistItem> {
    // Verificar que la tarea existe y pertenece al usuario
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const milestone = await this.milestoneRepository.findById(task.milestoneId);
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrada');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para crear checklist items en esta tarea',
      );
    }

    // Crear el checklist item
    const checklistItem = new ChecklistItem(
      uuidv4(),
      taskId,
      null, // sponsoredGoalId
      createDto.description,
      createDto.isRequired ?? false,
      createDto.isChecked ?? false,
      new Date(),
    );

    const savedChecklistItem =
      await this.checklistItemRepository.create(checklistItem);

    // Actualizar el estado de la task automáticamente después de crear el checklist item
    await this.updateTaskStatusUseCase.execute(taskId);

    return savedChecklistItem;
  }
}
