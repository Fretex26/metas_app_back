import { Injectable, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/types/enums';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo usuario
 */
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso para crear un usuario
   * @param createUserDto - Datos del usuario a crear
   * @returns Usuario creado
   * @throws ConflictException si el email o Firebase UID ya existe
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const emailExists = await this.userRepository.existsByEmail(
      createUserDto.email,
    );
    if (emailExists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el Firebase UID ya existe
    const firebaseUidExists = await this.userRepository.existsByFirebaseUid(
      createUserDto.firebaseUid,
    );
    if (firebaseUidExists) {
      throw new ConflictException('El usuario ya está registrado');
    }

    // Crear la entidad de dominio
    const user = new User(
      uuidv4(),
      createUserDto.name,
      createUserDto.email.toLowerCase(),
      createUserDto.firebaseUid,
      createUserDto.role || UserRole.USER,
      new Date(),
      new Date(),
    );

    // Guardar en el repositorio
    return await this.userRepository.create(user);
  }
}
