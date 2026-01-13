import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskOrmEntity } from './task.orm-entity';

/**
 * Entidad ORM para ChecklistItem
 * Puede pertenecer a una Task o a un SponsoredGoal (uno u otro, no ambos)
 */
@Entity('checklist_items')
export class ChecklistItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'task_id' })
  taskId: string | null;

  @ManyToOne(() => TaskOrmEntity, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: TaskOrmEntity | null;

  @Column({ type: 'uuid', nullable: true, name: 'sponsored_goal_id' })
  sponsoredGoalId: string | null;

  // @ManyToOne(() => SponsoredGoalOrmEntity, { nullable: true })
  // @JoinColumn({ name: 'sponsored_goal_id' })
  // sponsoredGoal: SponsoredGoalOrmEntity | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false, name: 'is_required' })
  isRequired: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
