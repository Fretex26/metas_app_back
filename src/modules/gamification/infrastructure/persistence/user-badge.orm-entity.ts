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
import { BadgeOrmEntity } from './badge.orm-entity';

/**
 * Entidad ORM para UserBadge
 * Relación ManyToMany entre User y Badge
 */
@Entity('user_badges')
@Index(['user_id', 'badge_id'], { unique: true })
export class UserBadgeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'uuid', name: 'badge_id' })
  badgeId: string;

  @ManyToOne(() => BadgeOrmEntity)
  @JoinColumn({ name: 'badge_id' })
  badge: BadgeOrmEntity;

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;
}
