/**
 * Entidad de dominio Review
 * Representa una revisión de un sprint
 */
export class Review {
  constructor(
    public readonly id: string,
    public readonly sprintId: string,
    public readonly userId: string,
    public readonly progressPercentage: number,
    public readonly extraPoints: number,
    public readonly summary: string,
    public readonly createdAt: Date,
  ) {}
}
