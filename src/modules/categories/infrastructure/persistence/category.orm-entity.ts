import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/user.orm-entity';
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

  // Relaciones ManyToMany
  @ManyToMany(() => UserOrmEntity, (user) => user.categories)
  @JoinTable({
    name: 'user_categories',
    joinColumn: { name: 'category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserOrmEntity[];

  @ManyToMany(() => SponsoredGoalOrmEntity, (goal) => goal.categories)
  sponsoredGoals: SponsoredGoalOrmEntity[];
}
