/**
 * Entidad de dominio Sprint
 * Representa un sprint dentro de un milestone
 */
export class Sprint {
  constructor(
    public readonly id: string,
    public readonly milestoneId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly acceptanceCriteria: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourcesAvailable: Record<string, any> | null,
    public readonly resourcesNeeded: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}
}
