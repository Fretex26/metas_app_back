import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SponsoredGoalOrmEntity } from '../../../sponsored-goals/infrastructure/persistence/sponsored-goal.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';

/**
 * Entidad ORM para SponsoredGoalCategory
 * Relación ManyToMany entre SponsoredGoal y Category
 */
@Entity('sponsored_goal_categories')
@Index(['sponsoredGoalId', 'categoryId'], { unique: true })
export class SponsoredGoalCategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sponsored_goal_id' })
  sponsoredGoalId: string;

  @ManyToOne(() => SponsoredGoalOrmEntity)
  @JoinColumn({ name: 'sponsored_goal_id' })
  sponsoredGoal: SponsoredGoalOrmEntity;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => CategoryOrmEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
