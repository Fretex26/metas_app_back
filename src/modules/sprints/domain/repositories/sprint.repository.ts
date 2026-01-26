import { Sprint } from '../entities/sprint.entity';

/**
 * Interfaz del repositorio de sprints
 */
export interface ISprintRepository {
  create(sprint: Sprint): Promise<Sprint>;
  findById(id: string): Promise<Sprint | null>;
  findByMilestoneId(milestoneId: string): Promise<Sprint[]>;
  findByUserIdWithEndDateBeforeOrEqual(
    userId: string,
    endDate: Date,
  ): Promise<Sprint[]>;
  update(sprint: Sprint): Promise<Sprint>;
  delete(id: string): Promise<void>;
}
