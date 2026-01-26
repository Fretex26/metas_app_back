import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { PendingSprintsResponseDto } from '../application/dto/pending-sprints-response.dto';
import { GetPendingSprintsUseCase } from '../application/use-cases/get-pending-sprints.use-case';

/**
 * Controlador REST para sprints pendientes de review o retrospectiva
 *
 * @apiTag reviews
 */
@ApiTags('reviews')
@Controller('reviews/pending-sprints')
@UseGuards(FirebaseAuthGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class PendingSprintsController {
  constructor(
    private readonly getPendingSprintsUseCase: GetPendingSprintsUseCase,
  ) {}

  /**
   * Obtiene los sprints pendientes de review o retrospectiva
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener sprints pendientes de review o retrospectiva',
    description:
      'Obtiene los sprints del usuario que han finalizado (endDate <= hoy) y que no tienen review o retrospectiva (o ambas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sprints pendientes',
    type: [PendingSprintsResponseDto],
  })
  async getPendingSprints(
    @CurrentUser() user: UserPayload,
  ): Promise<PendingSprintsResponseDto[]> {
    return await this.getPendingSprintsUseCase.execute(
      user.userId || user.uid,
    );
  }
}
