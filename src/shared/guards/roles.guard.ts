import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

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
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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

    // Verificar que el usuario tenga uno de los roles requeridos
    // Nota: Esto asume que el rol del usuario está en user.role
    // Se debe cargar desde la base de datos en un interceptor o middleware
    return requiredRoles.some((role) => user.role === role);
  }
}
