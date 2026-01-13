import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { ISprintRepository } from '../../../sprints/domain/repositories/sprint.repository';
import type { IMilestoneRepository } from '../../../milestones/domain/repositories/milestone.repository';
import type { IProjectRepository } from '../../../projects/domain/repositories/project.repository';
import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
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

  async execute(
    createTaskDto: CreateTaskDto,
    sprintId: string,
    userId: string,
  ): Promise<Task> {
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

    // Validar que las fechas son válidas
    const startDate = new Date(createTaskDto.startDate);
    const endDate = new Date(createTaskDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar que el periodo no exceda el del sprint
    if (startDate < sprint.startDate || endDate > sprint.endDate) {
      throw new BadRequestException(
        'El periodo de la tarea no debe exceder el periodo del sprint',
      );
    }

    // Crear la entidad de dominio
    const task = new Task(
      uuidv4(),
      sprintId,
      createTaskDto.name,
      createTaskDto.description || '',
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
