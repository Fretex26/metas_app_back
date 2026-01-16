import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
import { PointsSourceType } from '../../../../shared/types/enums';

/**
 * Entidad ORM para PointsTransaction
 */
@Entity('points_transactions')
@Index(['userId', 'createdAt'])
export class PointsTransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'integer' })
  change: number; // positivo para ganancias, negativo para gastos

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: PointsSourceType,
    name: 'source_type',
  })
  sourceType: PointsSourceType;

  @Column({ type: 'uuid', nullable: true, name: 'source_id' })
  sourceId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
