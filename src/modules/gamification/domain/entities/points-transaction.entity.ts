import { PointsSourceType } from '../../../../shared/types/enums';

/**
 * Entidad de dominio PointsTransaction
 * Representa una transacción de puntos
 */
export class PointsTransaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly change: number, // positivo para ganancias, negativo para gastos
    public readonly reason: string,
    public readonly sourceType: PointsSourceType,
    public readonly sourceId: string | null,
    public readonly createdAt: Date,
  ) {}
}
