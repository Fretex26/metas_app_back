import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario autenticado desde el request
 * 
 * El usuario se adjunta al request por el FirebaseAuthGuard
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: UserPayload) {
 *   return this.userService.getProfile(user.uid);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Tipo para el payload del usuario autenticado
 * Contiene el uid de Firebase y el usuario de la base de datos
 */
export interface UserPayload {
  uid: string;
  userId?: string;
  email?: string;
  role?: string;
}
