import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectOrmEntity } from './project.orm-entity';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class ProjectRepositoryImpl implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectOrmEntity)
    private readonly projectRepository: Repository<ProjectOrmEntity>,
  ) {}

  async create(project: Project): Promise<Project> {
    const ormEntity = this.projectRepository.create(
      ProjectMapper.toOrmEntity(project),
    );
    const savedEntity = await this.projectRepository.save(ormEntity);
    return ProjectMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Project | null> {
    const ormEntity = await this.projectRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return ormEntity ? ProjectMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const ormEntities = await this.projectRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ProjectMapper.toDomainList(ormEntities);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Project | null> {
    const ormEntity = await this.projectRepository.findOne({
      where: { enrollmentId },
      relations: ['user'],
    });
    return ormEntity ? ProjectMapper.toDomain(ormEntity) : null;
  }

  async update(project: Project): Promise<Project> {
    const ormEntity = await this.projectRepository.findOne({
      where: { id: project.id },
    });
    if (!ormEntity) {
      throw new Error(`Project with id ${project.id} not found`);
    }
    Object.assign(ormEntity, ProjectMapper.toOrmEntity(project));
    const updatedEntity = await this.projectRepository.save(ormEntity);
    return ProjectMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.projectRepository.count({ where: { userId } });
  }
}
