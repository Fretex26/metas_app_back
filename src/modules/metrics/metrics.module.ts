import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsEventOrmEntity } from './infrastructure/persistence/metrics-event.orm-entity';
import { MetricsEventRepositoryImpl } from './infrastructure/persistence/metrics-event.repository.impl';
import type { IMetricsEventRepository } from './domain/repositories/metrics-event.repository';
import { LogEventUseCase } from './application/use-cases/log-event.use-case';

/**
 * Módulo de métricas
 * 
 * Proporciona funcionalidades para registrar eventos de métrica del sistema:
 * - Registrar eventos de métrica
 * 
 * Nota: Este módulo se usa principalmente de forma interna para logging de eventos
 */
@Module({
  imports: [TypeOrmModule.forFeature([MetricsEventOrmEntity])],
  controllers: [],
  providers: [
    // Repositorio
    {
      provide: 'IMetricsEventRepository',
      useClass: MetricsEventRepositoryImpl,
    },
    // Use cases
    LogEventUseCase,
  ],
  exports: ['IMetricsEventRepository', LogEventUseCase],
})
export class MetricsModule {}
