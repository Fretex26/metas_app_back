import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './presentation/gamification.controller';
import { RewardsController } from './presentation/rewards.controller';
import { PointsWalletOrmEntity } from './infrastructure/persistence/points-wallet.orm-entity';
import { PointsTransactionOrmEntity } from './infrastructure/persistence/points-transaction.orm-entity';
import { UserRewardOrmEntity } from './infrastructure/persistence/user-reward.orm-entity';
import { RewardOrmEntity } from './infrastructure/persistence/reward.orm-entity';
import { PointsWalletRepositoryImpl } from './infrastructure/persistence/points-wallet.repository.impl';
import { PointsTransactionRepositoryImpl } from './infrastructure/persistence/points-transaction.repository.impl';
import { UserRewardRepositoryImpl } from './infrastructure/persistence/user-reward.repository.impl';
import { RewardRepositoryImpl } from './infrastructure/persistence/reward.repository.impl';
import { GetWalletUseCase } from './application/use-cases/get-wallet.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';
import { UpdateUserRewardStatusUseCase } from './application/use-cases/update-user-reward-status.use-case';
import { GetUserRewardsUseCase } from './application/use-cases/get-user-rewards.use-case';
import { GetRewardByIdUseCase } from './application/use-cases/get-reward-by-id.use-case';
import { RewardService } from './domain/services/reward.service';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de gamificación
 *
 * Proporciona funcionalidades para el sistema de gamificación:
 * - Billetera de puntos
 * - Historial de transacciones de puntos
 * - Gestión de recompensas de usuario
 * - Consulta de rewards asociadas a proyectos y milestones
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
    forwardRef(() => ProjectsModule), // Para acceder a IProjectRepository
    forwardRef(() => MilestonesModule), // Para acceder a IMilestoneRepository
  ],
  controllers: [GamificationController, RewardsController],
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
    GetUserRewardsUseCase,
    GetRewardByIdUseCase,
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
