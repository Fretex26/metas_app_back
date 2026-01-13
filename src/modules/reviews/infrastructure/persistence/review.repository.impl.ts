import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IReviewRepository } from '../../domain/repositories/review.repository';
import { Review } from '../../domain/entities/review.entity';
import { ReviewOrmEntity } from './review.orm-entity';
import { ReviewMapper } from '../mappers/review.mapper';

@Injectable()
export class ReviewRepositoryImpl implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepository: Repository<ReviewOrmEntity>,
  ) {}

  async create(review: Review): Promise<Review> {
    const ormEntity = this.reviewRepository.create(
      ReviewMapper.toOrmEntity(review),
    );
    const savedEntity = await this.reviewRepository.save(ormEntity);
    return ReviewMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Review | null> {
    const ormEntity = await this.reviewRepository.findOne({
      where: { id },
      relations: ['sprint', 'user'],
    });
    return ormEntity ? ReviewMapper.toDomain(ormEntity) : null;
  }

  async findBySprintId(sprintId: string): Promise<Review | null> {
    const ormEntity = await this.reviewRepository.findOne({
      where: { sprintId },
      relations: ['sprint', 'user'],
    });
    return ormEntity ? ReviewMapper.toDomain(ormEntity) : null;
  }

  async update(review: Review): Promise<Review> {
    const ormEntity = await this.reviewRepository.findOne({
      where: { id: review.id },
    });
    if (!ormEntity) {
      throw new Error(`Review with id ${review.id} not found`);
    }
    Object.assign(ormEntity, ReviewMapper.toOrmEntity(review));
    const updatedEntity = await this.reviewRepository.save(ormEntity);
    return ReviewMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
