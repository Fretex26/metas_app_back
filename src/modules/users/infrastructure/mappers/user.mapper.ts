import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../persistence/user.orm-entity';
import { UserRole } from '../../../../shared/types/enums';
import { CategoryMapper } from '../../../categories/infrastructure/mappers/category.mapper';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de User
 */
export class UserMapper {
  /**
   * Convierte una entidad ORM a entidad de dominio
   */
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User(
      ormEntity.id,
      ormEntity.name,
      ormEntity.email,
      ormEntity.firebaseUid,
      ormEntity.role as 'user' | 'sponsor' | 'admin',
      ormEntity.userCategories
        ? ormEntity.userCategories.map((uc) => CategoryMapper.toDomain(uc.category))
        : [],
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  /**
   * Convierte una entidad de dominio a entidad ORM
   */
  static toOrmEntity(domainEntity: User): Partial<UserOrmEntity> {
    return {
      id: domainEntity.id,
      name: domainEntity.name,
      email: domainEntity.email,
      firebaseUid: domainEntity.firebaseUid,
      role: domainEntity.role as UserRole,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt,
    };
  }

  /**
   * Convierte múltiples entidades ORM a entidades de dominio
   */
  static toDomainList(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
