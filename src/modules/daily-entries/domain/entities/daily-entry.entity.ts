/**
 * Entidad de dominio DailyEntry
 * Representa una entrada diaria del usuario
 */
export class DailyEntry {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly taskId: string | null,
    public readonly sprintId: string | null,
    public readonly notesYesterday: string,
    public readonly notesToday: string,
    public readonly difficulty: 'low' | 'medium' | 'high',
    public readonly energyChange: 'increased' | 'stable' | 'decreased',
    public readonly createdAt: Date,
  ) {}
}
