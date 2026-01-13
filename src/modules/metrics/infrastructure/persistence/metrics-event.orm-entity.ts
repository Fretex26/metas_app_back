import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';

/**
 * Entidad ORM para MetricsEvent
 */
@Entity('metrics_events')
@Index(['event_type', 'created_at'])
@Index(['user_id', 'created_at'])
export class MetricsEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string | null;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity | null;

  @Column({ type: 'varchar', length: 255, name: 'event_type' })
  eventType: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
