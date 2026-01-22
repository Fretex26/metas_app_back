import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsoredGoalsController } from './presentation/sponsored-goals.controller';
import { SponsoredGoalOrmEntity } from './infrastructure/persistence/sponsored-goal.orm-entity';
import { SponsorEnrollmentOrmEntity } from './infrastructure/persistence/sponsor-enrollment.orm-entity';
import { VerificationEventOrmEntity } from './infrastructure/persistence/verification-event.orm-entity';
import { SponsoredGoalRepositoryImpl } from './infrastructure/persistence/sponsored-goal.repository.impl';
import type { ISponsoredGoalRepository } from './domain/repositories/sponsored-goal.repository';
import { CreateSponsoredGoalUseCase } from './application/use-cases/create-sponsored-goal.use-case';
import { ListAvailableSponsoredGoalsUseCase } from './application/use-cases/list-available-sponsored-goals.use-case';
import { FilterSponsoredGoalsByCategoriesUseCase } from './application/use-cases/filter-sponsored-goals-by-categories.use-case';
import { EnrollInSponsoredGoalUseCase } from './application/use-cases/enroll-in-sponsored-goal.use-case';
import { DuplicateSponsoredProjectUseCase } from './application/use-cases/duplicate-sponsored-project.use-case';
import { UpdateEnrollmentStatusUseCase } from './application/use-cases/update-enrollment-status.use-case';
import { VerifyMilestoneCompletionUseCase } from './application/use-cases/verify-milestone-completion.use-case';
import { GetUserSponsoredProjectsUseCase } from './application/use-cases/get-user-sponsored-projects.use-case';
import { SponsorEnrollmentRepositoryImpl } from './infrastructure/persistence/sponsor-enrollment.repository.impl';
import type { ISponsorEnrollmentRepository } from './domain/repositories/sponsor-enrollment.repository';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { ProjectsModule } from '../projects/projects.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de sponsored goals
 * 
 * Proporciona funcionalidades para gestión de objetivos patrocinados:
 * - Crear objetivos patrocinados (solo sponsors aprobados)
 * - Listar objetivos disponibles
 * 
 * Nota: Los enrollments y verification events se manejarán en futuras iteraciones
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SponsoredGoalOrmEntity,
      SponsorEnrollmentOrmEntity,
      VerificationEventOrmEntity,
    ]),
    SponsorsModule,
    ProjectsModule,
    MilestonesModule,
    SprintsModule,
    TasksModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [SponsoredGoalsController],
  providers: [
    // Repositorios
    {
      provide: 'ISponsoredGoalRepository',
      useClass: SponsoredGoalRepositoryImpl,
    },
    {
      provide: 'ISponsorEnrollmentRepository',
      useClass: SponsorEnrollmentRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateSponsoredGoalUseCase,
    ListAvailableSponsoredGoalsUseCase,
    FilterSponsoredGoalsByCategoriesUseCase,
    DuplicateSponsoredProjectUseCase,
    EnrollInSponsoredGoalUseCase,
    UpdateEnrollmentStatusUseCase,
    VerifyMilestoneCompletionUseCase,
    GetUserSponsoredProjectsUseCase,
  ],
  exports: [
    'ISponsoredGoalRepository',
    'ISponsorEnrollmentRepository',
  ],
})
export class SponsoredGoalsModule {}
