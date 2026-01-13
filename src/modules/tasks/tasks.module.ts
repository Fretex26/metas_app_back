import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './presentation/tasks.controller';
import { TaskOrmEntity } from './infrastructure/persistence/task.orm-entity';
import { ChecklistItemOrmEntity } from './infrastructure/persistence/checklist-item.orm-entity';
import { TaskRepositoryImpl } from './infrastructure/persistence/task.repository.impl';
import type { ITaskRepository } from './domain/repositories/task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetSprintTasksUseCase } from './application/use-cases/get-sprint-tasks.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { SprintsModule } from '../sprints/sprints.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';

/**
 * Módulo de tasks
 * 
 * Proporciona funcionalidades para gestión de tasks dentro de sprints:
 * - Crear tasks (validar que el periodo no exceda el del sprint)
 * - Listar tasks de un sprint
 * - Obtener task por ID
 * - Actualizar task
 * - Eliminar task
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TaskOrmEntity, ChecklistItemOrmEntity]),
    SprintsModule,
    MilestonesModule,
    ProjectsModule,
  ],
  controllers: [TasksController],
  providers: [
    // Repositorio
    {
      provide: 'ITaskRepository',
      useClass: TaskRepositoryImpl,
    },
    // Use cases
    CreateTaskUseCase,
    GetSprintTasksUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
  ],
  exports: ['ITaskRepository'],
})
export class TasksModule {}
