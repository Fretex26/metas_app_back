import { Sponsor } from '../entities/sponsor.entity';

/**
 * Interfaz del repositorio de sponsors
 */
export interface ISponsorRepository {
  create(sponsor: Sponsor): Promise<Sponsor>;
  findById(id: string): Promise<Sponsor | null>;
  findByUserId(userId: string): Promise<Sponsor | null>;
  update(sponsor: Sponsor): Promise<Sponsor>;
  delete(id: string): Promise<void>;
}
