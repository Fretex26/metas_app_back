import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { SponsoredGoalOrmEntity } from './sponsored-goal.orm-entity';
import { SponsoredGoalMapper } from '../mappers/sponsored-goal.mapper';

@Injectable()
export class SponsoredGoalRepositoryImpl
  implements ISponsoredGoalRepository
{
  constructor(
    @InjectRepository(SponsoredGoalOrmEntity)
    private readonly sponsoredGoalRepository: Repository<SponsoredGoalOrmEntity>,
  ) {}

  async create(sponsoredGoal: SponsoredGoal): Promise<SponsoredGoal> {
    const ormEntity = this.sponsoredGoalRepository.create(
      SponsoredGoalMapper.toOrmEntity(sponsoredGoal),
    );
    const savedEntity = await this.sponsoredGoalRepository.save(ormEntity);
    return SponsoredGoalMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<SponsoredGoal | null> {
    const ormEntity = await this.sponsoredGoalRepository.findOne({
      where: { id },
      relations: ['sponsor'],
    });
    return ormEntity ? SponsoredGoalMapper.toDomain(ormEntity) : null;
  }

  async findBySponsorId(sponsorId: string): Promise<SponsoredGoal[]> {
    const ormEntities = await this.sponsoredGoalRepository.find({
      where: { sponsorId },
      order: { createdAt: 'DESC' },
      relations: ['sponsor'],
    });
    return SponsoredGoalMapper.toDomainList(ormEntities);
  }

  async findAvailableGoals(): Promise<SponsoredGoal[]> {
    const now = new Date();
    const ormEntities = await this.sponsoredGoalRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['sponsor'],
      order: { createdAt: 'DESC' },
    });
    return SponsoredGoalMapper.toDomainList(ormEntities);
  }

  async update(sponsoredGoal: SponsoredGoal): Promise<SponsoredGoal> {
    const ormEntity = await this.sponsoredGoalRepository.findOne({
      where: { id: sponsoredGoal.id },
    });
    if (!ormEntity) {
      throw new Error(
        `SponsoredGoal with id ${sponsoredGoal.id} not found`,
      );
    }
    Object.assign(ormEntity, SponsoredGoalMapper.toOrmEntity(sponsoredGoal));
    const updatedEntity = await this.sponsoredGoalRepository.save(ormEntity);
    return SponsoredGoalMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.sponsoredGoalRepository.delete(id);
  }
}
