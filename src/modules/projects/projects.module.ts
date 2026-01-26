import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './presentation/projects.controller';
import { ProjectOrmEntity } from './infrastructure/persistence/project.orm-entity';
import { ProjectRepositoryImpl } from './infrastructure/persistence/project.repository.impl';
import type { IProjectRepository } from './domain/repositories/project.repository';
import { ProjectDomainService } from './domain/services/project.domain-service';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { GetUserProjectsUseCase } from './application/use-cases/get-user-projects.use-case';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { UpdateProjectStatusUseCase } from './application/use-cases/update-project-status.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { ReviewsModule } from '../reviews/reviews.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { TasksModule } from '../tasks/tasks.module';
import { SprintsModule } from '../sprints/sprints.module';
import { RetrospectivesModule } from '../retrospectives/retrospectives.module';
import { DailyEntriesModule } from '../daily-entries/daily-entries.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de proyectos
 * 
 * Proporciona funcionalidades para gestión de proyectos personales:
 * - Crear proyectos (máximo 6 por usuario)
 * - Listar proyectos del usuario
 * - Obtener proyecto por ID
 * - Actualizar proyecto
 * - Eliminar proyecto
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectOrmEntity]),
    forwardRef(() => ReviewsModule),
    forwardRef(() => MilestonesModule),
    forwardRef(() => TasksModule), // Para eliminar tasks y checklist items en cascada
    forwardRef(() => SprintsModule), // Para eliminar sprints en cascada
    forwardRef(() => RetrospectivesModule), // Para eliminar retrospectives en cascada
    forwardRef(() => DailyEntriesModule), // Para eliminar daily entries en cascada
    GamificationModule,
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [ProjectsController],
  providers: [
    // Repositorio
    {
      provide: 'IProjectRepository',
      useClass: ProjectRepositoryImpl,
    },
    // Servicios de dominio
    ProjectDomainService,
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateProjectUseCase,
    GetUserProjectsUseCase,
    GetProjectByIdUseCase,
    UpdateProjectUseCase,
    UpdateProjectStatusUseCase,
    DeleteProjectUseCase,
  ],
  exports: [
    'IProjectRepository',
    UpdateProjectStatusUseCase, // Exportar para usar en MilestonesModule
  ],
})
export class ProjectsModule {}
