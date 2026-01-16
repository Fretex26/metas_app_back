import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../../../shared/types/enums';
import { UserCategoryOrmEntity } from '../../../categories/infrastructure/persistence/user-category.orm-entity';

/**
 * Entidad ORM para User
 * Mapea la tabla users de la base de datos
 */
@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'firebase_uid' })
  firebaseUid: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => UserCategoryOrmEntity, (userCategory) => userCategory.user)
  userCategories: UserCategoryOrmEntity[];

  // Relaciones (se definirán en otros módulos)
  // @OneToOne(() => SponsorOrmEntity, (sponsor) => sponsor.user)
  // sponsor: SponsorOrmEntity;
}
