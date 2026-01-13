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
import { RewardOrmEntity } from './reward.orm-entity';
import { UserRewardStatus } from '../../../../shared/types/enums';

/**
 * Entidad ORM para UserReward
 */
@Entity('user_rewards')
@Index(['user_id', 'created_at'])
export class UserRewardOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'uuid', name: 'reward_id' })
  rewardId: string;

  @ManyToOne(() => RewardOrmEntity)
  @JoinColumn({ name: 'reward_id' })
  reward: RewardOrmEntity;

  @Column({
    type: 'enum',
    enum: UserRewardStatus,
    default: UserRewardStatus.PENDING,
  })
  status: UserRewardStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'claimed_at' })
  claimedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
