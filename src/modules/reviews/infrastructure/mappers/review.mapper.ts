import { Review } from '../../domain/entities/review.entity';
import { ReviewOrmEntity } from '../persistence/review.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Review
 */
export class ReviewMapper {
  static toDomain(ormEntity: ReviewOrmEntity): Review {
    return new Review(
      ormEntity.id,
      ormEntity.sprintId,
      ormEntity.userId,
      ormEntity.progressPercentage,
      ormEntity.extraPoints,
      ormEntity.summary,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Review): Partial<ReviewOrmEntity> {
    return {
      id: domainEntity.id,
      sprintId: domainEntity.sprintId,
      userId: domainEntity.userId,
      progressPercentage: domainEntity.progressPercentage,
      extraPoints: domainEntity.extraPoints,
      summary: domainEntity.summary,
    };
  }
}
