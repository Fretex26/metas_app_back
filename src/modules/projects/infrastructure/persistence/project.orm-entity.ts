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

  @Column({ type: 'jsonb', nullable: true })
  schedule: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => MilestoneOrmEntity, (milestone) => milestone.project)
  // milestones: MilestoneOrmEntity[];
}
