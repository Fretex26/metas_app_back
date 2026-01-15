/**
 * Entidad de dominio MetricsEvent
 * Representa un evento de métrica del sistema
 */
export class MetricsEvent {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly eventType: string,
    public readonly payload: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}
}
