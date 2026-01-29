import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { UserCategoryOrmEntity } from './user-category.orm-entity';
import { SponsoredGoalOrmEntity } from '../../../sponsored-goals/infrastructure/persistence/sponsored-goal.orm-entity';

/**
 * Entidad ORM para Category
 */
@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  @OneToMany(
    () => UserCategoryOrmEntity,
    (userCategory) => userCategory.category,
  )
  userCategories: UserCategoryOrmEntity[];

  @ManyToMany(() => SponsoredGoalOrmEntity, (goal) => goal.categories)
  sponsoredGoals: SponsoredGoalOrmEntity[];
}
