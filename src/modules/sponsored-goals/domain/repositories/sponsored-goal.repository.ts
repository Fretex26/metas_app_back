import { SponsoredGoal } from '../entities/sponsored-goal.entity';

/**
 * Interfaz del repositorio de sponsored goals
 */
export interface ISponsoredGoalRepository {
  create(sponsoredGoal: SponsoredGoal): Promise<SponsoredGoal>;
  findById(id: string): Promise<SponsoredGoal | null>;
  findBySponsorId(sponsorId: string): Promise<SponsoredGoal[]>;
  findByProjectId(projectId: string): Promise<SponsoredGoal | null>;
  findAvailableGoals(): Promise<SponsoredGoal[]>;
  update(sponsoredGoal: SponsoredGoal): Promise<SponsoredGoal>;
  delete(id: string): Promise<void>;
}
