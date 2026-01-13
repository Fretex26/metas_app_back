import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SprintOrmEntity } from '../../../sprints/infrastructure/persistence/sprint.orm-entity';

/**
 * Entidad ORM para Task
 */
@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sprint_id' })
  sprintId: string;

  @ManyToOne(() => SprintOrmEntity)
  @JoinColumn({ name: 'sprint_id' })
  sprint: SprintOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_available' })
  resourcesAvailable: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_needed' })
  resourcesNeeded: Record<string, any> | null;

  @Column({ type: 'integer', default: 0, name: 'incentive_points' })
  incentivePoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => DailyEntryOrmEntity, (dailyEntry) => dailyEntry.task)
  // dailyEntries: DailyEntryOrmEntity[];
  // @OneToMany(() => ChecklistItemOrmEntity, (item) => item.task)
  // checklistItems: ChecklistItemOrmEntity[];
}
