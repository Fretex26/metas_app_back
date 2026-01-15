import { Milestone } from '../entities/milestone.entity';

/**
 * Interfaz del repositorio de milestones
 */
export interface IMilestoneRepository {
  create(milestone: Milestone): Promise<Milestone>;
  findById(id: string): Promise<Milestone | null>;
  findByProjectId(projectId: string): Promise<Milestone[]>;
  update(milestone: Milestone): Promise<Milestone>;
  delete(id: string): Promise<void>;
}
