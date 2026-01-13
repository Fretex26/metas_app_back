import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ISponsorRepository } from '../../domain/repositories/sponsor.repository';
import { Sponsor } from '../../domain/entities/sponsor.entity';

/**
 * Caso de uso para obtener el perfil de patrocinador del usuario
 */
@Injectable()
export class GetSponsorProfileUseCase {
  constructor(
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(userId: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findByUserId(userId);
    if (!sponsor) {
      throw new NotFoundException(
        'No se encontró perfil de patrocinador para este usuario',
      );
    }
    return sponsor;
  }
}
