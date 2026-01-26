import { Reward } from '../entities/reward.entity';

/**
 * Interfaz del repositorio de reward
 */
export interface IRewardRepository {
  create(reward: Reward): Promise<Reward>;
  findById(id: string): Promise<Reward | null>;
  findByIds(ids: string[]): Promise<Reward[]>;
}
