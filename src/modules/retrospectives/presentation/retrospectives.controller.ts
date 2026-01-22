import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
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
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateRetrospectiveDto } from '../application/dto/create-retrospective.dto';
import { RetrospectiveResponseDto } from '../application/dto/retrospective-response.dto';
import { CreateRetrospectiveUseCase } from '../application/use-cases/create-retrospective.use-case';
import { GetSprintRetrospectiveUseCase } from '../application/use-cases/get-sprint-retrospective.use-case';
import { GetPublicRetrospectivesUseCase } from '../application/use-cases/get-public-retrospectives.use-case';

/**
 * Controlador REST para gestión de retrospectives
 * 
 * Permite crear y obtener retrospectivas de sprints
 * 
 * @apiTag retrospectives
 */
@ApiTags('retrospectives')
@Controller('sprints/:sprintId/retrospective')
@UseGuards(FirebaseAuthGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class RetrospectivesController {
  constructor(
    private readonly createRetrospectiveUseCase: CreateRetrospectiveUseCase,
    private readonly getSprintRetrospectiveUseCase: GetSprintRetrospectiveUseCase,
    private readonly getPublicRetrospectivesUseCase: GetPublicRetrospectivesUseCase,
  ) {}

  /**
   * Crea un nuevo retrospective para un sprint
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear retrospectiva de sprint',
    description:
      'Crea una nueva retrospectiva para un sprint. Solo puede haber una retrospectiva por sprint.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Retrospectiva creada exitosamente',
    type: RetrospectiveResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una retrospectiva para este sprint',
  })
  async createRetrospective(
    @Param('sprintId') sprintId: string,
    @Body() createRetrospectiveDto: CreateRetrospectiveDto,
    @CurrentUser() user: UserPayload,
  ): Promise<RetrospectiveResponseDto> {
    const retrospective = await this.createRetrospectiveUseCase.execute(
      createRetrospectiveDto,
      sprintId,
      user.userId || user.uid,
    );
    return this.toResponseDto(retrospective);
  }

  /**
   * Obtiene la retrospectiva de un sprint
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener retrospectiva de sprint',
    description:
      'Obtiene la retrospectiva asociada a un sprint. Si es pública, cualquiera puede verla. Si es privada, solo el dueño puede verla.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID del sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrospectiva encontrada',
    type: RetrospectiveResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado o no existe retrospectiva para este sprint',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a esta retrospectiva',
  })
  async getSprintRetrospective(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<RetrospectiveResponseDto> {
    const retrospective = await this.getSprintRetrospectiveUseCase.execute(
      sprintId,
      user.userId || user.uid,
    );
    return this.toResponseDto(retrospective);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(retrospective: any): RetrospectiveResponseDto {
    return {
      id: retrospective.id,
      sprintId: retrospective.sprintId,
      userId: retrospective.userId,
      whatWentWell: retrospective.whatWentWell,
      whatWentWrong: retrospective.whatWentWrong,
      improvements: retrospective.improvements,
      isPublic: retrospective.isPublic,
      createdAt: retrospective.createdAt,
    };
  }
}
