import { Injectable, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

/**
 * Caso de uso para obtener todas las categorías
 */
@Injectable()
export class GetAllCategoriesUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }
}
