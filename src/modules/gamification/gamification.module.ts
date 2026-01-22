import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './presentation/gamification.controller';
import { PointsWalletOrmEntity } from './infrastructure/persistence/points-wallet.orm-entity';
import { PointsTransactionOrmEntity } from './infrastructure/persistence/points-transaction.orm-entity';
import { UserRewardOrmEntity } from './infrastructure/persistence/user-reward.orm-entity';
import { RewardOrmEntity } from './infrastructure/persistence/reward.orm-entity';
import { PointsWalletRepositoryImpl } from './infrastructure/persistence/points-wallet.repository.impl';
import { PointsTransactionRepositoryImpl } from './infrastructure/persistence/points-transaction.repository.impl';
import { UserRewardRepositoryImpl } from './infrastructure/persistence/user-reward.repository.impl';
import { RewardRepositoryImpl } from './infrastructure/persistence/reward.repository.impl';
import type { IPointsWalletRepository } from './domain/repositories/points-wallet.repository';
import type { IPointsTransactionRepository } from './domain/repositories/points-transaction.repository';
import type { IUserRewardRepository } from './domain/repositories/user-reward.repository';
import type { IRewardRepository } from './domain/repositories/reward.repository';
import { GetWalletUseCase } from './application/use-cases/get-wallet.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';
import { UpdateUserRewardStatusUseCase } from './application/use-cases/update-user-reward-status.use-case';
import { RewardService } from './domain/services/reward.service';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de gamificación
 * 
 * Proporciona funcionalidades para el sistema de gamificación:
 * - Billetera de puntos
 * - Historial de transacciones de puntos
 * - Gestión de recompensas de usuario
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsWalletOrmEntity,
      PointsTransactionOrmEntity,
      UserRewardOrmEntity,
      RewardOrmEntity,
    ]),
    SponsorsModule,
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
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
    {
      provide: 'IUserRewardRepository',
      useClass: UserRewardRepositoryImpl,
    },
    {
      provide: 'IRewardRepository',
      useClass: RewardRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    GetWalletUseCase,
    GetTransactionsUseCase,
    UpdateUserRewardStatusUseCase,
    // Services
    RewardService,
  ],
  exports: [
    'IPointsWalletRepository',
    'IPointsTransactionRepository',
    'IUserRewardRepository',
    'IRewardRepository',
    RewardService,
  ],
})
export class GamificationModule {}
