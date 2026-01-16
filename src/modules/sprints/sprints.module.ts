import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SprintsController } from './presentation/sprints.controller';
import { SprintOrmEntity } from './infrastructure/persistence/sprint.orm-entity';
import { SprintRepositoryImpl } from './infrastructure/persistence/sprint.repository.impl';
import type { ISprintRepository } from './domain/repositories/sprint.repository';
import { CreateSprintUseCase } from './application/use-cases/create-sprint.use-case';
import { GetMilestoneSprintsUseCase } from './application/use-cases/get-milestone-sprints.use-case';
import { GetSprintByIdUseCase } from './application/use-cases/get-sprint-by-id.use-case';
import { UpdateSprintUseCase } from './application/use-cases/update-sprint.use-case';
import { DeleteSprintUseCase } from './application/use-cases/delete-sprint.use-case';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';

/**
 * Módulo de sprints
 * 
 * Proporciona funcionalidades para gestión de sprints dentro de milestones:
 * - Crear sprints (máximo 4 semanas por sprint)
 * - Listar sprints de un milestone
 * - Obtener sprint por ID
 * - Actualizar sprint
 * - Eliminar sprint
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SprintOrmEntity]),
    forwardRef(() => MilestonesModule),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [SprintsController],
  providers: [
    // Repositorio
    {
      provide: 'ISprintRepository',
      useClass: SprintRepositoryImpl,
    },
    // Use cases
    CreateSprintUseCase,
    GetMilestoneSprintsUseCase,
    GetSprintByIdUseCase,
    UpdateSprintUseCase,
    DeleteSprintUseCase,
  ],
  exports: ['ISprintRepository'],
})
export class SprintsModule {}
