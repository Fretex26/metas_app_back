import { Injectable, Inject } from '@nestjs/common';
import type { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para registrar una acción en el log de auditoría
 */
@Injectable()
export class LogActionUseCase {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    previousData: Record<string, any> | null = null,
    newData: Record<string, any> | null = null,
  ): Promise<AuditLog> {
    const auditLog = new AuditLog(
      uuidv4(),
      userId,
      action,
      entity,
      entityId,
      previousData,
      newData,
      new Date(),
    );

    return await this.auditLogRepository.create(auditLog);
  }
}
