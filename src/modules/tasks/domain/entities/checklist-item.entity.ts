/**
 * Entidad de dominio ChecklistItem
 * Representa un item de checklist que puede pertenecer a una Task o a un SponsoredGoal
 */
export class ChecklistItem {
  constructor(
    public readonly id: string,
    public readonly taskId: string | null,
    public readonly sponsoredGoalId: string | null,
    public readonly description: string,
    public readonly isRequired: boolean,
    public readonly isChecked: boolean,
    public readonly createdAt: Date,
  ) {}
}
