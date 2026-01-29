import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { IUserRewardRepository } from '../../domain/repositories/user-reward.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { UserReward } from '../../domain/entities/user-reward.entity';
import { UserRewardStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para actualizar el estado de un user reward
 * Solo los sponsors pueden actualizar el estado a DELIVERED, y solo si el reward
 * está asociado a un proyecto patrocinado (reward tiene sponsorId).
 * Los rewards de proyectos de usuarios normales se entregan automáticamente.
 */
@Injectable()
export class UpdateUserRewardStatusUseCase {
  constructor(
    @Inject('IUserRewardRepository')
    private readonly userRewardRepository: IUserRewardRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(
    userRewardId: string,
    newStatus: UserRewardStatus,
    sponsorUserId: string,
  ): Promise<UserReward> {
    // Verificar que el user reward existe con la relación reward y sponsor
    const result =
      await this.userRewardRepository.findByIdWithReward(userRewardId);

    if (!result) {
      throw new NotFoundException('Recompensa de usuario no encontrada');
    }

    const { userReward, rewardSponsorId } = result;

    // Si el reward NO tiene sponsorId, es un reward de proyecto de usuario normal
    // Estos rewards se entregan automáticamente y no pueden ser actualizados manualmente
    if (!rewardSponsorId) {
      throw new ForbiddenException(
        'Las recompensas de proyectos de usuarios normales se entregan automáticamente y no pueden ser actualizadas manualmente',
      );
    }

    // Verificar que el usuario es un sponsor
    const sponsor = await this.sponsorRepository.findByUserId(sponsorUserId);
    if (!sponsor) {
      throw new ForbiddenException(
        'Solo los patrocinadores pueden actualizar el estado de las recompensas',
      );
    }

    // Verificar que el reward pertenece al sponsor
    if (rewardSponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta recompensa',
      );
    }

    // Validar que solo se puede cambiar a DELIVERED
    if (newStatus !== UserRewardStatus.DELIVERED) {
      throw new BadRequestException(
        'Solo se puede actualizar el estado a DELIVERED',
      );
    }

    // Validar que el estado actual permite el cambio
    if (userReward.status === UserRewardStatus.DELIVERED) {
      throw new BadRequestException(
        'La recompensa ya está en estado DELIVERED',
      );
    }

    // Actualizar el user reward
    const updatedUserReward = new UserReward(
      userReward.id,
      userReward.userId,
      userReward.rewardId,
      newStatus,
      userReward.claimedAt,
      new Date(), // deliveredAt se establece cuando se marca como DELIVERED
      userReward.createdAt,
    );

    return await this.userRewardRepository.update(updatedUserReward);
  }
}
