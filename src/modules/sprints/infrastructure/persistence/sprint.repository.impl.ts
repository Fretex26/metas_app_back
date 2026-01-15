import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ISprintRepository } from '../../domain/repositories/sprint.repository';
import { Sprint } from '../../domain/entities/sprint.entity';
import { SprintOrmEntity } from './sprint.orm-entity';
import { SprintMapper } from '../mappers/sprint.mapper';

@Injectable()
export class SprintRepositoryImpl implements ISprintRepository {
  constructor(
    @InjectRepository(SprintOrmEntity)
    private readonly sprintRepository: Repository<SprintOrmEntity>,
  ) {}

  async create(sprint: Sprint): Promise<Sprint> {
    const ormEntity = this.sprintRepository.create(
      SprintMapper.toOrmEntity(sprint),
    );
    const savedEntity = await this.sprintRepository.save(ormEntity);
    return SprintMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Sprint | null> {
    const ormEntity = await this.sprintRepository.findOne({
      where: { id },
      relations: ['milestone'],
    });
    return ormEntity ? SprintMapper.toDomain(ormEntity) : null;
  }

  async findByMilestoneId(milestoneId: string): Promise<Sprint[]> {
    const ormEntities = await this.sprintRepository.find({
      where: { milestoneId },
      order: { createdAt: 'DESC' },
    });
    return SprintMapper.toDomainList(ormEntities);
  }

  async update(sprint: Sprint): Promise<Sprint> {
    const ormEntity = await this.sprintRepository.findOne({
      where: { id: sprint.id },
    });
    if (!ormEntity) {
      throw new Error(`Sprint with id ${sprint.id} not found`);
    }
    Object.assign(ormEntity, SprintMapper.toOrmEntity(sprint));
    const updatedEntity = await this.sprintRepository.save(ormEntity);
    return SprintMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.sprintRepository.delete(id);
  }
}
