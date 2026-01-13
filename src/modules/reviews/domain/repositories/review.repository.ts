import { Review } from '../entities/review.entity';

/**
 * Interfaz del repositorio de reviews
 */
export interface IReviewRepository {
  create(review: Review): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findBySprintId(sprintId: string): Promise<Review | null>;
  update(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
}
