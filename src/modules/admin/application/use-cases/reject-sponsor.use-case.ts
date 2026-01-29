import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';
import { RejectSponsorDto } from '../dto/reject-sponsor.dto';

/**
 * Caso de uso para rechazar un sponsor
 */
@Injectable()
export class RejectSponsorUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para rechazar un sponsor
   * @param sponsorId - ID del sponsor a rechazar
   * @param adminUserId - ID del administrador que rechaza
   * @param rejectSponsorDto - DTO con la razón del rechazo (opcional)
   * @returns Sponsor rechazado
   * @throws NotFoundException si el sponsor no existe
   * @throws BadRequestException si el sponsor no está en estado PENDING
   */
  async execute(
    sponsorId: string,
    adminUserId: string,
    rejectSponsorDto?: RejectSponsorDto,
  ) {
    const sponsor = await this.adminRepository.findSponsorById(sponsorId);

    if (!sponsor) {
      throw new NotFoundException('Sponsor no encontrado');
    }

    if (sponsor.status !== SponsorStatus.PENDING) {
      throw new BadRequestException(
        `Solo se pueden rechazar sponsors con estado PENDING. Estado actual: ${sponsor.status}`,
      );
    }

    return await this.adminRepository.updateSponsorStatus(
      sponsorId,
      SponsorStatus.REJECTED,
      adminUserId,
      rejectSponsorDto?.rejectionReason,
    );
  }
}
