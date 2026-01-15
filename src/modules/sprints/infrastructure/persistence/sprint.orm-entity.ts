import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { MilestoneOrmEntity } from '../../../milestones/infrastructure/persistence/milestone.orm-entity';

/**
 * Entidad ORM para Sprint
 */
@Entity('sprints')
export class SprintOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'milestone_id' })
  milestoneId: string;

  @ManyToOne(() => MilestoneOrmEntity)
  @JoinColumn({ name: 'milestone_id' })
  milestone: MilestoneOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true, name: 'acceptance_criteria' })
  acceptanceCriteria: Record<string, any> | null;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_available' })
  resourcesAvailable: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_needed' })
  resourcesNeeded: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => TaskOrmEntity, (task) => task.sprint)
  // tasks: TaskOrmEntity[];
  // @OneToOne(() => ReviewOrmEntity, (review) => review.sprint)
  // review: ReviewOrmEntity;
  // @OneToOne(() => RetrospectiveOrmEntity, (retrospective) => retrospective.sprint)
  // retrospective: RetrospectiveOrmEntity;
}
