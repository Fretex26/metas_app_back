import { MetricsEvent } from '../entities/metrics-event.entity';

/**
 * Interfaz del repositorio de metrics events
 */
export interface IMetricsEventRepository {
  create(event: MetricsEvent): Promise<MetricsEvent>;
  findByEventType(eventType: string, limit?: number): Promise<MetricsEvent[]>;
  findByUserId(userId: string, limit?: number): Promise<MetricsEvent[]>;
}
