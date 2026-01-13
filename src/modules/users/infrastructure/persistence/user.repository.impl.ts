import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

/**
 * Implementación del repositorio de usuarios usando TypeORM
 */
@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const ormEntity = this.userRepository.create(
      UserMapper.toOrmEntity(user),
    );
    const savedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { id },
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { firebaseUid },
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async update(user: User): Promise<User> {
    const ormEntity = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!ormEntity) {
      throw new Error(`User with id ${user.id} not found`);
    }

    Object.assign(ormEntity, UserMapper.toOrmEntity(user));
    const updatedEntity = await this.userRepository.save(ormEntity);
    return UserMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  async existsByFirebaseUid(firebaseUid: string): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { firebaseUid },
    });
    return count > 0;
  }
}
