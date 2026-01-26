import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RewardOrmEntity } from './reward.orm-entity';
import type { IRewardRepository } from '../../domain/repositories/reward.repository';
import { Reward } from '../../domain/entities/reward.entity';
import { RewardMapper } from '../mappers/reward.mapper';

/**
 * Implementación del repositorio de reward usando TypeORM
 */
@Injectable()
export class RewardRepositoryImpl implements IRewardRepository {
  constructor(
    @InjectRepository(RewardOrmEntity)
    private readonly rewardRepository: Repository<RewardOrmEntity>,
  ) {}

  async create(reward: Reward): Promise<Reward> {
    const ormEntity = this.rewardRepository.create(
      RewardMapper.toOrmEntity(reward),
    );
    const savedEntity = await this.rewardRepository.save(ormEntity);
    return RewardMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Reward | null> {
    const ormEntity = await this.rewardRepository.findOne({
      where: { id },
    });
    return ormEntity ? RewardMapper.toDomain(ormEntity) : null;
  }

  async findByIds(ids: string[]): Promise<Reward[]> {
    if (ids.length === 0) {
      return [];
    }
    const ormEntities = await this.rewardRepository.find({
      where: { id: In(ids) },
    });
    return RewardMapper.toDomainList(ormEntities);
  }
}
