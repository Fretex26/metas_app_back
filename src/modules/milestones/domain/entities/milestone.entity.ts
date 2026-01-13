/**
 * Entidad de dominio Milestone
 * Representa una meta/hito dentro de un proyecto
 */
export class Milestone {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly createdAt: Date,
  ) {}
}
