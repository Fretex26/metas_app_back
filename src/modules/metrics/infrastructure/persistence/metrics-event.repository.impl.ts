import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IMetricsEventRepository } from '../../domain/repositories/metrics-event.repository';
import { MetricsEvent } from '../../domain/entities/metrics-event.entity';
import { MetricsEventOrmEntity } from './metrics-event.orm-entity';
import { MetricsEventMapper } from '../mappers/metrics-event.mapper';

@Injectable()
export class MetricsEventRepositoryImpl implements IMetricsEventRepository {
  constructor(
    @InjectRepository(MetricsEventOrmEntity)
    private readonly metricsEventRepository: Repository<MetricsEventOrmEntity>,
  ) {}

  async create(event: MetricsEvent): Promise<MetricsEvent> {
    const ormEntity = this.metricsEventRepository.create(
      MetricsEventMapper.toOrmEntity(event),
    );
    const savedEntity = await this.metricsEventRepository.save(ormEntity);
    return MetricsEventMapper.toDomain(savedEntity);
  }

  async findByEventType(
    eventType: string,
    limit = 100,
  ): Promise<MetricsEvent[]> {
    const ormEntities = await this.metricsEventRepository.find({
      where: { eventType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return MetricsEventMapper.toDomainList(ormEntities);
  }

  async findByUserId(userId: string, limit = 100): Promise<MetricsEvent[]> {
    const ormEntities = await this.metricsEventRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return MetricsEventMapper.toDomainList(ormEntities);
  }
}
