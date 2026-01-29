import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminProvider } from '../../config/firebase-admin.provider';

/**
 * Guard para validar tokens de Firebase Authentication
 *
 * Este guard valida el token JWT de Firebase presente en el header Authorization
 * y adjunta la información del usuario al request
 *
 * @example
 * ```typescript
 * @UseGuards(FirebaseAuthGuard)
 * @Get('protected')
 * async protectedEndpoint() {
 *   return 'This endpoint requires authentication';
 * }
 * ```
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseAdmin: FirebaseAdminProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log(
      'FirebaseAuthGuard: Verificando autenticación para',
      request.url,
    );
    console.log(
      'FirebaseAuthGuard: Authorization header presente:',
      !!authHeader,
    );

    if (!authHeader) {
      throw new UnauthorizedException('Falta el header de autorización');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Formato de header de autorización inválido',
      );
    }

    try {
      // Verificar el token con Firebase Admin SDK
      const auth = this.firebaseAdmin.getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      console.log(
        'FirebaseAuthGuard: Token válido para usuario:',
        decodedToken.uid,
      );

      // Adjuntar información del usuario al request
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Aquí se pueden agregar más campos del token si es necesario
      };

      console.log('FirebaseAuthGuard: request.user establecido:', {
        uid: request.user.uid,
        email: request.user.email,
      });

      return true;
    } catch (error) {
      console.error('FirebaseAuthGuard: Error al verificar token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
