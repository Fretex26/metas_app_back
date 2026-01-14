import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
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
      return false;
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
          return false;
        }
      } catch (error) {
        console.error('Error loading user in RolesGuard:', error);
        return false;
      }
    }

    // Verificar que el usuario tenga uno de los roles requeridos
    return requiredRoles.some((role) => request.user.role === role);
  }
}
