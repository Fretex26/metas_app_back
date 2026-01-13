import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IMilestoneRepository } from '../../domain/repositories/milestone.repository';
import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneOrmEntity } from './milestone.orm-entity';
import { MilestoneMapper } from '../mappers/milestone.mapper';

@Injectable()
export class MilestoneRepositoryImpl implements IMilestoneRepository {
  constructor(
    @InjectRepository(MilestoneOrmEntity)
    private readonly milestoneRepository: Repository<MilestoneOrmEntity>,
  ) {}

  async create(milestone: Milestone): Promise<Milestone> {
    const ormEntity = this.milestoneRepository.create(
      MilestoneMapper.toOrmEntity(milestone),
    );
    const savedEntity = await this.milestoneRepository.save(ormEntity);
    return MilestoneMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Milestone | null> {
    const ormEntity = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    return ormEntity ? MilestoneMapper.toDomain(ormEntity) : null;
  }

  async findByProjectId(projectId: string): Promise<Milestone[]> {
    const ormEntities = await this.milestoneRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    return MilestoneMapper.toDomainList(ormEntities);
  }

  async update(milestone: Milestone): Promise<Milestone> {
    const ormEntity = await this.milestoneRepository.findOne({
      where: { id: milestone.id },
    });
    if (!ormEntity) {
      throw new Error(`Milestone with id ${milestone.id} not found`);
    }
    Object.assign(ormEntity, MilestoneMapper.toOrmEntity(milestone));
    const updatedEntity = await this.milestoneRepository.save(ormEntity);
    return MilestoneMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.milestoneRepository.delete(id);
  }
}
