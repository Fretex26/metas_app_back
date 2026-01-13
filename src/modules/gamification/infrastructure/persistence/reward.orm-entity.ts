import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SponsorOrmEntity } from '../../../sponsors/infrastructure/persistence/sponsor.orm-entity';
import { RewardType } from '../../../../shared/types/enums';

/**
 * Entidad ORM para Reward
 */
@Entity('rewards')
export class RewardOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'sponsor_id' })
  sponsorId: string | null;

  @ManyToOne(() => SponsorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorOrmEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RewardType,
  })
  type: RewardType;

  @Column({ type: 'jsonb', nullable: true })
  value: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
