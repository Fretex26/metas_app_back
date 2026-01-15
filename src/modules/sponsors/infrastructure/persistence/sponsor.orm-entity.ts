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
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
import { SponsorStatus } from '../../../../shared/types/enums';

/**
 * Entidad ORM para Sponsor
 * Mapea la tabla sponsors de la base de datos
 */
@Entity('sponsors')
@Index(['user_id'], { unique: true })
export class SponsorOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'varchar', length: 255, name: 'business_name' })
  businessName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_url' })
  logoUrl: string;

  @Column({ type: 'varchar', length: 255, name: 'contact_email' })
  contactEmail: string;

  @Column({
    type: 'enum',
    enum: SponsorStatus,
    default: SponsorStatus.PENDING,
  })
  status: SponsorStatus;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' })
  reviewedBy: string | null;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: UserOrmEntity | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones (se definirán en otros módulos)
  // @OneToMany(() => SponsoredGoalOrmEntity, (goal) => goal.sponsor)
  // sponsoredGoals: SponsoredGoalOrmEntity[];
}
