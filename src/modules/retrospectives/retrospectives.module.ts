import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetrospectivesController } from './presentation/retrospectives.controller';
import { PublicRetrospectivesController } from './presentation/public-retrospectives.controller';
import { RetrospectiveOrmEntity } from './infrastructure/persistence/retrospective.orm-entity';
import { RetrospectiveRepositoryImpl } from './infrastructure/persistence/retrospective.repository.impl';
import type { IRetrospectiveRepository } from './domain/repositories/retrospective.repository';
import { CreateRetrospectiveUseCase } from './application/use-cases/create-retrospective.use-case';
import { GetSprintRetrospectiveUseCase } from './application/use-cases/get-sprint-retrospective.use-case';
import { GetPublicRetrospectivesUseCase } from './application/use-cases/get-public-retrospectives.use-case';
import { SprintsModule } from '../sprints/sprints.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de retrospectives
 * 
 * Proporciona funcionalidades para gestión de retrospectivas de sprints:
 * - Crear retrospectiva de sprint (una por sprint)
 * - Obtener retrospectiva de sprint (pública o privada)
 * - Listar retrospectivas públicas
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RetrospectiveOrmEntity]),
    forwardRef(() => SprintsModule),
    forwardRef(() => MilestonesModule),
    forwardRef(() => ProjectsModule),
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [RetrospectivesController, PublicRetrospectivesController],
  providers: [
    // Repositorio
    {
      provide: 'IRetrospectiveRepository',
      useClass: RetrospectiveRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateRetrospectiveUseCase,
    GetSprintRetrospectiveUseCase,
    GetPublicRetrospectivesUseCase,
  ],
  exports: ['IRetrospectiveRepository'],
})
export class RetrospectivesModule {}
