import { Injectable, Inject } from '@nestjs/common';
import type { IMetricsEventRepository } from '../../domain/repositories/metrics-event.repository';
import { MetricsEvent } from '../../domain/entities/metrics-event.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para registrar un evento de métrica
 */
@Injectable()
export class LogEventUseCase {
  constructor(
    @Inject('IMetricsEventRepository')
    private readonly metricsEventRepository: IMetricsEventRepository,
  ) {}

  async execute(
    eventType: string,
    userId: string | null = null,
    payload: Record<string, any> | null = null,
  ): Promise<MetricsEvent> {
    const event = new MetricsEvent(
      uuidv4(),
      userId,
      eventType,
      payload,
      new Date(),
    );

    return await this.metricsEventRepository.create(event);
  }
}
