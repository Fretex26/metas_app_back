import { Injectable, Inject } from '@nestjs/common';
import type { IPointsTransactionRepository } from '../../domain/repositories/points-transaction.repository';
import { PointsTransaction } from '../../domain/entities/points-transaction.entity';

/**
 * Caso de uso para obtener el historial de transacciones de un usuario
 */
@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject('IPointsTransactionRepository')
    private readonly pointsTransactionRepository: IPointsTransactionRepository,
  ) {}

  async execute(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ transactions: PointsTransaction[]; total: number }> {
    const transactions = await this.pointsTransactionRepository.findByUserId(
      userId,
      limit,
      offset,
    );
    const total = await this.pointsTransactionRepository.countByUserId(userId);

    return { transactions, total };
  }
}
