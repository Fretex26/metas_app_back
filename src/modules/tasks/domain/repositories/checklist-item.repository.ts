import { ChecklistItem } from '../entities/checklist-item.entity';

/**
 * Interfaz del repositorio de checklist items
 */
export interface IChecklistItemRepository {
  create(checklistItem: ChecklistItem): Promise<ChecklistItem>;
  findById(id: string): Promise<ChecklistItem | null>;
  findByTaskId(taskId: string): Promise<ChecklistItem[]>;
  findBySponsoredGoalId(sponsoredGoalId: string): Promise<ChecklistItem[]>;
  update(checklistItem: ChecklistItem): Promise<ChecklistItem>;
  delete(id: string): Promise<void>;
}
