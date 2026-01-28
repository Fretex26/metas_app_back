import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { IUserRepository } from '../../modules/users/domain/repositories/user.repository';
import type { ISponsorRepository } from '../../modules/sponsors/domain/repositories/sponsor.repository';
import { UserRole, SponsorStatus } from '../types/enums';
import {
  SKIP_SPONSOR_STATUS_KEY,
  SPONSOR_STATUS_EXEMPT_KEY,
} from '../decorators/sponsor-status.decorators';

const MSG_PENDING =
  'Tu cuenta de patrocinador está pendiente de aprobación. No puedes acceder al portal todavía.';
const MSG_REVOKED =
  'Tu acceso como patrocinador ha sido revocado. Contacta al administrador.';
const MSG_NO_SPONSOR =
  'No se encontró perfil de patrocinador. Solo usuarios con rol sponsor pueden realizar esta acción.';

/**
 * Guard que verifica el estado del sponsor:
 * - REJECTED / DISABLED: 403 en todas las rutas (salvo exentas, que sí pueden usar para ver estado).
 * - PENDING: solo rutas exentas; en el resto, 403.
 * - APPROVED: acceso normal.
 *
 * Debe ejecutarse tras FirebaseAuthGuard (request.user.uid presente).
 * No depende de LoadUserInterceptor; obtiene user/sponsor desde los repositorios.
 */
@Injectable()
export class SponsorStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_SPONSOR_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return true;

    const exempt = this.reflector.getAllAndOverride<boolean>(
      SPONSOR_STATUS_EXEMPT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const uid = request.user?.uid;
    if (!uid) return false;

    const user = await this.userRepository.findByFirebaseUid(uid);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado en el sistema');
    }

    if (user.role !== UserRole.SPONSOR) return true;

    const sponsor = await this.sponsorRepository.findByUserId(user.id);
    if (!sponsor) return true; // Flujo creación POST /sponsors: aún no tiene perfil sponsor

    if (sponsor.status === SponsorStatus.APPROVED) return true;
    if (exempt) return true;

    if (
      sponsor.status === SponsorStatus.REJECTED ||
      sponsor.status === SponsorStatus.DISABLED
    ) {
      throw new ForbiddenException(MSG_REVOKED);
    }
    if (sponsor.status === SponsorStatus.PENDING) {
      throw new ForbiddenException(MSG_PENDING);
    }

    throw new ForbiddenException(MSG_NO_SPONSOR);
  }
}
