import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './presentation/gamification.controller';
import { PointsWalletOrmEntity } from './infrastructure/persistence/points-wallet.orm-entity';
import { PointsTransactionOrmEntity } from './infrastructure/persistence/points-transaction.orm-entity';
import { PointsWalletRepositoryImpl } from './infrastructure/persistence/points-wallet.repository.impl';
import { PointsTransactionRepositoryImpl } from './infrastructure/persistence/points-transaction.repository.impl';
import type { IPointsWalletRepository } from './domain/repositories/points-wallet.repository';
import type { IPointsTransactionRepository } from './domain/repositories/points-transaction.repository';
import { GetWalletUseCase } from './application/use-cases/get-wallet.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';

/**
 * Módulo de gamificación
 * 
 * Proporciona funcionalidades para el sistema de gamificación:
 * - Billetera de puntos
 * - Historial de transacciones de puntos
 * 
 * Nota: Badges, Rewards y User Rewards se pueden agregar en futuras iteraciones
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsWalletOrmEntity,
      PointsTransactionOrmEntity,
    ]),
  ],
  controllers: [GamificationController],
  providers: [
    // Repositorios
    {
      provide: 'IPointsWalletRepository',
      useClass: PointsWalletRepositoryImpl,
    },
    {
      provide: 'IPointsTransactionRepository',
      useClass: PointsTransactionRepositoryImpl,
    },
    // Use cases
    GetWalletUseCase,
    GetTransactionsUseCase,
  ],
  exports: [
    'IPointsWalletRepository',
    'IPointsTransactionRepository',
  ],
})
export class GamificationModule {}
