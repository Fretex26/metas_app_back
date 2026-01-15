import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from './task.orm-entity';
import { TaskMapper } from '../mappers/task.mapper';

@Injectable()
export class TaskRepositoryImpl implements ITaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly taskRepository: Repository<TaskOrmEntity>,
  ) {}

  async create(task: Task): Promise<Task> {
    const ormEntity = this.taskRepository.create(TaskMapper.toOrmEntity(task));
    const savedEntity = await this.taskRepository.save(ormEntity);
    return TaskMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Task | null> {
    const ormEntity = await this.taskRepository.findOne({
      where: { id },
      relations: ['milestone', 'sprint'],
    });
    return ormEntity ? TaskMapper.toDomain(ormEntity) : null;
  }

  async findBySprintId(sprintId: string): Promise<Task[]> {
    const ormEntities = await this.taskRepository.find({
      where: { sprintId },
      order: { createdAt: 'DESC' },
    });
    return TaskMapper.toDomainList(ormEntities);
  }

  async update(task: Task): Promise<Task> {
    const ormEntity = await this.taskRepository.findOne({
      where: { id: task.id },
    });
    if (!ormEntity) {
      throw new Error(`Task with id ${task.id} not found`);
    }
    Object.assign(ormEntity, TaskMapper.toOrmEntity(task));
    const updatedEntity = await this.taskRepository.save(ormEntity);
    return TaskMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
