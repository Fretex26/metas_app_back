import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserCategoryOrmEntity } from '../../../categories/infrastructure/persistence/user-category.orm-entity';
import { CategoryOrmEntity } from '../../../categories/infrastructure/persistence/category.orm-entity';

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
    
    // Crear relaciones con categorías si existen
    if (user.categories && user.categories.length > 0) {
      ormEntity.userCategories = user.categories.map((cat) => {
        const userCategory = new UserCategoryOrmEntity();
        const catOrm = new CategoryOrmEntity();
        catOrm.id = cat.id;
        userCategory.category = catOrm;
        return userCategory;
      });
    }
    
    const savedEntity = await this.userRepository.save(ormEntity);
    // Recargar con relaciones
    const reloaded = await this.userRepository.findOne({
      where: { id: savedEntity.id },
      relations: ['userCategories', 'userCategories.category'],
    });
    return reloaded ? UserMapper.toDomain(reloaded) : UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['userCategories', 'userCategories.category'],
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { firebaseUid },
      relations: ['userCategories', 'userCategories.category'],
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['userCategories', 'userCategories.category'],
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async update(user: User): Promise<User> {
    const ormEntity = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['userCategories'],
    });

    if (!ormEntity) {
      throw new Error(`User with id ${user.id} not found`);
    }

    Object.assign(ormEntity, UserMapper.toOrmEntity(user));
    
    // Actualizar categorías si existen
    if (user.categories) {
      // Eliminar relaciones existentes
      if (ormEntity.userCategories && ormEntity.userCategories.length > 0) {
        await this.userRepository.manager.delete(UserCategoryOrmEntity, {
          userId: user.id,
        });
      }
      
      // Crear nuevas relaciones
      ormEntity.userCategories = user.categories.map((cat) => {
        const userCategory = new UserCategoryOrmEntity();
        userCategory.userId = user.id;
        const catOrm = new CategoryOrmEntity();
        catOrm.id = cat.id;
        userCategory.category = catOrm;
        return userCategory;
      });
    }
    
    const updatedEntity = await this.userRepository.save(ormEntity);
    // Recargar con relaciones
    const reloaded = await this.userRepository.findOne({
      where: { id: updatedEntity.id },
      relations: ['userCategories', 'userCategories.category'],
    });
    return reloaded ? UserMapper.toDomain(reloaded) : UserMapper.toDomain(updatedEntity);
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
