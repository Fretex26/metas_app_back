import { Injectable, Inject } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para obtener la lista de sponsors pendientes de aprobación
 */
@Injectable()
export class GetPendingSponsorsUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para obtener sponsors pendientes
   * @returns Lista de sponsors con status PENDING
   */
  async execute() {
    return await this.adminRepository.findSponsorsByStatus(
      SponsorStatus.PENDING,
    );
  }
}
