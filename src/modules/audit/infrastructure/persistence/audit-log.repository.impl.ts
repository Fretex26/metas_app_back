import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
import { AuditLogMapper } from '../mappers/audit-log.mapper';

@Injectable()
export class AuditLogRepositoryImpl implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditLogRepository: Repository<AuditLogOrmEntity>,
  ) {}

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const ormEntity = this.auditLogRepository.create(
      AuditLogMapper.toOrmEntity(auditLog),
    );
    const savedEntity = await this.auditLogRepository.save(ormEntity);
    return AuditLogMapper.toDomain(savedEntity);
  }

  async findByUserId(userId: string, limit = 100): Promise<AuditLog[]> {
    const ormEntities = await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return AuditLogMapper.toDomainList(ormEntities);
  }

  async findByEntity(
    entity: string,
    entityId: string,
    limit = 100,
  ): Promise<AuditLog[]> {
    const ormEntities = await this.auditLogRepository.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return AuditLogMapper.toDomainList(ormEntities);
  }
}
