import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './infrastructure/persistence/audit-log.orm-entity';
import { AuditLogRepositoryImpl } from './infrastructure/persistence/audit-log.repository.impl';
import type { IAuditLogRepository } from './domain/repositories/audit-log.repository';
import { LogActionUseCase } from './application/use-cases/log-action.use-case';

/**
 * Módulo de auditoría
 * 
 * Proporciona funcionalidades para registrar logs de auditoría:
 * - Registrar acciones administrativas y cambios críticos
 * 
 * Nota: Este módulo se usa principalmente de forma interna para auditoría
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [],
  providers: [
    // Repositorio
    {
      provide: 'IAuditLogRepository',
      useClass: AuditLogRepositoryImpl,
    },
    // Use cases
    LogActionUseCase,
  ],
  exports: ['IAuditLogRepository', LogActionUseCase],
})
export class AuditModule {}
