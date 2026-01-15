import { Sponsor } from '../../domain/entities/sponsor.entity';
import { SponsorOrmEntity } from '../persistence/sponsor.orm-entity';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Sponsor
 */
export class SponsorMapper {
  static toDomain(ormEntity: SponsorOrmEntity): Sponsor {
    return new Sponsor(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.businessName,
      ormEntity.description,
      ormEntity.category,
      ormEntity.logoUrl,
      ormEntity.contactEmail,
      ormEntity.status as SponsorStatus,
      ormEntity.reviewedBy,
      ormEntity.reviewedAt,
      ormEntity.rejectionReason,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Sponsor): Partial<SponsorOrmEntity> {
    return {
      id: domainEntity.id,
      userId: domainEntity.userId,
      businessName: domainEntity.businessName,
      description: domainEntity.description,
      category: domainEntity.category,
      logoUrl: domainEntity.logoUrl ?? undefined,
      contactEmail: domainEntity.contactEmail,
      status: domainEntity.status as SponsorStatus,
      reviewedBy: domainEntity.reviewedBy,
      reviewedAt: domainEntity.reviewedAt,
      rejectionReason: domainEntity.rejectionReason,
    };
  }
}
