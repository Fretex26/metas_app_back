import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SponsoredGoalOrmEntity } from './sponsored-goal.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
import { EnrollmentStatus } from '../../../../shared/types/enums';

/**
 * Entidad ORM para SponsorEnrollment
 * Representa la inscripción de un usuario a un objetivo patrocinado
 */
@Entity('sponsor_enrollments')
@Index(['sponsoredGoalId', 'userId'], { unique: true })
export class SponsorEnrollmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sponsored_goal_id' })
  sponsoredGoalId: string;

  @ManyToOne(() => SponsoredGoalOrmEntity)
  @JoinColumn({ name: 'sponsored_goal_id' })
  sponsoredGoal: SponsoredGoalOrmEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  // Relaciones
  // @OneToMany(() => VerificationEventOrmEntity, (event) => event.enrollment)
  // verificationEvents: VerificationEventOrmEntity[];
}
