import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SponsorOrmEntity } from '../../../sponsors/infrastructure/persistence/sponsor.orm-entity';

/**
 * Entidad ORM para Reward
 * Representa una recompensa que puede ser otorgada a usuarios.
 * Cada reward es simplemente una página con título, descripción, instrucciones de reclamación y un link opcional.
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

  @Column({ type: 'text', nullable: true, name: 'claim_instructions' })
  claimInstructions: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'claim_link' })
  claimLink: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
