/**
 * Entidad de dominio Task
 * Representa una tarea dentro de un milestone
 * Puede estar asignada a un sprint o no
 */
export class Task {
  constructor(
    public readonly id: string,
    public readonly milestoneId: string,
    public readonly sprintId: string | null,
    public readonly name: string,
    public readonly description: string,
    public readonly status: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourcesAvailable: Record<string, any> | null,
    public readonly resourcesNeeded: Record<string, any> | null,
    public readonly incentivePoints: number,
    public readonly createdAt: Date,
  ) {}
}
