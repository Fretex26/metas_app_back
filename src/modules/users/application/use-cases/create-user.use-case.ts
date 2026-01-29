import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { ICategoryRepository } from '../../../categories/domain/repositories/category.repository';
import { Category } from '../../../categories/domain/entities/category.entity';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/types/enums';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de uso para crear un nuevo usuario
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  /**
   * Ejecuta el caso de uso para crear un usuario
   * @param createUserDto - Datos del usuario a crear
   * @returns Usuario creado
   * @throws ConflictException si el email o Firebase UID ya existe
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Validar que firebaseUid esté presente (debe venir del token)
    if (!createUserDto.firebaseUid) {
      throw new BadRequestException(
        'El Firebase UID es requerido y debe obtenerse del token de autenticación',
      );
    }

    // No permitir autoregistro como admin por el flujo público
    if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'No se puede registrar como administrador por este medio',
      );
    }

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

    // Validar y obtener categorías si se proporcionan
    let categories: Category[] = [];
    if (createUserDto.categoryIds && createUserDto.categoryIds.length > 0) {
      categories = await this.categoryRepository.findByIds(
        createUserDto.categoryIds,
      );
      if (categories.length !== createUserDto.categoryIds.length) {
        throw new BadRequestException(
          'Una o más categorías especificadas no existen',
        );
      }
    }

    // Crear la entidad de dominio
    const user = new User(
      uuidv4(),
      createUserDto.name,
      createUserDto.email.toLowerCase(),
      createUserDto.firebaseUid,
      createUserDto.role || UserRole.USER,
      categories,
      new Date(),
      new Date(),
    );

    // Guardar en el repositorio
    return await this.userRepository.create(user);
  }
}
