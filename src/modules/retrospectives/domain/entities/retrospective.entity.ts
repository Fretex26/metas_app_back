/**
 * Entidad de dominio Retrospective
 * Representa una retrospectiva de un sprint
 */
export class Retrospective {
  constructor(
    public readonly id: string,
    public readonly sprintId: string,
    public readonly userId: string,
    public readonly whatWentWell: string,
    public readonly whatWentWrong: string,
    public readonly improvements: string,
    public readonly isPublic: boolean,
    public readonly createdAt: Date,
  ) {}
}
