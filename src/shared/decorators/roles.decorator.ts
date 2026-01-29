import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/enums';

/**
 * Clave para el metadata de roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar los roles requeridos para acceder a un endpoint
 *
 * @param roles - Roles permitidos para acceder al endpoint
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @Roles(UserRole.ADMIN)
 * async adminEndpoint() {
 *   return 'Only admins can access this';
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
