import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import type { IDailyEntryRepository } from '../../domain/repositories/daily-entry.repository';
import { DailyEntry } from '../../domain/entities/daily-entry.entity';
import { DailyEntryOrmEntity } from './daily-entry.orm-entity';
import { DailyEntryMapper } from '../mappers/daily-entry.mapper';
import { getCreatedAtBoundsForCalendarDay } from '../../../../shared/utils/daily-entry-day-bounds.util';

@Injectable()
export class DailyEntryRepositoryImpl implements IDailyEntryRepository {
  constructor(
    @InjectRepository(DailyEntryOrmEntity)
    private readonly dailyEntryRepository: Repository<DailyEntryOrmEntity>,
  ) {}

  async create(dailyEntry: DailyEntry): Promise<DailyEntry> {
    const ormEntity = this.dailyEntryRepository.create(
      DailyEntryMapper.toOrmEntity(dailyEntry),
    );
    const savedEntity = await this.dailyEntryRepository.save(ormEntity);
    return DailyEntryMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<DailyEntry | null> {
    const ormEntity = await this.dailyEntryRepository.findOne({
      where: { id },
      relations: ['user', 'task', 'sprint'],
    });
    return ormEntity ? DailyEntryMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<DailyEntry[]> {
    const ormEntities = await this.dailyEntryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return DailyEntryMapper.toDomainList(ormEntities);
  }

  async findByUserIdAndDate(
    userId: string,
    dateYmd: string,
    timeZoneOffsetMinutes: number,
  ): Promise<DailyEntry | null> {
    const { start, end } = getCreatedAtBoundsForCalendarDay(
      dateYmd,
      timeZoneOffsetMinutes,
    );

    const ormEntity = await this.dailyEntryRepository.findOne({
      where: {
        userId,
        createdAt: Between(start, end),
      },
    });
    return ormEntity ? DailyEntryMapper.toDomain(ormEntity) : null;
  }

  async findByUserIdAndDateAndSprintId(
    userId: string,
    dateYmd: string,
    sprintId: string,
    timeZoneOffsetMinutes: number,
  ): Promise<DailyEntry | null> {
    const { start, end } = getCreatedAtBoundsForCalendarDay(
      dateYmd,
      timeZoneOffsetMinutes,
    );

    const ormEntity = await this.dailyEntryRepository.findOne({
      where: {
        userId,
        sprintId,
        createdAt: Between(start, end),
      },
    });
    return ormEntity ? DailyEntryMapper.toDomain(ormEntity) : null;
  }

  async findByTaskId(taskId: string): Promise<DailyEntry[]> {
    const ormEntities = await this.dailyEntryRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
    return DailyEntryMapper.toDomainList(ormEntities);
  }

  async findBySprintId(sprintId: string): Promise<DailyEntry[]> {
    const ormEntities = await this.dailyEntryRepository.find({
      where: { sprintId },
      order: { createdAt: 'DESC' },
    });
    return DailyEntryMapper.toDomainList(ormEntities);
  }

  async update(dailyEntry: DailyEntry): Promise<DailyEntry> {
    const ormEntity = await this.dailyEntryRepository.findOne({
      where: { id: dailyEntry.id },
    });
    if (!ormEntity) {
      throw new Error(`DailyEntry with id ${dailyEntry.id} not found`);
    }
    Object.assign(ormEntity, DailyEntryMapper.toOrmEntity(dailyEntry));
    const updatedEntity = await this.dailyEntryRepository.save(ormEntity);
    return DailyEntryMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.dailyEntryRepository.delete(id);
  }
}
