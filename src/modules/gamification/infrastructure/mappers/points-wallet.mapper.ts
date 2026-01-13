import { PointsWallet } from '../../domain/entities/points-wallet.entity';
import { PointsWalletOrmEntity } from '../persistence/points-wallet.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de PointsWallet
 */
export class PointsWalletMapper {
  static toDomain(ormEntity: PointsWalletOrmEntity): PointsWallet {
    return new PointsWallet(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.balance,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmEntity(
    domainEntity: PointsWallet,
  ): Partial<PointsWalletOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      balance: domainEntity.balance,
    };
  }
}
