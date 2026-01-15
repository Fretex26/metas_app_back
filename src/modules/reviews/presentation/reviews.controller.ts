import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateReviewDto } from '../application/dto/create-review.dto';
import { ReviewResponseDto } from '../application/dto/review-response.dto';
import { CreateReviewUseCase } from '../application/use-cases/create-review.use-case';
import { GetSprintReviewUseCase } from '../application/use-cases/get-sprint-review.use-case';

/**
 * Controlador REST para gestión de reviews
 * 
 * Permite crear y obtener reviews de sprints
 * 
 * @apiTag reviews
 */
@ApiTags('reviews')
@Controller('sprints/:sprintId/review')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getSprintReviewUseCase: GetSprintReviewUseCase,
  ) {}

  /**
   * Crea un nuevo review para un sprint
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear revisión de sprint',
    description:
      'Crea una nueva revisión para un sprint. Solo puede haber una revisión por sprint.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Revisión creada exitosamente',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una revisión para este sprint',
  })
  async createReview(
    @Param('sprintId') sprintId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ReviewResponseDto> {
    const review = await this.createReviewUseCase.execute(
      createReviewDto,
      sprintId,
      user.userId || user.uid,
    );
    return this.toResponseDto(review);
  }

  /**
   * Obtiene el review de un sprint
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener revisión de sprint',
    description: 'Obtiene la revisión asociada a un sprint específico',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Revisión encontrada',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado o no existe revisión para este sprint',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este sprint',
  })
  async getSprintReview(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<ReviewResponseDto> {
    const review = await this.getSprintReviewUseCase.execute(
      sprintId,
      user.userId || user.uid,
    );
    return this.toResponseDto(review);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      sprintId: review.sprintId,
      userId: review.userId,
      progressPercentage: review.progressPercentage,
      extraPoints: review.extraPoints,
      summary: review.summary,
      createdAt: review.createdAt,
    };
  }
}
