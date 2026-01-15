import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './presentation/reviews.controller';
import { ReviewOrmEntity } from './infrastructure/persistence/review.orm-entity';
import { ReviewRepositoryImpl } from './infrastructure/persistence/review.repository.impl';
import type { IReviewRepository } from './domain/repositories/review.repository';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { GetSprintReviewUseCase } from './application/use-cases/get-sprint-review.use-case';
import { GetProjectProgressUseCase } from './application/use-cases/get-project-progress.use-case';
import { SprintsModule } from '../sprints/sprints.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';

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
    SprintsModule,
    MilestonesModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [ReviewsController],
  providers: [
    // Repositorio
    {
      provide: 'IReviewRepository',
      useClass: ReviewRepositoryImpl,
    },
    // Use cases
    CreateReviewUseCase,
    GetSprintReviewUseCase,
    GetProjectProgressUseCase,
  ],
  exports: ['IReviewRepository', GetProjectProgressUseCase],
})
export class ReviewsModule {}
