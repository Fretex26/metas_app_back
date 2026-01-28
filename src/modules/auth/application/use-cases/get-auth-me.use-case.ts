import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import type { ISponsorRepository } from '../../../sponsors/domain/repositories/sponsor.repository';
import { UserRole } from '../../../../shared/types/enums';
import type { AuthMeResponseDto } from '../dto/auth-me-response.dto';

/**
 * Caso de uso para obtener user + sponsor (auth/me).
 * Usado por el frontend para decidir redirección (portal usuario, sponsor, admin, espera, acceso denegado).
 */
@Injectable()
export class GetAuthMeUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISponsorRepository')
    private readonly sponsorRepository: ISponsorRepository,
  ) {}

  async execute(firebaseUid: string): Promise<AuthMeResponseDto> {
    const user = await this.userRepository.findByFirebaseUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userDto: AuthMeResponseDto['user'] = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };

    let sponsor: AuthMeResponseDto['sponsor'] = null;
    if (user.role === UserRole.SPONSOR) {
      const s = await this.sponsorRepository.findByUserId(user.id);
      if (s) {
        sponsor = {
          id: s.id,
          status: s.status,
          businessName: s.businessName,
        };
      }
    }

    return { user: userDto, sponsor };
  }
}
