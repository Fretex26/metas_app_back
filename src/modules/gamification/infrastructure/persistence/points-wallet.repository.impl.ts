import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPointsWalletRepository } from '../../domain/repositories/points-wallet.repository';
import { PointsWallet } from '../../domain/entities/points-wallet.entity';
import { PointsWalletOrmEntity } from './points-wallet.orm-entity';
import { PointsWalletMapper } from '../mappers/points-wallet.mapper';

@Injectable()
export class PointsWalletRepositoryImpl implements IPointsWalletRepository {
  constructor(
    @InjectRepository(PointsWalletOrmEntity)
    private readonly pointsWalletRepository: Repository<PointsWalletOrmEntity>,
  ) {}

  async create(wallet: PointsWallet): Promise<PointsWallet> {
    const ormEntity = this.pointsWalletRepository.create(
      PointsWalletMapper.toOrmEntity(wallet),
    );
    const savedEntity = await this.pointsWalletRepository.save(ormEntity);
    return PointsWalletMapper.toDomain(savedEntity);
  }

  async findByUserId(userId: string): Promise<PointsWallet | null> {
    const ormEntity = await this.pointsWalletRepository.findOne({
      where: { userId },
    });
    return ormEntity ? PointsWalletMapper.toDomain(ormEntity) : null;
  }

  async update(wallet: PointsWallet): Promise<PointsWallet> {
    const ormEntity = await this.pointsWalletRepository.findOne({
      where: { id: wallet.id },
    });
    if (!ormEntity) {
      throw new Error(`PointsWallet with id ${wallet.id} not found`);
    }
    Object.assign(ormEntity, PointsWalletMapper.toOrmEntity(wallet));
    const updatedEntity = await this.pointsWalletRepository.save(ormEntity);
    return PointsWalletMapper.toDomain(updatedEntity);
  }

  async createOrUpdate(wallet: PointsWallet): Promise<PointsWallet> {
    const existing = await this.findByUserId(wallet.userId);
    if (existing) {
      const updated = new PointsWallet(
        existing.id,
        existing.userId,
        wallet.balance,
        existing.createdAt,
        new Date(),
      );
      return await this.update(updated);
    }
    return await this.create(wallet);
  }
}
