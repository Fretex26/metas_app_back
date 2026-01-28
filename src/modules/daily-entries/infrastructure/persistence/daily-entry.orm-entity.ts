import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
import { TaskOrmEntity } from '../../../tasks/infrastructure/persistence/task.orm-entity';
import { SprintOrmEntity } from '../../../sprints/infrastructure/persistence/sprint.orm-entity';
import { Difficulty, EnergyChange } from '../../../../shared/types/enums';

/**
 * Entidad ORM para DailyEntry
 */
@Entity('daily_entries')
export class DailyEntryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'uuid', nullable: true, name: 'task_id' })
  taskId: string | null;

  @ManyToOne(() => TaskOrmEntity, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: TaskOrmEntity | null;

  @Column({ type: 'uuid', name: 'sprint_id' })
  sprintId: string;

  @ManyToOne(() => SprintOrmEntity)
  @JoinColumn({ name: 'sprint_id' })
  sprint: SprintOrmEntity;

  @Column({ type: 'text', name: 'notes_yesterday' })
  notesYesterday: string;

  @Column({ type: 'text', name: 'notes_today' })
  notesToday: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @Column({
    type: 'enum',
    enum: EnergyChange,
    name: 'energy_change',
  })
  energyChange: EnergyChange;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
