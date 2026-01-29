import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './presentation/reviews.controller';
import { PendingSprintsController } from './presentation/pending-sprints.controller';
import { ReviewOrmEntity } from './infrastructure/persistence/review.orm-entity';
import { ReviewRepositoryImpl } from './infrastructure/persistence/review.repository.impl';
import type { IReviewRepository } from './domain/repositories/review.repository';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { GetSprintReviewUseCase } from './application/use-cases/get-sprint-review.use-case';
import { GetProjectProgressUseCase } from './application/use-cases/get-project-progress.use-case';
import { GetPendingSprintsUseCase } from './application/use-cases/get-pending-sprints.use-case';
import { SprintsModule } from '../sprints/sprints.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { RetrospectivesModule } from '../retrospectives/retrospectives.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de reviews
 *
 * Proporciona funcionalidades para gestión de revisiones de sprints:
 * - Crear review de sprint (una por sprint)
 * - Obtener review de sprint
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity]),
    forwardRef(() => SprintsModule),
    MilestonesModule,
    forwardRef(() => ProjectsModule),
    forwardRef(() => TasksModule),
    forwardRef(() => RetrospectivesModule),
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [ReviewsController, PendingSprintsController],
  providers: [
    // Repositorio
    {
      provide: 'IReviewRepository',
      useClass: ReviewRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateReviewUseCase,
    GetSprintReviewUseCase,
    GetProjectProgressUseCase,
    GetPendingSprintsUseCase,
  ],
  exports: ['IReviewRepository', GetProjectProgressUseCase],
})
export class ReviewsModule {}
