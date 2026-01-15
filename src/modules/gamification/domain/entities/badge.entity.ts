/**
 * Entidad de dominio Badge
 * Representa un badge/insignia del sistema
 */
export class Badge {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly iconUrl: string | null,
    public readonly requiredPoints: number,
    public readonly createdAt: Date,
  ) {}
}
