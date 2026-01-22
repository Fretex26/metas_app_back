import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyEntriesController } from './presentation/daily-entries.controller';
import { DailyEntryOrmEntity } from './infrastructure/persistence/daily-entry.orm-entity';
import { DailyEntryRepositoryImpl } from './infrastructure/persistence/daily-entry.repository.impl';
import type { IDailyEntryRepository } from './domain/repositories/daily-entry.repository';
import { CreateDailyEntryUseCase } from './application/use-cases/create-daily-entry.use-case';
import { GetUserDailyEntriesUseCase } from './application/use-cases/get-user-daily-entries.use-case';
import { GetDailyEntryByDateUseCase } from './application/use-cases/get-daily-entry-by-date.use-case';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { SprintsModule } from '../sprints/sprints.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de daily entries
 * 
 * Proporciona funcionalidades para gestión de entradas diarias:
 * - Crear entrada diaria
 * - Listar entradas diarias del usuario
 * - Obtener entrada diaria por fecha
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DailyEntryOrmEntity]),
    UsersModule,
    forwardRef(() => TasksModule),
    forwardRef(() => SprintsModule),
  ],
  controllers: [DailyEntriesController],
  providers: [
    // Repositorio
    {
      provide: 'IDailyEntryRepository',
      useClass: DailyEntryRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateDailyEntryUseCase,
    GetUserDailyEntriesUseCase,
    GetDailyEntryByDateUseCase,
  ],
  exports: ['IDailyEntryRepository'],
})
export class DailyEntriesModule {}
