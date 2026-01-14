import { SponsorEnrollment } from '../../domain/entities/sponsor-enrollment.entity';
import { SponsorEnrollmentOrmEntity } from '../persistence/sponsor-enrollment.orm-entity';
import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de SponsorEnrollment
 */
export class SponsorEnrollmentMapper {
  static toDomain(ormEntity: SponsorEnrollmentOrmEntity): SponsorEnrollment {
    return new SponsorEnrollment(
      ormEntity.id,
      ormEntity.sponsoredGoalId,
      ormEntity.userId,
      ormEntity.status as EnrollmentStatus,
      ormEntity.enrolledAt,
    );
  }

  static toOrmEntity(
    domainEntity: SponsorEnrollment,
  ): Partial<SponsorEnrollmentOrmEntity> {
    return {
      id: domainEntity.id,
      sponsoredGoalId: domainEntity.sponsoredGoalId,
      userId: domainEntity.userId,
      status: domainEntity.status as EnrollmentStatus,
    };
  }

  static toDomainList(
    ormEntities: SponsorEnrollmentOrmEntity[],
  ): SponsorEnrollment[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
