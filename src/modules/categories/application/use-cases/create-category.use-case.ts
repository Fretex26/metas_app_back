import { Injectable, ConflictException, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Función helper para normalizar el nombre de una categoría
 * - Primera letra mayúscula
 * - Resto minúsculas
 * - Sin espacios
 */
function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '') // Eliminar todos los espacios
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase()); // Primera letra mayúscula
}

/**
 * Caso de uso para crear una nueva categoría
 */
@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Normalizar el nombre de la categoría
    const normalizedName = normalizeCategoryName(createCategoryDto.name);

    // Verificar que no existe una categoría con el mismo nombre normalizado
    const existingCategory = await this.categoryRepository.findByNameNormalized(
      normalizedName,
    );
    if (existingCategory) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${existingCategory.name}". Los nombres de categorías no distinguen entre mayúsculas y minúsculas ni espacios.`,
      );
    }

    // Crear la entidad de dominio con el nombre normalizado
    const category = new Category(
      uuidv4(),
      normalizedName,
      createCategoryDto.description || null,
      new Date(),
    );

    // Guardar en el repositorio
    return await this.categoryRepository.create(category);
  }
}
