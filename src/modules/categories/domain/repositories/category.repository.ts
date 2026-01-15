import { Category } from '../entities/category.entity';

/**
 * Interfaz del repositorio de categorías
 */
export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findByNameNormalized(normalizedName: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByIds(ids: string[]): Promise<Category[]>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
