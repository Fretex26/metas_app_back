import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateMilestoneDto } from '../application/dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../application/dto/update-milestone.dto';
import { MilestoneResponseDto } from '../application/dto/milestone-response.dto';
import { CreateMilestoneUseCase } from '../application/use-cases/create-milestone.use-case';
import { GetProjectMilestonesUseCase } from '../application/use-cases/get-project-milestones.use-case';
import { GetMilestoneByIdUseCase } from '../application/use-cases/get-milestone-by-id.use-case';
import { UpdateMilestoneUseCase } from '../application/use-cases/update-milestone.use-case';
import { DeleteMilestoneUseCase } from '../application/use-cases/delete-milestone.use-case';

/**
 * Controlador REST para gestión de milestones
 *
 * Permite crear, listar, obtener, actualizar y eliminar milestones de un proyecto
 *
 * @apiTag milestones
 */
@ApiTags('milestones')
@Controller('projects/:projectId/milestones')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class MilestonesController {
  constructor(
    private readonly createMilestoneUseCase: CreateMilestoneUseCase,
    private readonly getProjectMilestonesUseCase: GetProjectMilestonesUseCase,
    private readonly getMilestoneByIdUseCase: GetMilestoneByIdUseCase,
    private readonly updateMilestoneUseCase: UpdateMilestoneUseCase,
    private readonly deleteMilestoneUseCase: DeleteMilestoneUseCase,
  ) {}

  /**
   * Obtiene todos los milestones de un proyecto
   */
  @Get()
  @ApiOperation({
    summary: 'Listar milestones del proyecto',
    description:
      'Obtiene la lista de todos los milestones de un proyecto específico',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de milestones',
    type: [MilestoneResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  async getProjectMilestones(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto[]> {
    const milestones = await this.getProjectMilestonesUseCase.execute(
      projectId,
      user.userId || user.uid,
    );
    return milestones.map((milestone) => this.toResponseDto(milestone));
  }

  /**
   * Crea un nuevo milestone
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear milestone',
    description: 'Crea un nuevo milestone para un proyecto',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Milestone creado exitosamente',
    type: MilestoneResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  async createMilestone(
    @Param('projectId') projectId: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto> {
    const milestone = await this.createMilestoneUseCase.execute(
      createMilestoneDto,
      projectId,
      user.userId || user.uid,
    );
    return this.toResponseDto(milestone);
  }

  /**
   * Obtiene un milestone específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener milestone por ID',
    description: 'Obtiene los detalles de un milestone específico',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del milestone',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del milestone',
    type: MilestoneResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este milestone',
  })
  async getMilestone(
    @Param('id') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto> {
    const milestone = await this.getMilestoneByIdUseCase.execute(
      milestoneId,
      user.userId || user.uid,
    );
    return this.toResponseDto(milestone);
  }

  /**
   * Actualiza un milestone existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar milestone',
    description: 'Actualiza los datos de un milestone existente',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del milestone',
  })
  @ApiResponse({
    status: 200,
    description: 'Milestone actualizado exitosamente',
    type: MilestoneResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este milestone',
  })
  async updateMilestone(
    @Param('id') milestoneId: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto> {
    const milestone = await this.updateMilestoneUseCase.execute(
      milestoneId,
      user.userId || user.uid,
      updateMilestoneDto,
    );
    return this.toResponseDto(milestone);
  }

  /**
   * Elimina un milestone
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar milestone',
    description: 'Elimina un milestone existente',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del milestone',
  })
  @ApiResponse({
    status: 204,
    description: 'Milestone eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este milestone',
  })
  async deleteMilestone(
    @Param('id') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteMilestoneUseCase.execute(
      milestoneId,
      user.userId || user.uid,
    );
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(milestone: any): MilestoneResponseDto {
    return {
      id: milestone.id,
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description,
      status: milestone.status,
      rewardId: milestone.rewardId ?? null,
      createdAt: milestone.createdAt,
    };
  }
}
