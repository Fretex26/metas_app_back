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
import { UpdateChecklistItemDto } from '../dto/update-checklist-item.dto';
import { UpdateTaskStatusUseCase } from './update-task-status.use-case';
import { UserRole } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar un checklist item
 *
 * Al actualizar un checklist item, se actualiza automáticamente el estado de la task asociada.
 */
@Injectable()
export class UpdateChecklistItemUseCase {
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
    checklistItemId: string,
    userId: string,
    updateDto: UpdateChecklistItemDto,
    userRole?: string,
  ): Promise<ChecklistItem> {
    // Obtener el checklist item
    const checklistItem =
      await this.checklistItemRepository.findById(checklistItemId);
    if (!checklistItem) {
      throw new NotFoundException('Checklist item no encontrado');
    }

    // Si el checklist item pertenece a una task, verificar ownership
    if (checklistItem.taskId) {
      const task = await this.taskRepository.findById(checklistItem.taskId);
      if (!task) {
        throw new NotFoundException('Tarea no encontrada');
      }

      const milestone = await this.milestoneRepository.findById(
        task.milestoneId,
      );
      if (!milestone) {
        throw new NotFoundException('Milestone no encontrada');
      }

      const project = await this.projectRepository.findById(
        milestone.projectId,
      );
      if (!project || project.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para modificar este checklist item',
        );
      }
    }

    // Verificar que solo usuarios normales pueden cambiar is_checked a true
    // Los sponsors pueden crear, editar descripción y eliminar, pero NO pueden marcar como completado
    if (updateDto.isChecked === true && userRole === UserRole.SPONSOR) {
      throw new ForbiddenException(
        'Solo los usuarios normales pueden marcar checklist items como completados. Los patrocinadores pueden crear, editar y eliminar, pero no pueden cambiar el estado de completado.',
      );
    }

    // Actualizar el checklist item
    const updatedChecklistItem = new ChecklistItem(
      checklistItem.id,
      checklistItem.taskId,
      checklistItem.sponsoredGoalId,
      updateDto.description ?? checklistItem.description,
      updateDto.isRequired ?? checklistItem.isRequired,
      updateDto.isChecked ?? checklistItem.isChecked,
      checklistItem.createdAt,
    );

    const savedChecklistItem =
      await this.checklistItemRepository.update(updatedChecklistItem);

    // Si el checklist item pertenece a una task, actualizar el estado de la task automáticamente
    if (savedChecklistItem.taskId) {
      await this.updateTaskStatusUseCase.execute(savedChecklistItem.taskId);
    }

    return savedChecklistItem;
  }
}
