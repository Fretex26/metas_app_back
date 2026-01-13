import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para aprobar un sponsor
 */
@Injectable()
export class ApproveSponsorUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para aprobar un sponsor
   * @param sponsorId - ID del sponsor a aprobar
   * @param adminUserId - ID del administrador que aprueba
   * @returns Sponsor aprobado
   * @throws NotFoundException si el sponsor no existe
   * @throws BadRequestException si el sponsor no está en estado PENDING
   */
  async execute(sponsorId: string, adminUserId: string) {
    const sponsor = await this.adminRepository.findSponsorById(sponsorId);

    if (!sponsor) {
      throw new NotFoundException('Sponsor no encontrado');
    }

    if (sponsor.status !== SponsorStatus.PENDING) {
      throw new BadRequestException(
        `Solo se pueden aprobar sponsors con estado PENDING. Estado actual: ${sponsor.status}`,
      );
    }

    return await this.adminRepository.updateSponsorStatus(
      sponsorId,
      SponsorStatus.APPROVED,
      adminUserId,
    );
  }
}
