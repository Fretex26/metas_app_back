import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { CreateSponsoredGoalDto } from '../application/dto/create-sponsored-goal.dto';
import { UpdateSponsoredGoalDto } from '../application/dto/update-sponsored-goal.dto';
import { SponsoredGoalResponseDto } from '../application/dto/sponsored-goal-response.dto';
import { UpdateEnrollmentStatusDto } from '../application/dto/update-enrollment-status.dto';
import { EnrollmentResponseDto } from '../application/dto/enrollment-response.dto';
import { CategoryResponseDto } from '../../categories/application/dto/category-response.dto';
import { CreateSponsoredGoalUseCase } from '../application/use-cases/create-sponsored-goal.use-case';
import { ListSponsorSponsoredGoalsUseCase } from '../application/use-cases/list-sponsor-sponsored-goals.use-case';
import { GetSponsoredGoalByIdUseCase } from '../application/use-cases/get-sponsored-goal-by-id.use-case';
import { UpdateSponsoredGoalUseCase } from '../application/use-cases/update-sponsored-goal.use-case';
import { DeleteSponsoredGoalUseCase } from '../application/use-cases/delete-sponsored-goal.use-case';
import { ListAvailableSponsoredGoalsUseCase } from '../application/use-cases/list-available-sponsored-goals.use-case';
import { FilterSponsoredGoalsByCategoriesUseCase } from '../application/use-cases/filter-sponsored-goals-by-categories.use-case';
import { EnrollInSponsoredGoalUseCase } from '../application/use-cases/enroll-in-sponsored-goal.use-case';
import { UpdateEnrollmentStatusUseCase } from '../application/use-cases/update-enrollment-status.use-case';
import { VerifyMilestoneCompletionUseCase } from '../application/use-cases/verify-milestone-completion.use-case';
import { GetUserSponsoredProjectsUseCase } from '../application/use-cases/get-user-sponsored-projects.use-case';
import { GetSponsoredProjectMilestonesUseCase } from '../application/use-cases/get-sponsored-project-milestones.use-case';
import { ProjectResponseDto } from '../../projects/application/dto/project-response.dto';
import { MilestoneResponseDto } from '../../milestones/application/dto/milestone-response.dto';

/**
 * Controlador REST para gestión de sponsored goals
 *
 * Permite crear objetivos patrocinados y listar objetivos disponibles
 *
 * @apiTag sponsored-goals
 */
@ApiTags('sponsored-goals')
@Controller('sponsored-goals')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class SponsoredGoalsController {
  constructor(
    private readonly createSponsoredGoalUseCase: CreateSponsoredGoalUseCase,
    private readonly listSponsorSponsoredGoalsUseCase: ListSponsorSponsoredGoalsUseCase,
    private readonly getSponsoredGoalByIdUseCase: GetSponsoredGoalByIdUseCase,
    private readonly updateSponsoredGoalUseCase: UpdateSponsoredGoalUseCase,
    private readonly deleteSponsoredGoalUseCase: DeleteSponsoredGoalUseCase,
    private readonly listAvailableSponsoredGoalsUseCase: ListAvailableSponsoredGoalsUseCase,
    private readonly filterSponsoredGoalsByCategoriesUseCase: FilterSponsoredGoalsByCategoriesUseCase,
    private readonly enrollInSponsoredGoalUseCase: EnrollInSponsoredGoalUseCase,
    private readonly updateEnrollmentStatusUseCase: UpdateEnrollmentStatusUseCase,
    private readonly verifyMilestoneCompletionUseCase: VerifyMilestoneCompletionUseCase,
    private readonly getUserSponsoredProjectsUseCase: GetUserSponsoredProjectsUseCase,
    private readonly getSponsoredProjectMilestonesUseCase: GetSponsoredProjectMilestonesUseCase,
  ) {}

  /**
   * Crea un nuevo objetivo patrocinado (solo sponsors aprobados)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear objetivo patrocinado',
    description:
      'Crea un nuevo objetivo patrocinado. Solo los patrocinadores aprobados pueden crear objetivos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Objetivo patrocinado creado exitosamente',
    type: SponsoredGoalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró perfil de patrocinador para este usuario',
  })
  @ApiResponse({
    status: 403,
    description:
      'Solo los patrocinadores aprobados pueden crear objetivos patrocinados',
  })
  async createSponsoredGoal(
    @Body() createSponsoredGoalDto: CreateSponsoredGoalDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsoredGoalResponseDto> {
    const sponsoredGoal = await this.createSponsoredGoalUseCase.execute(
      createSponsoredGoalDto,
      user.userId || user.uid,
    );
    return this.toResponseDto(sponsoredGoal);
  }

  /**
   * Lista los objetivos patrocinados del sponsor autenticado (solo sponsors).
   */
  @Get()
  @ApiOperation({
    summary: 'Listar mis objetivos patrocinados',
    description:
      'Obtiene la lista de objetivos patrocinados creados por el sponsor autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de objetivos patrocinados del sponsor',
    type: [SponsoredGoalResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró perfil de patrocinador',
  })
  async listSponsorSponsoredGoals(
    @CurrentUser() user: UserPayload,
  ): Promise<SponsoredGoalResponseDto[]> {
    const goals = await this.listSponsorSponsoredGoalsUseCase.execute(
      user.userId || user.uid,
    );
    return goals.map((g) => this.toResponseDto(g));
  }

  /**
   * Lista objetivos patrocinados disponibles para usuarios
   */
  @Get('available')
  @ApiOperation({
    summary: 'Listar objetivos patrocinados disponibles',
    description:
      'Obtiene la lista de objetivos patrocinados activos y disponibles para inscribirse. Puede filtrar por categorías usando el query parameter categoryIds.',
  })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    description: 'IDs de categorías para filtrar (separados por coma)',
    type: String,
    example:
      '123e4567-e89b-12d3-a456-426614174000,223e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de objetivos patrocinados disponibles',
    type: [SponsoredGoalResponseDto],
  })
  async listAvailableSponsoredGoals(
    @Query('categoryIds') categoryIds?: string,
  ): Promise<SponsoredGoalResponseDto[]> {
    let goals;
    if (categoryIds) {
      const categoryIdsArray = categoryIds.split(',').map((id) => id.trim());
      goals =
        await this.filterSponsoredGoalsByCategoriesUseCase.execute(
          categoryIdsArray,
        );
    } else {
      goals = await this.listAvailableSponsoredGoalsUseCase.execute();
    }
    return goals.map((goal) => this.toResponseDto(goal));
  }

  /**
   * Obtiene un objetivo patrocinado por ID (solo el sponsor dueño).
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener objetivo patrocinado por ID',
    description:
      'Obtiene el detalle de un objetivo patrocinado. Solo el sponsor creador puede acceder.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del objetivo patrocinado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Objetivo patrocinado',
    type: SponsoredGoalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Objetivo patrocinado no encontrado',
  })
  @ApiResponse({ status: 403, description: 'No tienes permiso para acceder' })
  async getSponsoredGoalById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsoredGoalResponseDto> {
    const goal = await this.getSponsoredGoalByIdUseCase.execute(
      id,
      user.userId || user.uid,
    );
    return this.toResponseDto(goal);
  }

  /**
   * Actualiza un objetivo patrocinado (solo el sponsor dueño).
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar objetivo patrocinado',
    description:
      'Actualiza un objetivo patrocinado. Solo el sponsor creador puede modificarlo. Solo se envían los campos a cambiar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del objetivo patrocinado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Objetivo patrocinado actualizado',
    type: SponsoredGoalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Objetivo patrocinado no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para actualizarlo',
  })
  @ApiResponse({
    status: 400,
    description: 'Validación fallida (fechas, categorías, etc.)',
  })
  async updateSponsoredGoal(
    @Param('id') id: string,
    @Body() updateDto: UpdateSponsoredGoalDto,
    @CurrentUser() user: UserPayload,
  ): Promise<SponsoredGoalResponseDto> {
    const goal = await this.updateSponsoredGoalUseCase.execute(
      id,
      user.userId || user.uid,
      updateDto,
    );
    return this.toResponseDto(goal);
  }

  /**
   * Elimina un objetivo patrocinado (solo el sponsor dueño).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar objetivo patrocinado',
    description:
      'Elimina un objetivo patrocinado. Solo el sponsor creador puede eliminarlo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del objetivo patrocinado',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Eliminado correctamente' })
  @ApiResponse({
    status: 404,
    description: 'Objetivo patrocinado no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminarlo',
  })
  async deleteSponsoredGoal(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.deleteSponsoredGoalUseCase.execute(id, user.userId || user.uid);
  }

  /**
   * Inscribe un usuario a un objetivo patrocinado
   */
  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscribirse a un objetivo patrocinado',
    description:
      'Inscribe al usuario actual a un objetivo patrocinado y crea una copia del proyecto asociado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del objetivo patrocinado',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario inscrito exitosamente',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Objetivo patrocinado no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya está inscrito en este objetivo',
  })
  @ApiResponse({
    status: 400,
    description: 'Se ha alcanzado el número máximo de usuarios',
  })
  async enrollInSponsoredGoal(
    @Param('id') sponsoredGoalId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollInSponsoredGoalUseCase.execute(
      sponsoredGoalId,
      user.userId || user.uid,
    );
    return this.toEnrollmentResponseDto(enrollment);
  }

  /**
   * Actualiza el estado de un enrollment (solo para sponsors)
   */
  @Patch('enrollments/:enrollmentId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado de enrollment',
    description:
      'Permite a un sponsor cambiar el estado de un enrollment entre ACTIVE e INACTIVE',
  })
  @ApiParam({
    name: 'enrollmentId',
    description: 'ID del enrollment',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Enrollment no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo los patrocinadores pueden cambiar el estado',
  })
  async updateEnrollmentStatus(
    @Param('enrollmentId') enrollmentId: string,
    @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
    @CurrentUser() user: UserPayload,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.updateEnrollmentStatusUseCase.execute(
      enrollmentId,
      updateEnrollmentStatusDto.status,
      user.userId || user.uid,
    );
    return this.toEnrollmentResponseDto(enrollment);
  }

  /**
   * Verifica la completitud de una milestone (solo para sponsors)
   */
  @Post('milestones/:milestoneId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar completitud de milestone',
    description:
      'Permite a un sponsor marcar una milestone como completada después de verificar las tareas',
  })
  @ApiParam({
    name: 'milestoneId',
    description: 'ID de la milestone',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Milestone verificada exitosamente',
    type: MilestoneResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Milestone no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo los patrocinadores pueden verificar milestones',
  })
  @ApiResponse({
    status: 400,
    description:
      'Solo se pueden verificar milestones de proyectos patrocinados',
  })
  async verifyMilestoneCompletion(
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto> {
    const milestone = await this.verifyMilestoneCompletionUseCase.execute(
      milestoneId,
      user.userId || user.uid,
    );
    return {
      id: milestone.id,
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description,
      status: milestone.status as any,
      createdAt: milestone.createdAt,
    };
  }

  /**
   * Obtiene las milestones de un proyecto patrocinado (solo para sponsors)
   */
  @Get('projects/:projectId/milestones')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener milestones de un proyecto patrocinado',
    description:
      'Permite a un sponsor ver las milestones de un proyecto patrocinado de un usuario',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto patrocinado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de milestones del proyecto patrocinado',
    type: [MilestoneResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Proyecto no encontrado',
  })
  @ApiResponse({
    status: 403,
    description:
      'Solo los patrocinadores pueden ver milestones de proyectos patrocinados',
  })
  async getSponsoredProjectMilestones(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<MilestoneResponseDto[]> {
    const milestones = await this.getSponsoredProjectMilestonesUseCase.execute(
      projectId,
      user.userId || user.uid,
    );
    return milestones.map((milestone) => ({
      id: milestone.id,
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description,
      status: milestone.status as any,
      rewardId: milestone.rewardId ?? null,
      createdAt: milestone.createdAt,
    }));
  }

  /**
   * Obtiene los proyectos patrocinados de un usuario (solo para sponsors)
   */
  @Get('users/:email/projects')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener proyectos patrocinados de un usuario',
    description:
      'Permite a un sponsor buscar los proyectos que un usuario tiene inscritos de sus objetivos patrocinados',
  })
  @ApiParam({
    name: 'email',
    description: 'Email del usuario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos patrocinados del usuario',
    type: [ProjectResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo los patrocinadores pueden buscar proyectos de usuarios',
  })
  async getUserSponsoredProjects(
    @Param('email') userEmail: string,
    @CurrentUser() user: UserPayload,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.getUserSponsoredProjectsUseCase.execute(
      userEmail,
      user.userId || user.uid,
    );
    return projects.map((project) => ({
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      purpose: project.purpose,
      budget: project.budget ?? undefined,
      finalDate: project.finalDate ?? undefined,
      resourcesAvailable: project.resourcesAvailable ?? undefined,
      resourcesNeeded: project.resourcesNeeded ?? undefined,
      sponsoredGoalId: project.sponsoredGoalId ?? undefined,
      enrollmentId: project.enrollmentId ?? undefined,
      isActive: project.isActive,
      status: project.status,
      rewardId: project.rewardId,
      createdAt: project.createdAt,
    }));
  }

  /**
   * Convierte una entidad de dominio a DTO de respuesta
   */
  private toResponseDto(sponsoredGoal: any): SponsoredGoalResponseDto {
    return {
      id: sponsoredGoal.id,
      sponsorId: sponsoredGoal.sponsorId,
      projectId: sponsoredGoal.projectId,
      name: sponsoredGoal.name,
      description: sponsoredGoal.description,
      categories: sponsoredGoal.categories
        ? sponsoredGoal.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.createdAt,
          }))
        : [],
      startDate: sponsoredGoal.startDate,
      endDate: sponsoredGoal.endDate,
      verificationMethod: sponsoredGoal.verificationMethod,
      rewardId: sponsoredGoal.rewardId,
      maxUsers: sponsoredGoal.maxUsers,
      createdAt: sponsoredGoal.createdAt,
    };
  }

  /**
   * Convierte una entidad de enrollment a DTO de respuesta
   */
  private toEnrollmentResponseDto(enrollment: any): EnrollmentResponseDto {
    return {
      id: enrollment.id,
      sponsoredGoalId: enrollment.sponsoredGoalId,
      userId: enrollment.userId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    };
  }
}
