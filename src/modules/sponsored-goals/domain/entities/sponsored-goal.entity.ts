import { VerificationMethod } from '../../../../shared/types/enums';
import { Category } from '../../../categories/domain/entities/category.entity';

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
    public readonly categories: Category[],
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly verificationMethod: VerificationMethod,
    public readonly rewardId: string | null,
    public readonly maxUsers: number,
    public readonly createdAt: Date,
  ) {}
}
