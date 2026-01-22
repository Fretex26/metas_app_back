import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
import { SponsoredGoalOrmEntity } from '../../../sponsored-goals/infrastructure/persistence/sponsored-goal.orm-entity';
import { SponsorEnrollmentOrmEntity } from '../../../sponsored-goals/infrastructure/persistence/sponsor-enrollment.orm-entity';
import { ProjectStatus } from '../../../../shared/types/enums';

/**
 * Entidad ORM para Project
 */
@Entity('projects')
export class ProjectOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'decimal', nullable: true })
  budget: number | null;

  @Column({ type: 'date', nullable: true, name: 'final_date' })
  finalDate: Date | null;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_available' })
  resourcesAvailable: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'resources_needed' })
  resourcesNeeded: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true, name: 'sponsored_goal_id' })
  sponsoredGoalId: string | null;

  @ManyToOne(() => SponsoredGoalOrmEntity, { nullable: true })
  @JoinColumn({ name: 'sponsored_goal_id' })
  sponsoredGoal: SponsoredGoalOrmEntity | null;

  @Column({ type: 'uuid', nullable: true, name: 'enrollment_id' })
  enrollmentId: string | null;

  @ManyToOne(() => SponsorEnrollmentOrmEntity, { nullable: true })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: SponsorEnrollmentOrmEntity | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status: ProjectStatus;

  @Column({ type: 'uuid', name: 'reward_id' })
  rewardId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => MilestoneOrmEntity, (milestone) => milestone.project)
  // milestones: MilestoneOrmEntity[];
}
