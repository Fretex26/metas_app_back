import { PointsTransaction } from '../../domain/entities/points-transaction.entity';
import { PointsTransactionOrmEntity } from '../persistence/points-transaction.orm-entity';
import { PointsSourceType } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de PointsTransaction
 */
export class PointsTransactionMapper {
  static toDomain(ormEntity: PointsTransactionOrmEntity): PointsTransaction {
    return new PointsTransaction(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.change,
      ormEntity.reason,
      ormEntity.sourceType,
      ormEntity.sourceId,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: PointsTransaction,
  ): Partial<PointsTransactionOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      change: domainEntity.change,
      reason: domainEntity.reason,
      sourceType: domainEntity.sourceType,
      sourceId: domainEntity.sourceId,
    };
  }

  static toDomainList(
    ormEntities: PointsTransactionOrmEntity[],
  ): PointsTransaction[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
