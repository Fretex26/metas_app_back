import { Module } from '@nestjs/common';
import { StatisticsController } from './presentation/statistics.controller';
import { GetUserStatisticsUseCase } from './application/use-cases/get-user-statistics.use-case';
import { GamificationModule } from '../gamification/gamification.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';

/**
 * Módulo de estadísticas
 * 
 * Proporciona funcionalidades para consultar estadísticas del usuario:
 * - Estadísticas generales del usuario (puntos, badges, proyectos, tareas)
 */
@Module({
  imports: [GamificationModule, ProjectsModule, TasksModule],
  controllers: [StatisticsController],
  providers: [GetUserStatisticsUseCase],
})
export class StatisticsModule {}
