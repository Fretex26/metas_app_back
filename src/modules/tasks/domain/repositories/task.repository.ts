import { Task } from '../entities/task.entity';

/**
 * Interfaz del repositorio de tasks
 */
export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findBySprintId(sprintId: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}
