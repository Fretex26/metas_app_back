import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRewardRepository } from '../../domain/repositories/user-reward.repository';
import { UserReward } from '../../domain/entities/user-reward.entity';
import { UserRewardOrmEntity } from './user-reward.orm-entity';
import { UserRewardMapper } from '../mappers/user-reward.mapper';

@Injectable()
export class UserRewardRepositoryImpl implements IUserRewardRepository {
  constructor(
    @InjectRepository(UserRewardOrmEntity)
    private readonly userRewardRepository: Repository<UserRewardOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserReward | null> {
    const ormEntity = await this.userRewardRepository.findOne({
      where: { id },
      relations: ['reward'],
    });
    return ormEntity ? UserRewardMapper.toDomain(ormEntity) : null;
  }

  async findByIdWithReward(id: string): Promise<{
    userReward: UserReward;
    rewardSponsorId: string | null;
  } | null> {
    const ormEntity = await this.userRewardRepository.findOne({
      where: { id },
      relations: ['reward', 'reward.sponsor'],
    });
    if (!ormEntity) {
      return null;
    }
    return {
      userReward: UserRewardMapper.toDomain(ormEntity),
      rewardSponsorId: ormEntity.reward.sponsorId,
    };
  }

  async findByRewardId(rewardId: string): Promise<UserReward[]> {
    const ormEntities = await this.userRewardRepository.find({
      where: { rewardId },
      relations: ['reward'],
    });
    return ormEntities.map((entity) => UserRewardMapper.toDomain(entity));
  }

  async findByUserId(userId: string): Promise<UserReward[]> {
    const ormEntities = await this.userRewardRepository.find({
      where: { userId },
      relations: ['reward'],
    });
    return ormEntities.map((entity) => UserRewardMapper.toDomain(entity));
  }

  async create(userReward: UserReward): Promise<UserReward> {
    const ormEntity = this.userRewardRepository.create(
      UserRewardMapper.toOrmEntity(userReward),
    );
    const savedEntity = await this.userRewardRepository.save(ormEntity);
    return UserRewardMapper.toDomain(savedEntity);
  }

  async update(userReward: UserReward): Promise<UserReward> {
    const ormEntity = await this.userRewardRepository.findOne({
      where: { id: userReward.id },
    });
    if (!ormEntity) {
      throw new Error(`UserReward with id ${userReward.id} not found`);
    }
    Object.assign(ormEntity, UserRewardMapper.toOrmEntity(userReward));
    const updatedEntity = await this.userRewardRepository.save(ormEntity);
    return UserRewardMapper.toDomain(updatedEntity);
  }
}
