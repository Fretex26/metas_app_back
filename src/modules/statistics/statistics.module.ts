import { Module } from '@nestjs/common';
import { StatisticsController } from './presentation/statistics.controller';
import { GetUserStatisticsUseCase } from './application/use-cases/get-user-statistics.use-case';
import { GamificationModule } from '../gamification/gamification.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de estadísticas
 * 
 * Proporciona funcionalidades para consultar estadísticas del usuario:
 * - Estadísticas generales del usuario (puntos, badges, proyectos, tareas)
 */
@Module({
  imports: [
    GamificationModule,
    ProjectsModule,
    TasksModule,
    UsersModule, // Para usar el repositorio de usuarios en LoadUserInterceptor
  ],
  controllers: [StatisticsController],
  providers: [
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    GetUserStatisticsUseCase,
  ],
})
export class StatisticsModule {}
