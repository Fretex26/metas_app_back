import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { LoadUserInterceptor } from '../../../shared/interceptors/load-user.interceptor';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { WalletResponseDto } from '../application/dto/wallet-response.dto';
import { PointsTransactionResponseDto } from '../application/dto/points-transaction-response.dto';
import { UserRewardResponseDto } from '../application/dto/user-reward-response.dto';
import { UpdateUserRewardStatusDto } from '../application/dto/update-user-reward-status.dto';
import { GetWalletUseCase } from '../application/use-cases/get-wallet.use-case';
import { GetTransactionsUseCase } from '../application/use-cases/get-transactions.use-case';
import { UpdateUserRewardStatusUseCase } from '../application/use-cases/update-user-reward-status.use-case';

/**
 * Controlador REST para gamificación (puntos y transacciones)
 *
 * Permite consultar la billetera de puntos y el historial de transacciones
 *
 * @apiTag gamification
 */
@ApiTags('gamification')
@Controller('gamification')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@UseInterceptors(LoadUserInterceptor)
@ApiBearerAuth('JWT-auth')
export class GamificationController {
  constructor(
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly updateUserRewardStatusUseCase: UpdateUserRewardStatusUseCase,
  ) {}

  /**
   * Obtiene la billetera de puntos del usuario
   */
  @Get('wallet')
  @ApiOperation({
    summary: 'Obtener billetera de puntos',
    description:
      'Obtiene la billetera de puntos del usuario. Si no existe, se crea una nueva con balance 0.',
  })
  @ApiResponse({
    status: 200,
    description: 'Billetera de puntos',
    type: WalletResponseDto,
  })
  async getWallet(
    @CurrentUser() user: UserPayload,
  ): Promise<WalletResponseDto> {
    const wallet = await this.getWalletUseCase.execute(user.userId || user.uid);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  /**
   * Obtiene el historial de transacciones de puntos del usuario
   */
  @Get('transactions')
  @ApiOperation({
    summary: 'Obtener historial de transacciones',
    description:
      'Obtiene el historial de transacciones de puntos del usuario con paginación',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de resultados (por defecto: 50)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de resultados a omitir (por defecto: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de transacciones',
    type: [PointsTransactionResponseDto],
  })
  async getTransactions(
    @CurrentUser() user: UserPayload,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<{
    transactions: PointsTransactionResponseDto[];
    total: number;
  }> {
    const result = await this.getTransactionsUseCase.execute(
      user.userId || user.uid,
      limit,
      offset,
    );
    return {
      transactions: result.transactions.map((transaction) => ({
        id: transaction.id,
        userId: transaction.userId,
        change: transaction.change,
        reason: transaction.reason,
        sourceType: transaction.sourceType,
        sourceId: transaction.sourceId,
        createdAt: transaction.createdAt,
      })),
      total: result.total,
    };
  }

  /**
   * Actualiza el estado de un user reward (solo para sponsors)
   */
  @Patch('user-rewards/:userRewardId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado de user reward',
    description:
      'Permite a un sponsor cambiar el estado de un user reward a DELIVERED',
  })
  @ApiParam({
    name: 'userRewardId',
    description: 'ID del user reward',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: UserRewardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User reward no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo los patrocinadores pueden cambiar el estado',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se puede actualizar el estado a DELIVERED',
  })
  async updateUserRewardStatus(
    @Param('userRewardId') userRewardId: string,
    @Body() updateUserRewardStatusDto: UpdateUserRewardStatusDto,
    @CurrentUser() user: UserPayload,
  ): Promise<UserRewardResponseDto> {
    const userReward = await this.updateUserRewardStatusUseCase.execute(
      userRewardId,
      updateUserRewardStatusDto.status,
      user.userId || user.uid,
    );
    return {
      id: userReward.id,
      userId: userReward.userId,
      rewardId: userReward.rewardId,
      status: userReward.status,
      claimedAt: userReward.claimedAt,
      deliveredAt: userReward.deliveredAt,
      createdAt: userReward.createdAt,
    };
  }
}
