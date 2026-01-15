import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SponsorOrmEntity } from '../../../sponsors/infrastructure/persistence/sponsor.orm-entity';
import { ProjectOrmEntity } from '../../../projects/infrastructure/persistence/project.orm-entity';
import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * Entidad ORM para SponsoredGoal
 */
@Entity('sponsored_goals')
export class SponsoredGoalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sponsor_id' })
  sponsorId: string;

  @ManyToOne(() => SponsorOrmEntity)
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorOrmEntity;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @ManyToOne(() => ProjectOrmEntity)
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  criteria: Record<string, any> | null;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    name: 'verification_method',
  })
  verificationMethod: VerificationMethod;

  @Column({ type: 'uuid', nullable: true, name: 'reward_id' })
  rewardId: string | null;

  @Column({ type: 'integer', name: 'max_users' })
  maxUsers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => SponsorEnrollmentOrmEntity, (enrollment) => enrollment.sponsoredGoal)
  // enrollments: SponsorEnrollmentOrmEntity[];
  // @OneToMany(() => VerificationEventOrmEntity, (event) => event.sponsoredGoal)
  // verificationEvents: VerificationEventOrmEntity[];
  // @OneToMany(() => ChecklistItemOrmEntity, (item) => item.sponsoredGoal)
  // checklistItems: ChecklistItemOrmEntity[];
}
