import { Injectable, Inject } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/repositories/admin.repository';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Caso de uso para obtener todos los sponsors (opcionalmente filtrados por estado)
 */
@Injectable()
export class ListAllSponsorsUseCase {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para obtener todos los sponsors
   * @param status - Estado opcional para filtrar
   * @returns Lista de sponsors
   */
  async execute(status?: SponsorStatus) {
    if (status) {
      return await this.adminRepository.findSponsorsByStatus(status);
    }
    return await this.adminRepository.findAllSponsors();
  }
}
