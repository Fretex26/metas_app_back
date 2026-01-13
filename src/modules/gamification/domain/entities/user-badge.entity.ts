/**
 * Entidad de dominio UserBadge
 * Representa un badge obtenido por un usuario
 */
export class UserBadge {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly badgeId: string,
    public readonly earnedAt: Date,
  ) {}
}
