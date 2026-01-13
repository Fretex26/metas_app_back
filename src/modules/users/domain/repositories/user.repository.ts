import { User } from '../entities/user.entity';

/**
 * Interfaz del repositorio de usuarios
 * Define los métodos que deben implementar los repositorios de usuarios
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   */
  create(user: User): Promise<User>;

  /**
   * Busca un usuario por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por Firebase UID
   */
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;

  /**
   * Busca un usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Actualiza un usuario existente
   */
  update(user: User): Promise<User>;

  /**
   * Elimina un usuario
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Verifica si existe un usuario con el Firebase UID dado
   */
  existsByFirebaseUid(firebaseUid: string): Promise<boolean>;
}
