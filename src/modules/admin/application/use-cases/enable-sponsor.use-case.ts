import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para habilitar un sponsor deshabilitado
 */
@Injectable()
export class EnableSponsorUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para habilitar un sponsor
   * @param sponsorId - ID del sponsor a habilitar
   * @param adminUserId - ID del administrador que habilita
   * @returns Sponsor habilitado
   * @throws NotFoundException si el sponsor no existe
   * @throws BadRequestException si el sponsor no está en estado DISABLED
   */
  async execute(sponsorId: string, adminUserId: string) {
    const sponsor = await this.adminRepository.findSponsorById(sponsorId);

    if (!sponsor) {
      throw new NotFoundException('Sponsor no encontrado');
    }

    if (sponsor.status !== SponsorStatus.DISABLED) {
      throw new BadRequestException(
        `Solo se pueden habilitar sponsors con estado DISABLED. Estado actual: ${sponsor.status}`,
      );
    }

    return await this.adminRepository.updateSponsorStatus(
      sponsorId,
      SponsorStatus.APPROVED,
      adminUserId,
    );
  }
}
