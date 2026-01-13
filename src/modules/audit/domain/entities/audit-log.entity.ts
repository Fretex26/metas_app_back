/**
 * Entidad de dominio AuditLog
 * Representa un log de auditoría
 */
export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly action: string,
    public readonly entity: string,
    public readonly entityId: string,
    public readonly previousData: Record<string, any> | null,
    public readonly newData: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}
}
