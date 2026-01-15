import { Category } from '../../../categories/domain/entities/category.entity';

/**
 * Entidad de dominio User
 * Representa un usuario en el sistema
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly firebaseUid: string,
    public readonly role: 'user' | 'sponsor' | 'admin',
    public readonly categories: Category[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
