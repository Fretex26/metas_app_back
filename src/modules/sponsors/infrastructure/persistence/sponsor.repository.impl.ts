import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ISponsorRepository } from '../../domain/repositories/sponsor.repository';
import { Sponsor } from '../../domain/entities/sponsor.entity';
import { SponsorOrmEntity } from './sponsor.orm-entity';
import { SponsorMapper } from '../mappers/sponsor.mapper';

@Injectable()
export class SponsorRepositoryImpl implements ISponsorRepository {
  constructor(
    @InjectRepository(SponsorOrmEntity)
    private readonly sponsorRepository: Repository<SponsorOrmEntity>,
  ) {}

  async create(sponsor: Sponsor): Promise<Sponsor> {
    const ormEntity = this.sponsorRepository.create(
      SponsorMapper.toOrmEntity(sponsor),
    );
    const savedEntity = await this.sponsorRepository.save(ormEntity);
    return SponsorMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Sponsor | null> {
    const ormEntity = await this.sponsorRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return ormEntity ? SponsorMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<Sponsor | null> {
    const ormEntity = await this.sponsorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    return ormEntity ? SponsorMapper.toDomain(ormEntity) : null;
  }

  async update(sponsor: Sponsor): Promise<Sponsor> {
    const ormEntity = await this.sponsorRepository.findOne({
      where: { id: sponsor.id },
    });
    if (!ormEntity) {
      throw new Error(`Sponsor with id ${sponsor.id} not found`);
    }
    Object.assign(ormEntity, SponsorMapper.toOrmEntity(sponsor));
    const updatedEntity = await this.sponsorRepository.save(ormEntity);
    return SponsorMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.sponsorRepository.delete(id);
  }
}
