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
import { CreateProjectDto } from '../application/dto/create-project.dto';
import { UpdateProjectDto } from '../application/dto/update-project.dto';
import { ProjectResponseDto } from '../application/dto/project-response.dto';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { GetUserProjectsUseCase } from '../application/use-cases/get-user-projects.use-case';
import { GetProjectByIdUseCase } from '../application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '../application/use-cases/delete-project.use-case';

/**
 * Controlador REST para gestión de proyectos personales
 * 
 * Permite a los usuarios crear, listar, obtener, actualizar y eliminar sus proyectos
 * 
 * @apiTag projects
 */
@ApiTags('projects')
@Controller('projects')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  /**
   * Obtiene todos los proyectos del usuario autenticado
   */
  @Get()
  @ApiOperation({
    summary: 'Listar proyectos del usuario',
    description: 'Obtiene la lista de todos los proyectos del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos',
    type: [ProjectResponseDto],
  })
  async getUserProjects(
    @CurrentUser() user: UserPayload,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.getUserProjectsUseCase.execute(
      user.userId || user.uid,
    );
    return projects.map((project) => this.toResponseDto(project));
  }

  /**
   * Crea un nuevo proyecto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear proyecto',
    description:
      'Crea un nuevo proyecto personal. El usuario puede tener un máximo de 6 proyectos activos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Proyecto creado exitosamente',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario ya tiene el límite máximo de 6 proyectos',
  })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ProjectResponseDto> {
    const project = await this.createProjectUseCase.execute(
      createProjectDto,
      user.userId || user.uid,
    );
    return this.toResponseDto(project);
  }

  /**
   * Obtiene un proyecto específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener proyecto por ID',
    description: 'Obtiene los detalles de un proyecto específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del proyecto',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este proyecto',
  })
  async getProject(
    @Param('id') projectId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<ProjectResponseDto> {
    const project = await this.getProjectByIdUseCase.execute(
      projectId,
      user.userId || user.uid,
    );
    return this.toResponseDto(project);
  }

  /**
   * Actualiza un proyecto existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar proyecto',
    description: 'Actualiza los datos de un proyecto existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Proyecto actualizado exitosamente',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este proyecto',
  })
  async updateProject(
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectUseCase.execute(
      projectId,
      user.userId || user.uid,
      updateProjectDto,
    );
    return this.toResponseDto(project);
  }

  /**
   * Elimina un proyecto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar proyecto',
    description: 'Elimina un proyecto existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Proyecto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este proyecto',
  })
  async deleteProject(
    @Param('id') projectId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteProjectUseCase.execute(projectId, user.userId || user.uid);
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(project: any): ProjectResponseDto {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      purpose: project.purpose,
      budget: project.budget,
      finalDate: project.finalDate,
      resourcesAvailable: project.resourcesAvailable,
      resourcesNeeded: project.resourcesNeeded,
      schedule: project.schedule,
      sponsoredGoalId: project.sponsoredGoalId ?? null,
      enrollmentId: project.enrollmentId ?? null,
      isActive: project.isActive ?? true,
      createdAt: project.createdAt,
    };
  }
}
