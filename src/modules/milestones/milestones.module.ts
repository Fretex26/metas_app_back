import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestonesController } from './presentation/milestones.controller';
import { MilestoneOrmEntity } from './infrastructure/persistence/milestone.orm-entity';
import { MilestoneRepositoryImpl } from './infrastructure/persistence/milestone.repository.impl';
import type { IMilestoneRepository } from './domain/repositories/milestone.repository';
import { CreateMilestoneUseCase } from './application/use-cases/create-milestone.use-case';
import { GetProjectMilestonesUseCase } from './application/use-cases/get-project-milestones.use-case';
import { GetMilestoneByIdUseCase } from './application/use-cases/get-milestone-by-id.use-case';
import { UpdateMilestoneUseCase } from './application/use-cases/update-milestone.use-case';
import { UpdateMilestoneStatusUseCase } from './application/use-cases/update-milestone-status.use-case';
import { DeleteMilestoneUseCase } from './application/use-cases/delete-milestone.use-case';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksModule } from '../tasks/tasks.module';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { GamificationModule } from '../gamification/gamification.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de milestones
 * 
 * Proporciona funcionalidades para gestión de milestones dentro de proyectos:
 * - Crear milestones
 * - Listar milestones de un proyecto
 * - Obtener milestone por ID
 * - Actualizar milestone
 * - Eliminar milestone
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MilestoneOrmEntity]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => SprintsModule),
    forwardRef(() => TasksModule),
    SponsorsModule,
    GamificationModule,
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [MilestonesController],
  providers: [
    // Repositorio
    {
      provide: 'IMilestoneRepository',
      useClass: MilestoneRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateMilestoneUseCase,
    GetProjectMilestonesUseCase,
    GetMilestoneByIdUseCase,
    UpdateMilestoneUseCase,
    UpdateMilestoneStatusUseCase,
    DeleteMilestoneUseCase,
  ],
  exports: [
    'IMilestoneRepository',
    UpdateMilestoneStatusUseCase, // Exportar para usar en TasksModule
  ],
})
export class MilestonesModule {}
