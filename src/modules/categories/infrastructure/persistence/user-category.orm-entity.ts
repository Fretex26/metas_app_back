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
import { CategoryOrmEntity } from './category.orm-entity';

/**
 * Entidad ORM para UserCategory
 * Relación ManyToMany entre User y Category
 */
@Entity('user_categories')
@Index(['user_id', 'category_id'], { unique: true })
export class UserCategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => CategoryOrmEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
