import { Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

/**
 * Caso de uso para actualizar el perfil de un usuario
 */
@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso para actualizar el perfil de un usuario
   * @param firebaseUid - Firebase UID del usuario
   * @param updateUserDto - Datos a actualizar
   * @returns Usuario actualizado
   * @throws NotFoundException si el usuario no existe
   */
  async execute(
    firebaseUid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Obtener el usuario actual
    const user = await this.userRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear una nueva instancia con los datos actualizados
    const updatedUser = new User(
      user.id,
      updateUserDto.name ?? user.name,
      user.email,
      user.firebaseUid,
      user.role,
      user.createdAt,
      new Date(), // Actualizar updatedAt
    );

    // Guardar los cambios
    return await this.userRepository.update(updatedUser);
  }
}
