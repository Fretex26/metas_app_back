import { Retrospective } from '../../domain/entities/retrospective.entity';
import { RetrospectiveOrmEntity } from '../persistence/retrospective.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Retrospective
 */
export class RetrospectiveMapper {
  static toDomain(ormEntity: RetrospectiveOrmEntity): Retrospective {
    return new Retrospective(
      ormEntity.id,
      ormEntity.sprintId,
      ormEntity.userId,
      ormEntity.whatWentWell,
      ormEntity.whatWentWrong,
      ormEntity.improvements,
      ormEntity.isPublic,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(
    domainEntity: Retrospective,
  ): Partial<RetrospectiveOrmEntity> {
    return {
      id: domainEntity.id,
      sprintId: domainEntity.sprintId,
      userId: domainEntity.userId,
      whatWentWell: domainEntity.whatWentWell,
      whatWentWrong: domainEntity.whatWentWrong,
      improvements: domainEntity.improvements,
      isPublic: domainEntity.isPublic,
    };
  }

  static toDomainList(ormEntities: RetrospectiveOrmEntity[]): Retrospective[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
