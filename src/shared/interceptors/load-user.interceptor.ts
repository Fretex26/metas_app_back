import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { IUserRepository } from '../../modules/users/domain/repositories/user.repository';

/**
 * Interceptor para cargar el usuario completo desde la base de datos
 * y adjuntarlo al request para que el RolesGuard funcione correctamente
 * 
 * Este interceptor debe ejecutarse después del FirebaseAuthGuard
 */
@Injectable()
export class LoadUserInterceptor implements NestInterceptor {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;

    if (userPayload && userPayload.uid) {
      try {
        // Cargar el usuario desde la base de datos
        const user = await this.userRepository.findByFirebaseUid(
          userPayload.uid,
        );

        if (user) {
          // Adjuntar información adicional al request
          request.user = {
            ...userPayload,
            userId: user.id,
            role: user.role,
            email: user.email || userPayload.email,
          };
        }
      } catch (error) {
        // Si hay un error, continuar con el request sin cargar el usuario
        // El RolesGuard lanzará un error si es necesario
        console.error('Error loading user:', error);
      }
    }

    return next.handle();
  }
}
