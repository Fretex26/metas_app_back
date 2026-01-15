import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ISponsorEnrollmentRepository } from '../../domain/repositories/sponsor-enrollment.repository';
import { SponsorEnrollment } from '../../domain/entities/sponsor-enrollment.entity';
import { SponsorEnrollmentOrmEntity } from './sponsor-enrollment.orm-entity';
import { SponsorEnrollmentMapper } from '../mappers/sponsor-enrollment.mapper';

@Injectable()
export class SponsorEnrollmentRepositoryImpl
  implements ISponsorEnrollmentRepository
{
  constructor(
    @InjectRepository(SponsorEnrollmentOrmEntity)
    private readonly enrollmentRepository: Repository<SponsorEnrollmentOrmEntity>,
  ) {}

  async create(enrollment: SponsorEnrollment): Promise<SponsorEnrollment> {
    const ormEntity = this.enrollmentRepository.create(
      SponsorEnrollmentMapper.toOrmEntity(enrollment),
    );
    const savedEntity = await this.enrollmentRepository.save(ormEntity);
    return SponsorEnrollmentMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<SponsorEnrollment | null> {
    const ormEntity = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['sponsoredGoal', 'user'],
    });
    return ormEntity ? SponsorEnrollmentMapper.toDomain(ormEntity) : null;
  }

  async findBySponsoredGoalIdAndUserId(
    sponsoredGoalId: string,
    userId: string,
  ): Promise<SponsorEnrollment | null> {
    const ormEntity = await this.enrollmentRepository.findOne({
      where: { sponsoredGoalId, userId },
      relations: ['sponsoredGoal', 'user'],
    });
    return ormEntity ? SponsorEnrollmentMapper.toDomain(ormEntity) : null;
  }

  async findByUserEmailAndSponsor(
    userEmail: string,
    sponsorId: string,
  ): Promise<SponsorEnrollment[]> {
    const ormEntities = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.user', 'user')
      .innerJoinAndSelect('enrollment.sponsoredGoal', 'sponsoredGoal')
      .where('LOWER(user.email) = LOWER(:email)', {
        email: userEmail,
      })
      .andWhere('sponsoredGoal.sponsorId = :sponsorId', {
        sponsorId,
      })
      .orderBy('enrollment.enrolledAt', 'DESC')
      .getMany();
    return SponsorEnrollmentMapper.toDomainList(ormEntities);
  }

  async findBySponsoredGoalId(
    sponsoredGoalId: string,
  ): Promise<SponsorEnrollment[]> {
    const ormEntities = await this.enrollmentRepository.find({
      where: { sponsoredGoalId },
      relations: ['sponsoredGoal', 'user'],
      order: { enrolledAt: 'DESC' },
    });
    return SponsorEnrollmentMapper.toDomainList(ormEntities);
  }

  async update(enrollment: SponsorEnrollment): Promise<SponsorEnrollment> {
    const ormEntity = await this.enrollmentRepository.findOne({
      where: { id: enrollment.id },
    });
    if (!ormEntity) {
      throw new Error(
        `SponsorEnrollment with id ${enrollment.id} not found`,
      );
    }
    Object.assign(ormEntity, SponsorEnrollmentMapper.toOrmEntity(enrollment));
    const updatedEntity = await this.enrollmentRepository.save(ormEntity);
    return SponsorEnrollmentMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.enrollmentRepository.delete(id);
  }
}
