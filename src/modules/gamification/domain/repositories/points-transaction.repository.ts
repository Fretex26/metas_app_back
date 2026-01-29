import { PointsTransaction } from '../entities/points-transaction.entity';

/**
 * Interfaz del repositorio de points transactions
 */
export interface IPointsTransactionRepository {
  create(transaction: PointsTransaction): Promise<PointsTransaction>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<PointsTransaction[]>;
  countByUserId(userId: string): Promise<number>;
}
