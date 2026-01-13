import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { UserStatisticsResponseDto } from '../application/dto/user-statistics-response.dto';
import { GetUserStatisticsUseCase } from '../application/use-cases/get-user-statistics.use-case';

/**
 * Controlador REST para estadísticas
 * 
 * Proporciona endpoints para consultar estadísticas del usuario
 * 
 * @apiTag statistics
 */
@ApiTags('statistics')
@Controller('statistics')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatisticsController {
  constructor(
    private readonly getUserStatisticsUseCase: GetUserStatisticsUseCase,
  ) {}

  /**
   * Obtiene estadísticas generales del usuario
   */
  @Get('user')
  @ApiOperation({
    summary: 'Obtener estadísticas del usuario',
    description:
      'Obtiene estadísticas generales del usuario: puntos totales, badges, proyectos activos, tareas completadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del usuario',
    type: UserStatisticsResponseDto,
  })
  async getUserStatistics(
    @CurrentUser() user: UserPayload,
  ): Promise<UserStatisticsResponseDto> {
    return await this.getUserStatisticsUseCase.execute(
      user.userId || user.uid,
    );
  }
}
