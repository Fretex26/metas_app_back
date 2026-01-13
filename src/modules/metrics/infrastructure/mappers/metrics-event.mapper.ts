import { MetricsEvent } from '../../domain/entities/metrics-event.entity';
import { MetricsEventOrmEntity } from '../persistence/metrics-event.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de MetricsEvent
 */
export class MetricsEventMapper {
  static toDomain(ormEntity: MetricsEventOrmEntity): MetricsEvent {
    return new MetricsEvent(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.eventType,
      ormEntity.payload,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: MetricsEvent,
  ): Partial<MetricsEventOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      eventType: domainEntity.eventType,
      payload: domainEntity.payload,
    };
  }

  static toDomainList(ormEntities: MetricsEventOrmEntity[]): MetricsEvent[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
