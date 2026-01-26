import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './presentation/tasks.controller';
import { ChecklistItemsController } from './presentation/checklist-items.controller';
import { TaskOrmEntity } from './infrastructure/persistence/task.orm-entity';
import { ChecklistItemOrmEntity } from './infrastructure/persistence/checklist-item.orm-entity';
import { TaskRepositoryImpl } from './infrastructure/persistence/task.repository.impl';
import { ChecklistItemRepositoryImpl } from './infrastructure/persistence/checklist-item.repository.impl';
import type { ITaskRepository } from './domain/repositories/task.repository';
import type { IChecklistItemRepository } from './domain/repositories/checklist-item.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetMilestoneTasksUseCase } from './application/use-cases/get-milestone-tasks.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status.use-case';
import { CreateChecklistItemUseCase } from './application/use-cases/create-checklist-item.use-case';
import { GetChecklistItemByIdUseCase } from './application/use-cases/get-checklist-item-by-id.use-case';
import { GetChecklistItemsByTaskIdUseCase } from './application/use-cases/get-checklist-items-by-task-id.use-case';
import { UpdateChecklistItemUseCase } from './application/use-cases/update-checklist-item.use-case';
import { DeleteChecklistItemUseCase } from './application/use-cases/delete-checklist-item.use-case';
import { SprintsModule } from '../sprints/sprints.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { ProjectsModule } from '../projects/projects.module';
import { DailyEntriesModule } from '../daily-entries/daily-entries.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

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
    forwardRef(() => SprintsModule),
    forwardRef(() => MilestonesModule),
    forwardRef(() => ProjectsModule),
    forwardRef(() => DailyEntriesModule), // Para eliminar daily entries en cascada
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [TasksController, ChecklistItemsController],
  providers: [
    // Repositorios
    {
      provide: 'ITaskRepository',
      useClass: TaskRepositoryImpl,
    },
    {
      provide: 'IChecklistItemRepository',
      useClass: ChecklistItemRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases - Tasks
    CreateTaskUseCase,
    GetMilestoneTasksUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    UpdateTaskStatusUseCase,
    // Use cases - ChecklistItems
    CreateChecklistItemUseCase,
    GetChecklistItemByIdUseCase,
    GetChecklistItemsByTaskIdUseCase,
    UpdateChecklistItemUseCase,
    DeleteChecklistItemUseCase,
  ],
  exports: ['ITaskRepository', 'IChecklistItemRepository'],
})
export class TasksModule {}
