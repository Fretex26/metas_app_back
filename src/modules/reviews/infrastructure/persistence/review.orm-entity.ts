import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SprintOrmEntity } from '../../../sprints/infrastructure/persistence/sprint.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';

/**
 * Entidad ORM para Review
 * Relación 1:1 con Sprint
 */
@Entity('reviews')
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'sprint_id' })
  sprintId: string;

  @OneToOne(() => SprintOrmEntity)
  @JoinColumn({ name: 'sprint_id' })
  sprint: SprintOrmEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'integer', name: 'progress_percentage' })
  progressPercentage: number;

  @Column({ type: 'integer', default: 0, name: 'extra_points' })
  extraPoints: number;

  @Column({ type: 'text' })
  summary: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
