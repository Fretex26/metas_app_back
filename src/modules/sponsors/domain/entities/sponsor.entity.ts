import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Entidad de dominio Sponsor
 * Representa un patrocinador en el sistema
 */
export class Sponsor {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly businessName: string,
    public readonly description: string,
    public readonly category: string,
    public readonly logoUrl: string | null,
    public readonly contactEmail: string,
    public readonly status: SponsorStatus,
    public readonly reviewedBy: string | null,
    public readonly reviewedAt: Date | null,
    public readonly rejectionReason: string | null,
    public readonly createdAt: Date,
  ) {}
}
