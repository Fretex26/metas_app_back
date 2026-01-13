import { PointsWallet } from '../entities/points-wallet.entity';

/**
 * Interfaz del repositorio de points wallet
 */
export interface IPointsWalletRepository {
  create(wallet: PointsWallet): Promise<PointsWallet>;
  findByUserId(userId: string): Promise<PointsWallet | null>;
  update(wallet: PointsWallet): Promise<PointsWallet>;
  createOrUpdate(wallet: PointsWallet): Promise<PointsWallet>;
}
