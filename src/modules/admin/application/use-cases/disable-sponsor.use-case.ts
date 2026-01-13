import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para deshabilitar un sponsor
 */
@Injectable()
export class DisableSponsorUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para deshabilitar un sponsor
   * @param sponsorId - ID del sponsor a deshabilitar
   * @param adminUserId - ID del administrador que deshabilita
   * @returns Sponsor deshabilitado
   * @throws NotFoundException si el sponsor no existe
   * @throws BadRequestException si el sponsor no está en estado APPROVED
   */
  async execute(sponsorId: string, adminUserId: string) {
    const sponsor = await this.adminRepository.findSponsorById(sponsorId);

    if (!sponsor) {
      throw new NotFoundException('Sponsor no encontrado');
    }

    if (sponsor.status !== SponsorStatus.APPROVED) {
      throw new BadRequestException(
        `Solo se pueden deshabilitar sponsors con estado APPROVED. Estado actual: ${sponsor.status}`,
      );
    }

    return await this.adminRepository.updateSponsorStatus(
      sponsorId,
      SponsorStatus.DISABLED,
      adminUserId,
    );
  }
}
