import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';

/**
 * Caso de uso para obtener los detalles de un sponsor específico
 */
@Injectable()
export class GetSponsorDetailsUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para obtener los detalles de un sponsor
   * @param sponsorId - ID del sponsor
   * @returns Sponsor encontrado
   * @throws NotFoundException si el sponsor no existe
   */
  async execute(sponsorId: string) {
    const sponsor = await this.adminRepository.findSponsorById(sponsorId);

    if (!sponsor) {
      throw new NotFoundException('Sponsor no encontrado');
    }

    return sponsor;
  }
}
