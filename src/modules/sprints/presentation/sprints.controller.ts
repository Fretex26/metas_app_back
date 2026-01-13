import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CreateSprintDto } from '../application/dto/create-sprint.dto';
import { UpdateSprintDto } from '../application/dto/update-sprint.dto';
import { SprintResponseDto } from '../application/dto/sprint-response.dto';
import { CreateSprintUseCase } from '../application/use-cases/create-sprint.use-case';
import { GetMilestoneSprintsUseCase } from '../application/use-cases/get-milestone-sprints.use-case';
import { GetSprintByIdUseCase } from '../application/use-cases/get-sprint-by-id.use-case';
import { UpdateSprintUseCase } from '../application/use-cases/update-sprint.use-case';
import { DeleteSprintUseCase } from '../application/use-cases/delete-sprint.use-case';

/**
 * Controlador REST para gestión de sprints
 * 
 * Permite crear, listar, obtener, actualizar y eliminar sprints de un milestone
 * 
 * @apiTag sprints
 */
@ApiTags('sprints')
@Controller('milestones/:milestoneId/sprints')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SprintsController {
  constructor(
    private readonly createSprintUseCase: CreateSprintUseCase,
    private readonly getMilestoneSprintsUseCase: GetMilestoneSprintsUseCase,
    private readonly getSprintByIdUseCase: GetSprintByIdUseCase,
    private readonly updateSprintUseCase: UpdateSprintUseCase,
    private readonly deleteSprintUseCase: DeleteSprintUseCase,
  ) {}

  /**
   * Obtiene todos los sprints de un milestone
   */
  @Get()
  @ApiOperation({
    summary: 'Listar sprints del milestone',
    description: 'Obtiene la lista de todos los sprints de un milestone específico',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sprints',
    type: [SprintResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  async getMilestoneSprints(
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SprintResponseDto[]> {
    const sprints = await this.getMilestoneSprintsUseCase.execute(
      milestoneId,
      user.userId || user.uid,
    );
    return sprints.map((sprint) => this.toResponseDto(sprint));
  }

  /**
   * Crea un nuevo sprint
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear sprint',
    description:
      'Crea un nuevo sprint para un milestone. El periodo máximo es de 4 semanas (28 días).',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Sprint creado exitosamente',
    type: SprintResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El periodo del sprint excede 4 semanas o las fechas son inválidas',
  })
  async createSprint(
    @Param('milestoneId') milestoneId: string,
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SprintResponseDto> {
    const sprint = await this.createSprintUseCase.execute(
      createSprintDto,
      milestoneId,
      user.userId || user.uid,
    );
    return this.toResponseDto(sprint);
  }

  /**
   * Obtiene un sprint específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener sprint por ID',
    description: 'Obtiene los detalles de un sprint específico',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sprint',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del sprint',
    type: SprintResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este sprint',
  })
  async getSprint(
    @Param('id') sprintId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SprintResponseDto> {
    const sprint = await this.getSprintByIdUseCase.execute(
      sprintId,
      user.userId || user.uid,
    );
    return this.toResponseDto(sprint);
  }

  /**
   * Actualiza un sprint existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar sprint',
    description: 'Actualiza los datos de un sprint existente',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sprint',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint actualizado exitosamente',
    type: SprintResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este sprint',
  })
  async updateSprint(
    @Param('id') sprintId: string,
    @Body() updateSprintDto: UpdateSprintDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SprintResponseDto> {
    const sprint = await this.updateSprintUseCase.execute(
      sprintId,
      user.userId || user.uid,
      updateSprintDto,
    );
    return this.toResponseDto(sprint);
  }

  /**
   * Elimina un sprint
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar sprint',
    description: 'Elimina un sprint existente',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID del milestone',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sprint',
  })
  @ApiResponse({
    status: 204,
    description: 'Sprint eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este sprint',
  })
  async deleteSprint(
    @Param('id') sprintId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteSprintUseCase.execute(
      sprintId,
      user.userId || user.uid,
    );
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(sprint: any): SprintResponseDto {
    return {
      id: sprint.id,
      milestoneId: sprint.milestoneId,
      name: sprint.name,
      description: sprint.description,
      acceptanceCriteria: sprint.acceptanceCriteria,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      resourcesAvailable: sprint.resourcesAvailable,
      resourcesNeeded: sprint.resourcesNeeded,
      createdAt: sprint.createdAt,
    };
  }
}
