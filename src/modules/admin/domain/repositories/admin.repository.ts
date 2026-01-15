import { SponsorOrmEntity } from '../../../sponsors/infrastructure/persistence/sponsor.orm-entity';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Interfaz del repositorio de administración
 * Define los métodos para operaciones administrativas sobre patrocinadores
 */
export interface IAdminRepository {
  /**
   * Obtiene todos los sponsors con un estado específico
   */
  findSponsorsByStatus(status: SponsorStatus): Promise<SponsorOrmEntity[]>;

  /**
   * Obtiene todos los sponsors
   */
  findAllSponsors(): Promise<SponsorOrmEntity[]>;

  /**
   * Obtiene un sponsor por ID
   */
  findSponsorById(id: string): Promise<SponsorOrmEntity | null>;

  /**
   * Actualiza el estado de un sponsor
   */
  updateSponsorStatus(
    id: string,
    status: SponsorStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<SponsorOrmEntity>;
}
