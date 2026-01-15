import { Category } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from '../persistence/category.orm-entity';

/**
 * Mapper para convertir entre entidades de dominio y entidades ORM de Category
 */
export class CategoryMapper {
  static toDomain(ormEntity: CategoryOrmEntity): Category {
    return new Category(
      ormEntity.id,
      ormEntity.name,
      ormEntity.description,
      ormEntity.createdAt,
    );
  }

  static toOrmEntity(domainEntity: Category): Partial<CategoryOrmEntity> {
    return {
      id: domainEntity.id,
      name: domainEntity.name,
      description: domainEntity.description,
      createdAt: domainEntity.createdAt,
    };
  }

  static toDomainList(ormEntities: CategoryOrmEntity[]): Category[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }
}
