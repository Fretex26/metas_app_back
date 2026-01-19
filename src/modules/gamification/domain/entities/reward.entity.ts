/**
 * Entidad de dominio Reward
 * Representa una recompensa que puede ser otorgada a usuarios
 */
export class Reward {
  constructor(
    public readonly id: string,
    public readonly sponsorId: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly claimInstructions: string | null,
    public readonly claimLink: string | null,
    public readonly createdAt: Date,
  ) {}
}
