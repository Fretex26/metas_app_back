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
 * Entidad ORM para Retrospective
 * Relación 1:1 con Sprint
 */
@Entity('retrospectives')
export class RetrospectiveOrmEntity {
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

  @Column({ type: 'text', name: 'what_went_well' })
  whatWentWell: string;

  @Column({ type: 'text', name: 'what_went_wrong' })
  whatWentWrong: string;

  @Column({ type: 'text', nullable: true })
  improvements: string;

  @Column({ type: 'boolean', default: false, name: 'is_public' })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
