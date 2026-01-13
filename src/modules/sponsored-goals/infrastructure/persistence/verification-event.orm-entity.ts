import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SponsorEnrollmentOrmEntity } from './sponsor-enrollment.orm-entity';
import { SponsoredGoalOrmEntity } from './sponsored-goal.orm-entity';
import { VerificationMethod } from '../../../../shared/types/enums';

/**
 * Entidad ORM para VerificationEvent
 * Representa un evento de verificación de completitud de un objetivo patrocinado
 */
@Entity('verification_events')
export class VerificationEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'enrollment_id' })
  enrollmentId: string;

  @ManyToOne(() => SponsorEnrollmentOrmEntity)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: SponsorEnrollmentOrmEntity;

  @Column({ type: 'uuid', name: 'sponsored_goal_id' })
  sponsoredGoalId: string;

  @ManyToOne(() => SponsoredGoalOrmEntity)
  @JoinColumn({ name: 'sponsored_goal_id' })
  sponsoredGoal: SponsoredGoalOrmEntity;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
  })
  method: VerificationMethod;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
