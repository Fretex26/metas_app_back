import { Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

/**
 * Caso de uso para obtener el perfil de un usuario
 */
@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso para obtener el perfil de un usuario por Firebase UID
   * @param firebaseUid - Firebase UID del usuario
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async execute(firebaseUid: string): Promise<User> {
    const user = await this.userRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Ejecuta el caso de uso para obtener el perfil de un usuario por ID
   * @param userId - ID del usuario
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async executeById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
