/**
 * Entidad de dominio Task
 * Representa una tarea dentro de un sprint
 */
export class Task {
  constructor(
    public readonly id: string,
    public readonly sprintId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourcesAvailable: Record<string, any> | null,
    public readonly resourcesNeeded: Record<string, any> | null,
    public readonly incentivePoints: number,
    public readonly createdAt: Date,
  ) {}
}
