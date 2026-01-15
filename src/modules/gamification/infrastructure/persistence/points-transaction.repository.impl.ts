import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPointsTransactionRepository } from '../../domain/repositories/points-transaction.repository';
import { PointsTransaction } from '../../domain/entities/points-transaction.entity';
import { PointsTransactionOrmEntity } from './points-transaction.orm-entity';
import { PointsTransactionMapper } from '../mappers/points-transaction.mapper';

@Injectable()
export class PointsTransactionRepositoryImpl
  implements IPointsTransactionRepository
{
  constructor(
    @InjectRepository(PointsTransactionOrmEntity)
    private readonly pointsTransactionRepository: Repository<PointsTransactionOrmEntity>,
  ) {}

  async create(
    transaction: PointsTransaction,
  ): Promise<PointsTransaction> {
    const ormEntity = this.pointsTransactionRepository.create(
      PointsTransactionMapper.toOrmEntity(transaction),
    );
    const savedEntity = await this.pointsTransactionRepository.save(ormEntity);
    return PointsTransactionMapper.toDomain(savedEntity);
  }

  async findByUserId(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<PointsTransaction[]> {
    const ormEntities = await this.pointsTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return PointsTransactionMapper.toDomainList(ormEntities);
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.pointsTransactionRepository.count({
      where: { userId },
    });
  }
}
