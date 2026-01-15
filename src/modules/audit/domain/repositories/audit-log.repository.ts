import { AuditLog } from '../entities/audit-log.entity';

/**
 * Interfaz del repositorio de audit logs
 */
export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
  findByEntity(entity: string, entityId: string, limit?: number): Promise<AuditLog[]>;
}
