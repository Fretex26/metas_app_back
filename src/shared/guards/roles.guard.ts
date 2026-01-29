import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { IUserRepository } from '../../modules/users/domain/repositories/user.repository';

/**
 * Guard para verificar que el usuario tenga los roles requeridos
 *
 * Este guard debe usarse junto con el FirebaseAuthGuard y requiere
 * que el usuario esté en la base de datos con su rol
 *
 * @example
 * ```typescript
 * @UseGuards(FirebaseAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * async adminEndpoint() {
 *   return 'Only admins can access this';
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se especifican roles, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario en el request, el FirebaseAuthGuard debería haberlo rechazado
    if (!user) {
      console.error(
        'RolesGuard: request.user es undefined. Verifica que FirebaseAuthGuard se ejecute antes.',
      );
      console.error('Headers:', request.headers);
      throw new UnauthorizedException(
        'Usuario no autenticado. El token de autenticación no es válido o no se proporcionó.',
      );
    }

    // Verificar que al menos tenga uid
    if (!user.uid) {
      console.error('RolesGuard: request.user no tiene uid. Usuario:', user);
      throw new UnauthorizedException(
        'Usuario no autenticado. Información del usuario incompleta.',
      );
    }

    // Si el usuario no tiene el role cargado, cargarlo desde la base de datos
    if (!user.role && user.uid) {
      try {
        const dbUser = await this.userRepository.findByFirebaseUid(user.uid);
        if (dbUser) {
          // Actualizar el request.user con el role
          request.user = {
            ...user,
            userId: dbUser.id,
            role: dbUser.role,
            email: dbUser.email || user.email,
          };
        } else {
          // Usuario no encontrado en la base de datos
          throw new UnauthorizedException(
            'Usuario no encontrado en la base de datos',
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        console.error('Error loading user in RolesGuard:', error);
        throw new UnauthorizedException('Error al cargar el usuario');
      }
    }

    // Verificar que el usuario tenga uno de los roles requeridos
    const hasRequiredRole = requiredRoles.some(
      (role) => request.user.role === role,
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}. Rol actual: ${request.user.role || 'no definido'}`,
      );
    }

    return true;
  }
}
