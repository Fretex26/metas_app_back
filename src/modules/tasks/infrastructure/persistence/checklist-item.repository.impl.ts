import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IChecklistItemRepository } from '../../domain/repositories/checklist-item.repository';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistItemOrmEntity } from './checklist-item.orm-entity';
import { ChecklistItemMapper } from '../mappers/checklist-item.mapper';

@Injectable()
export class ChecklistItemRepositoryImpl
  implements IChecklistItemRepository
{
  constructor(
    @InjectRepository(ChecklistItemOrmEntity)
    private readonly checklistItemRepository: Repository<ChecklistItemOrmEntity>,
  ) {}

  async create(checklistItem: ChecklistItem): Promise<ChecklistItem> {
    const ormEntity = this.checklistItemRepository.create(
      ChecklistItemMapper.toOrmEntity(checklistItem),
    );
    const savedEntity = await this.checklistItemRepository.save(ormEntity);
    return ChecklistItemMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ChecklistItem | null> {
    const ormEntity = await this.checklistItemRepository.findOne({
      where: { id },
    });
    return ormEntity ? ChecklistItemMapper.toDomain(ormEntity) : null;
  }

  async findByTaskId(taskId: string): Promise<ChecklistItem[]> {
    const ormEntities = await this.checklistItemRepository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
    return ChecklistItemMapper.toDomainList(ormEntities);
  }

  async findBySponsoredGoalId(
    sponsoredGoalId: string,
  ): Promise<ChecklistItem[]> {
    const ormEntities = await this.checklistItemRepository.find({
      where: { sponsoredGoalId },
      order: { createdAt: 'ASC' },
    });
    return ChecklistItemMapper.toDomainList(ormEntities);
  }

  async update(checklistItem: ChecklistItem): Promise<ChecklistItem> {
    const ormEntity = await this.checklistItemRepository.findOne({
      where: { id: checklistItem.id },
    });
    if (!ormEntity) {
      throw new Error(
        `ChecklistItem with id ${checklistItem.id} not found`,
      );
    }
    Object.assign(ormEntity, ChecklistItemMapper.toOrmEntity(checklistItem));
    const updatedEntity = await this.checklistItemRepository.save(ormEntity);
    return ChecklistItemMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.checklistItemRepository.delete(id);
  }
}
