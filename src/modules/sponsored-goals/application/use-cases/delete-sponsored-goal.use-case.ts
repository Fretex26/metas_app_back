import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';

/**
 * Caso de uso para eliminar un objetivo patrocinado.
 * Solo el sponsor dueño puede eliminarlo.
 */
@Injectable()
export class DeleteSponsoredGoalUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(sponsoredGoalId: string, userId: string): Promise<void> {
    const goal = await this.sponsoredGoalRepository.findById(sponsoredGoalId);
    if (!goal) {
      throw new NotFoundException('Objetivo patrocinado no encontrado');
    }

    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    if (goal.sponsorId !== sponsor.id) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este objetivo patrocinado',
      );
    }

    await this.sponsoredGoalRepository.delete(sponsoredGoalId);
  }
}
