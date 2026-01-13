import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorOrmEntity } from '../../../sponsors/infrastructure/persistence/sponsor.orm-entity';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Implementación del repositorio de administración usando TypeORM
 */
@Injectable()
export class AdminRepositoryImpl implements IAdminRepository {
  constructor(
    @InjectRepository(SponsorOrmEntity)
    private readonly sponsorRepository: Repository<SponsorOrmEntity>,
  ) {}

  async findSponsorsByStatus(
    status: SponsorStatus,
  ): Promise<SponsorOrmEntity[]> {
    return await this.sponsorRepository.find({
      where: { status },
      relations: ['user', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllSponsors(): Promise<SponsorOrmEntity[]> {
    return await this.sponsorRepository.find({
      relations: ['user', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSponsorById(id: string): Promise<SponsorOrmEntity | null> {
    return await this.sponsorRepository.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
  }

  async updateSponsorStatus(
    id: string,
    status: SponsorStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<SponsorOrmEntity> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });

    if (!sponsor) {
      throw new Error(`Sponsor with id ${id} not found`);
    }

    sponsor.status = status;
    sponsor.reviewedBy = reviewedBy;
    sponsor.reviewedAt = new Date();
    if (rejectionReason) {
      sponsor.rejectionReason = rejectionReason;
    } else {
      sponsor.rejectionReason = null;
    }

    return await this.sponsorRepository.save(sponsor);
  }
}
