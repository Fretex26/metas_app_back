/**
 * Entidad de dominio Project
 * Representa un proyecto personal en el sistema
 */
export class Project {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly purpose: string,
    public readonly budget: number | null,
    public readonly finalDate: Date | null,
    public readonly resourcesAvailable: Record<string, any> | null,
    public readonly resourcesNeeded: Record<string, any> | null,
    public readonly schedule: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}
}
