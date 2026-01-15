import { Retrospective } from '../entities/retrospective.entity';

/**
 * Interfaz del repositorio de retrospectives
 */
export interface IRetrospectiveRepository {
  create(retrospective: Retrospective): Promise<Retrospective>;
  findById(id: string): Promise<Retrospective | null>;
  findBySprintId(sprintId: string): Promise<Retrospective | null>;
  findPublicRetrospectives(): Promise<Retrospective[]>;
  update(retrospective: Retrospective): Promise<Retrospective>;
  delete(id: string): Promise<void>;
}
