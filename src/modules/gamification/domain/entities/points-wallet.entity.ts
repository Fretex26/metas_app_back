/**
 * Entidad de dominio PointsWallet
 * Representa la billetera de puntos de un usuario
 */
export class PointsWallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly balance: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
