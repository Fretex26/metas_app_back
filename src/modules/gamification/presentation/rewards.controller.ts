import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
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
import { RewardResponseDto } from '../application/dto/reward-response.dto';
import { GetUserRewardsUseCase } from '../application/use-cases/get-user-rewards.use-case';
import { GetRewardByIdUseCase } from '../application/use-cases/get-reward-by-id.use-case';

/**
 * Controlador REST para Rewards (Recompensas)
 * 
 * Permite a los usuarios obtener sus recompensas asociadas a proyectos y milestones.
 * 
 * @apiTag rewards
 */
@ApiTags('rewards')
@Controller('rewards')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class RewardsController {
  constructor(
    private readonly getUserRewardsUseCase: GetUserRewardsUseCase,
    private readonly getRewardByIdUseCase: GetRewardByIdUseCase,
  ) {}

  /**
   * Obtiene todas las rewards del usuario autenticado
   * 
   * Retorna todas las rewards asociadas a los proyectos y milestones del usuario.
   * Elimina duplicados si una reward aparece tanto en un proyecto como en un milestone.
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las rewards del usuario',
    description:
      'Obtiene todas las rewards asociadas a los proyectos y milestones del usuario autenticado. Si el usuario no tiene rewards, retorna un array vacío.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rewards del usuario',
    type: [RewardResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  async getUserRewards(
    @CurrentUser() user: UserPayload,
  ): Promise<RewardResponseDto[]> {
    const rewards = await this.getUserRewardsUseCase.execute(
      user.userId || user.uid,
    );

    return rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      claimInstructions: reward.claimInstructions,
      claimLink: reward.claimLink,
    }));
  }

  /**
   * Obtiene una reward específica por su ID
   * 
   * Verifica que la reward pertenezca al usuario (esté asociada a alguno de sus proyectos o milestones).
   * Si no pertenece al usuario, retorna 403 Forbidden.
   * Si no existe, retorna 404 Not Found.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener reward por ID',
    description:
      'Obtiene una reward específica por su ID. El usuario solo puede acceder a rewards de sus propios proyectos y milestones.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la reward',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la reward',
    type: RewardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permiso para acceder a esta reward',
  })
  @ApiResponse({
    status: 404,
    description: 'Reward no encontrada',
  })
  async getRewardById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<RewardResponseDto> {
    const reward = await this.getRewardByIdUseCase.execute(
      id,
      user.userId || user.uid,
    );

    return {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      claimInstructions: reward.claimInstructions,
      claimLink: reward.claimLink,
    };
  }
}
