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
import { CreateSponsoredGoalDto } from '../application/dto/create-sponsored-goal.dto';
import { SponsoredGoalResponseDto } from '../application/dto/sponsored-goal-response.dto';
import { CreateSponsoredGoalUseCase } from '../application/use-cases/create-sponsored-goal.use-case';
import { ListAvailableSponsoredGoalsUseCase } from '../application/use-cases/list-available-sponsored-goals.use-case';

/**
 * Controlador REST para gestión de sponsored goals
 * 
 * Permite crear objetivos patrocinados y listar objetivos disponibles
 * 
 * @apiTag sponsored-goals
 */
@ApiTags('sponsored-goals')
@Controller('sponsored-goals')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SponsoredGoalsController {
  constructor(
    private readonly createSponsoredGoalUseCase: CreateSponsoredGoalUseCase,
    private readonly listAvailableSponsoredGoalsUseCase: ListAvailableSponsoredGoalsUseCase,
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
    description: 'Solo los patrocinadores aprobados pueden crear objetivos patrocinados',
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
   * Lista objetivos patrocinados disponibles para usuarios
   */
  @Get('available')
  @ApiOperation({
    summary: 'Listar objetivos patrocinados disponibles',
    description:
      'Obtiene la lista de objetivos patrocinados activos y disponibles para inscribirse',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de objetivos patrocinados disponibles',
    type: [SponsoredGoalResponseDto],
  })
  async listAvailableSponsoredGoals(): Promise<SponsoredGoalResponseDto[]> {
    const goals = await this.listAvailableSponsoredGoalsUseCase.execute();
    return goals.map((goal) => this.toResponseDto(goal));
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
      criteria: sponsoredGoal.criteria,
      startDate: sponsoredGoal.startDate,
      endDate: sponsoredGoal.endDate,
      verificationMethod: sponsoredGoal.verificationMethod,
      rewardId: sponsoredGoal.rewardId,
      maxUsers: sponsoredGoal.maxUsers,
      createdAt: sponsoredGoal.createdAt,
    };
  }
}
