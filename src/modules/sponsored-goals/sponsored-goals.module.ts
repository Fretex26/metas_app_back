import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsoredGoalsController } from './presentation/sponsored-goals.controller';
import { SponsoredGoalOrmEntity } from './infrastructure/persistence/sponsored-goal.orm-entity';
import { SponsorEnrollmentOrmEntity } from './infrastructure/persistence/sponsor-enrollment.orm-entity';
import { VerificationEventOrmEntity } from './infrastructure/persistence/verification-event.orm-entity';
import { SponsoredGoalRepositoryImpl } from './infrastructure/persistence/sponsored-goal.repository.impl';
import type { ISponsoredGoalRepository } from './domain/repositories/sponsored-goal.repository';
import { CreateSponsoredGoalUseCase } from './application/use-cases/create-sponsored-goal.use-case';
import { ListAvailableSponsoredGoalsUseCase } from './application/use-cases/list-available-sponsored-goals.use-case';
import { SponsorsModule } from '../sponsors/sponsors.module';

/**
 * Módulo de sponsored goals
 * 
 * Proporciona funcionalidades para gestión de objetivos patrocinados:
 * - Crear objetivos patrocinados (solo sponsors aprobados)
 * - Listar objetivos disponibles
 * 
 * Nota: Los enrollments y verification events se manejarán en futuras iteraciones
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SponsoredGoalOrmEntity,
      SponsorEnrollmentOrmEntity,
      VerificationEventOrmEntity,
    ]),
    SponsorsModule,
  ],
  controllers: [SponsoredGoalsController],
  providers: [
    // Repositorio
    {
      provide: 'ISponsoredGoalRepository',
      useClass: SponsoredGoalRepositoryImpl,
    },
    // Use cases
    CreateSponsoredGoalUseCase,
    ListAvailableSponsoredGoalsUseCase,
  ],
  exports: ['ISponsoredGoalRepository'],
})
export class SponsoredGoalsModule {}
