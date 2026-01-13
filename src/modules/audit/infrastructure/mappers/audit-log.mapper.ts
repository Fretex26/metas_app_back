import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogOrmEntity } from '../persistence/audit-log.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de AuditLog
 */
export class AuditLogMapper {
  static toDomain(ormEntity: AuditLogOrmEntity): AuditLog {
    return new AuditLog(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.action,
      ormEntity.entity,
      ormEntity.entityId,
      ormEntity.previousData,
      ormEntity.newData,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: AuditLog): Partial<AuditLogOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      action: domainEntity.action,
      entity: domainEntity.entity,
      entityId: domainEntity.entityId,
      previousData: domainEntity.previousData,
      newData: domainEntity.newData,
    };
  }

  static toDomainList(ormEntities: AuditLogOrmEntity[]): AuditLog[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
