import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';
import { SponsoredGoalOrmEntity } from './sponsored-goal.orm-entity';
import { SponsoredGoalMapper } from '../mappers/sponsored-goal.mapper';
import { CategoryOrmEntity } from '../../../categories/infrastructure/persistence/category.orm-entity';

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
    // Asignar categorías si existen
    if (sponsoredGoal.categories && sponsoredGoal.categories.length > 0) {
      ormEntity.categories = sponsoredGoal.categories.map((cat) => {
        const catOrm = new CategoryOrmEntity();
        catOrm.id = cat.id;
        return catOrm;
      });
    }
    const savedEntity = await this.sponsoredGoalRepository.save(ormEntity);
    // Recargar con relaciones
    const reloaded = await this.sponsoredGoalRepository.findOne({
      where: { id: savedEntity.id },
      relations: ['sponsor', 'categories'],
    });
    return reloaded ? SponsoredGoalMapper.toDomain(reloaded) : SponsoredGoalMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<SponsoredGoal | null> {
    const ormEntity = await this.sponsoredGoalRepository.findOne({
      where: { id },
      relations: ['sponsor', 'categories'],
    });
    return ormEntity ? SponsoredGoalMapper.toDomain(ormEntity) : null;
  }

  async findBySponsorId(sponsorId: string): Promise<SponsoredGoal[]> {
    const ormEntities = await this.sponsoredGoalRepository.find({
      where: { sponsorId },
      order: { createdAt: 'DESC' },
      relations: ['sponsor', 'categories'],
    });
    return SponsoredGoalMapper.toDomainList(ormEntities);
  }

  async findByProjectId(projectId: string): Promise<SponsoredGoal | null> {
    const ormEntity = await this.sponsoredGoalRepository.findOne({
      where: { projectId },
      relations: ['sponsor', 'categories'],
    });
    return ormEntity ? SponsoredGoalMapper.toDomain(ormEntity) : null;
  }

  async findAvailableGoals(): Promise<SponsoredGoal[]> {
    const now = new Date();
    const ormEntities = await this.sponsoredGoalRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['sponsor', 'categories'],
      order: { createdAt: 'DESC' },
    });
    return SponsoredGoalMapper.toDomainList(ormEntities);
  }

  async findByCategoryIds(categoryIds: string[]): Promise<SponsoredGoal[]> {
    const now = new Date();
    const ormEntities = await this.sponsoredGoalRepository
      .createQueryBuilder('sg')
      .innerJoin('sg.categories', 'category')
      .where('category.id IN (:...categoryIds)', { categoryIds })
      .andWhere('sg.startDate <= :now', { now })
      .andWhere('sg.endDate >= :now', { now })
      .leftJoinAndSelect('sg.sponsor', 'sponsor')
      .leftJoinAndSelect('sg.categories', 'categories')
      .orderBy('sg.createdAt', 'DESC')
      .getMany();
    return SponsoredGoalMapper.toDomainList(ormEntities);
  }

  async update(sponsoredGoal: SponsoredGoal): Promise<SponsoredGoal> {
    const ormEntity = await this.sponsoredGoalRepository.findOne({
      where: { id: sponsoredGoal.id },
      relations: ['categories'],
    });
    if (!ormEntity) {
      throw new Error(
        `SponsoredGoal with id ${sponsoredGoal.id} not found`,
      );
    }
    Object.assign(ormEntity, SponsoredGoalMapper.toOrmEntity(sponsoredGoal));
    // Actualizar categorías si existen
    if (sponsoredGoal.categories) {
      ormEntity.categories = sponsoredGoal.categories.map((cat) => {
        const catOrm = new CategoryOrmEntity();
        catOrm.id = cat.id;
        return catOrm;
      });
    }
    const updatedEntity = await this.sponsoredGoalRepository.save(ormEntity);
    // Recargar con relaciones
    const reloaded = await this.sponsoredGoalRepository.findOne({
      where: { id: updatedEntity.id },
      relations: ['sponsor', 'categories'],
    });
    return reloaded ? SponsoredGoalMapper.toDomain(reloaded) : SponsoredGoalMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.sponsoredGoalRepository.delete(id);
  }
}
