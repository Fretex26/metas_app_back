import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from './category.orm-entity';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepository: Repository<CategoryOrmEntity>,
  ) {}

  async create(category: Category): Promise<Category> {
    const ormEntity = this.categoryRepository.create(
      CategoryMapper.toOrmEntity(category),
    );
    const savedEntity = await this.categoryRepository.save(ormEntity);
    return CategoryMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Category | null> {
    const ormEntity = await this.categoryRepository.findOne({
      where: { id },
    });
    return ormEntity ? CategoryMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const ormEntity = await this.categoryRepository.findOne({
      where: { name },
    });
    return ormEntity ? CategoryMapper.toDomain(ormEntity) : null;
  }

  async findByNameNormalized(normalizedName: string): Promise<Category | null> {
    // Buscar todas las categorías y comparar con nombre normalizado
    // Usamos query builder para hacer la comparación en la base de datos
    const normalizedLower = normalizedName.toLowerCase();
    const allCategories = await this.categoryRepository
      .createQueryBuilder('category')
      .getMany();
    
    // Comparar cada categoría con el nombre normalizado
    const normalizedCategory = allCategories.find((cat) => {
      const catNormalized = this.normalizeCategoryName(cat.name);
      return catNormalized.toLowerCase() === normalizedLower;
    });
    
    return normalizedCategory ? CategoryMapper.toDomain(normalizedCategory) : null;
  }

  /**
   * Normaliza el nombre de una categoría: primera letra mayúscula, resto minúsculas, sin espacios
   */
  private normalizeCategoryName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, '') // Eliminar todos los espacios
      .toLowerCase()
      .replace(/^./, (char) => char.toUpperCase()); // Primera letra mayúscula
  }

  async findAll(): Promise<Category[]> {
    const ormEntities = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
    return CategoryMapper.toDomainList(ormEntities);
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) {
      return [];
    }
    const ormEntities = await this.categoryRepository.find({
      where: { id: In(ids) },
    });
    return CategoryMapper.toDomainList(ormEntities);
  }

  async update(category: Category): Promise<Category> {
    const ormEntity = await this.categoryRepository.findOne({
      where: { id: category.id },
    });
    if (!ormEntity) {
      throw new Error(`Category with id ${category.id} not found`);
    }
    Object.assign(ormEntity, CategoryMapper.toOrmEntity(category));
    const updatedEntity = await this.categoryRepository.save(ormEntity);
    return CategoryMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
