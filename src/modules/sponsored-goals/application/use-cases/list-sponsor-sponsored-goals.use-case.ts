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
 * Caso de uso para listar los objetivos patrocinados del sponsor autenticado.
 * Solo sponsors pueden ejecutarlo.
 */
@Injectable()
export class ListSponsorSponsoredGoalsUseCase {
  constructor(
    @Inject('ISponsoredGoalRepository')
    private readonly sponsoredGoalRepository: ISponsoredGoalRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(userId: string): Promise<SponsoredGoal[]> {
    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }

    return this.sponsoredGoalRepository.findBySponsorId(sponsor.id);
  }
}
