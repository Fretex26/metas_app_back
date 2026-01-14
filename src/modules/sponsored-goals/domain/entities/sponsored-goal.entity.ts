import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * Entidad de dominio SponsoredGoal
 * Representa un objetivo patrocinado creado por un sponsor
 */
export class SponsoredGoal {
  constructor(
    public readonly id: string,
    public readonly sponsorId: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly criteria: Record<string, any> | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly verificationMethod: VerificationMethod,
    public readonly rewardId: string | null,
    public readonly maxUsers: number,
    public readonly createdAt: Date,
  ) {}
}
