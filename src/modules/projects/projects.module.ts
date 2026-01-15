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
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { ReviewsModule } from '../reviews/reviews.module';

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
    // Use cases
    CreateProjectUseCase,
    GetUserProjectsUseCase,
    GetProjectByIdUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
  ],
  exports: ['IProjectRepository'],
})
export class ProjectsModule {}
