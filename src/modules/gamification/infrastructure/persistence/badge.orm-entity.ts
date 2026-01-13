import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entidad ORM para Badge
 */
@Entity('badges')
export class BadgeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'icon_url' })
  iconUrl: string | null;

  @Column({ type: 'integer', name: 'required_points' })
  requiredPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
