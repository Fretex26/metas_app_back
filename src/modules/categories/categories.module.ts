import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './presentation/categories.controller';
import { CategoryOrmEntity } from './infrastructure/persistence/category.orm-entity';
import { UserCategoryOrmEntity } from './infrastructure/persistence/user-category.orm-entity';
import { SponsoredGoalCategoryOrmEntity } from './infrastructure/persistence/sponsored-goal-category.orm-entity';
import { CategoryRepositoryImpl } from './infrastructure/persistence/category.repository.impl';
import type { ICategoryRepository } from './domain/repositories/category.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetAllCategoriesUseCase } from './application/use-cases/get-all-categories.use-case';

/**
 * Módulo de categorías
 * 
 * Proporciona funcionalidades para gestión de categorías preestablecidas
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryOrmEntity,
      UserCategoryOrmEntity,
      SponsoredGoalCategoryOrmEntity,
    ]),
  ],
  controllers: [CategoriesController],
  providers: [
    // Repositorios
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepositoryImpl,
    },
    // Use cases
    CreateCategoryUseCase,
    GetAllCategoriesUseCase,
  ],
  exports: ['ICategoryRepository'],
})
export class CategoriesModule {}
