import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';
import { Sprint } from '../../../sprints/domain/entities/sprint.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskStatus } from '../../../../shared/types/enums';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo task
 */
@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISprintRepository')
    private readonly sprintRepository: ISprintRepository,
    @Inject('IMilestoneRepository')
    private readonly milestoneRepository: IMilestoneRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Verificar que el milestone existe y pertenece al usuario
    const milestone = await this.milestoneRepository.findById(
      createTaskDto.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Milestone no encontrado');
    }

    const project = await this.projectRepository.findById(milestone.projectId);
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Milestone no encontrado');
    }

    // Validar que las fechas son válidas
    const startDate = new Date(createTaskDto.startDate);
    const endDate = new Date(createTaskDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Si se proporciona un sprintId, validar que existe y pertenece al milestone
    let sprint: Sprint | null = null;
    if (createTaskDto.sprintId) {
      sprint = await this.sprintRepository.findById(createTaskDto.sprintId);
      if (!sprint) {
        throw new NotFoundException('Sprint no encontrado');
      }

      // Validar que el sprint pertenece al milestone
      if (sprint.milestoneId !== createTaskDto.milestoneId) {
        throw new BadRequestException(
          'El sprint no pertenece al milestone especificado',
        );
      }

      // Validar que el periodo no exceda el del sprint
      if (startDate < sprint.startDate || endDate > sprint.endDate) {
        throw new BadRequestException(
          'El periodo de la tarea no debe exceder el periodo del sprint',
        );
      }
    }

    // Crear la entidad de dominio
    const task = new Task(
      uuidv4(),
      createTaskDto.milestoneId,
      createTaskDto.sprintId || null,
      createTaskDto.name,
      createTaskDto.description || '',
      TaskStatus.PENDING,
      startDate,
      endDate,
      createTaskDto.resourcesAvailable || null,
      createTaskDto.resourcesNeeded || null,
      createTaskDto.incentivePoints || 0,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.taskRepository.create(task);
  }
}
