import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { ISponsoredGoalRepository } from '../../domain/repositories/sponsored-goal.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { SponsoredGoal } from '../../domain/entities/sponsored-goal.entity';

/**
 * Caso de uso para obtener un objetivo patrocinado por ID.
 * Solo el sponsor dueño puede acceder.
 */
@Injectable()
export class GetSponsoredGoalByIdUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(
    sponsoredGoalId: string,
    userId: string,
  ): Promise<SponsoredGoal> {
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
        'No tienes permiso para acceder a este objetivo patrocinado',
      );
    }

    return goal;
  }
}
