import { Project } from '../entities/project.entity';

/**
 * Interfaz del repositorio de proyectos
 */
export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
