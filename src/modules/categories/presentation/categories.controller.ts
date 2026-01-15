import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { CreateCategoryDto } from '../application/dto/create-category.dto';
import { CategoryResponseDto } from '../application/dto/category-response.dto';
import { CreateCategoryUseCase } from '../application/use-cases/create-category.use-case';
import { GetAllCategoriesUseCase } from '../application/use-cases/get-all-categories.use-case';

/**
 * Controlador REST para gestión de categorías
 */
@ApiTags('categories')
@Controller('categories')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
  ) {}

  /**
   * Crea una nueva categoría
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear categoría',
    description: 'Crea una nueva categoría preestablecida en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre',
  })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.createCategoryUseCase.execute(
      createCategoryDto,
    );
    return this.toResponseDto(category);
  }

  /**
   * Obtiene todas las categorías
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todas las categorías',
    description: 'Obtiene la lista de todas las categorías preestablecidas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    type: [CategoryResponseDto],
  })
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.getAllCategoriesUseCase.execute();
    return categories.map((category) => this.toResponseDto(category));
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(category: any): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
    };
  }
}
