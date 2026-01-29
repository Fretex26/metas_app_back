import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IRetrospectiveRepository } from '../../domain/repositories/retrospective.repository';
import { Retrospective } from '../../domain/entities/retrospective.entity';
import { RetrospectiveOrmEntity } from './retrospective.orm-entity';
import { RetrospectiveMapper } from '../mappers/retrospective.mapper';

@Injectable()
export class RetrospectiveRepositoryImpl implements IRetrospectiveRepository {
  constructor(
    @InjectRepository(RetrospectiveOrmEntity)
    private readonly retrospectiveRepository: Repository<RetrospectiveOrmEntity>,
  ) {}

  async create(retrospective: Retrospective): Promise<Retrospective> {
    const ormEntity = this.retrospectiveRepository.create(
      RetrospectiveMapper.toOrmEntity(retrospective),
    );
    const savedEntity = await this.retrospectiveRepository.save(ormEntity);
    return RetrospectiveMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Retrospective | null> {
    const ormEntity = await this.retrospectiveRepository.findOne({
      where: { id },
      relations: ['sprint', 'user'],
    });
    return ormEntity ? RetrospectiveMapper.toDomain(ormEntity) : null;
  }

  async findBySprintId(sprintId: string): Promise<Retrospective | null> {
    const ormEntity = await this.retrospectiveRepository.findOne({
      where: { sprintId },
      relations: ['sprint', 'user'],
    });
    return ormEntity ? RetrospectiveMapper.toDomain(ormEntity) : null;
  }

  async findPublicRetrospectives(): Promise<Retrospective[]> {
    const ormEntities = await this.retrospectiveRepository.find({
      where: { isPublic: true },
      relations: ['sprint', 'user'],
      order: { createdAt: 'DESC' },
    });
    return RetrospectiveMapper.toDomainList(ormEntities);
  }

  async update(retrospective: Retrospective): Promise<Retrospective> {
    const ormEntity = await this.retrospectiveRepository.findOne({
      where: { id: retrospective.id },
    });
    if (!ormEntity) {
      throw new Error(`Retrospective with id ${retrospective.id} not found`);
    }
    Object.assign(ormEntity, RetrospectiveMapper.toOrmEntity(retrospective));
    const updatedEntity = await this.retrospectiveRepository.save(ormEntity);
    return RetrospectiveMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.retrospectiveRepository.delete(id);
  }
}
