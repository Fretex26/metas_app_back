import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProjectOrmEntity } from '../../../projects/infrastructure/persistence/project.orm-entity';
import { MilestoneStatus } from '../../../../shared/types/enums';

/**
 * Entidad ORM para Milestone
 */
@Entity('milestones')
export class MilestoneOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @ManyToOne(() => ProjectOrmEntity)
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  status: MilestoneStatus;

  @Column({ type: 'uuid', nullable: true, name: 'reward_id' })
  rewardId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  // @OneToMany(() => SprintOrmEntity, (sprint) => sprint.milestone)
  // sprints: SprintOrmEntity[];
}
