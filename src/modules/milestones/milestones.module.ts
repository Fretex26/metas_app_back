import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestonesController } from './presentation/milestones.controller';
import { MilestoneOrmEntity } from './infrastructure/persistence/milestone.orm-entity';
import { MilestoneRepositoryImpl } from './infrastructure/persistence/milestone.repository.impl';
import type { IMilestoneRepository } from './domain/repositories/milestone.repository';
import { CreateMilestoneUseCase } from './application/use-cases/create-milestone.use-case';
import { GetProjectMilestonesUseCase } from './application/use-cases/get-project-milestones.use-case';
import { GetMilestoneByIdUseCase } from './application/use-cases/get-milestone-by-id.use-case';
import { UpdateMilestoneUseCase } from './application/use-cases/update-milestone.use-case';
import { DeleteMilestoneUseCase } from './application/use-cases/delete-milestone.use-case';
import { ProjectsModule } from '../projects/projects.module';

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
    ProjectsModule,
  ],
  controllers: [MilestonesController],
  providers: [
    // Repositorio
    {
      provide: 'IMilestoneRepository',
      useClass: MilestoneRepositoryImpl,
    },
    // Use cases
    CreateMilestoneUseCase,
    GetProjectMilestonesUseCase,
    GetMilestoneByIdUseCase,
    UpdateMilestoneUseCase,
    DeleteMilestoneUseCase,
  ],
  exports: ['IMilestoneRepository'],
})
export class MilestonesModule {}
