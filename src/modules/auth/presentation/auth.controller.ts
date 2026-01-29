import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../shared/guards/firebase-auth.guard';
import { SponsorStatusGuard } from '../../../shared/guards/sponsor-status.guard';
import { SponsorStatusExempt } from '../../../shared/decorators/sponsor-status.decorators';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/decorators/current-user.decorator';
import { GetAuthMeUseCase } from '../application/use-cases/get-auth-me.use-case';
import { AuthMeResponseDto } from '../application/dto/auth-me-response.dto';

/**
 * Controlador de autenticación.
 * GET /auth/me: user + sponsor para redirección en frontend.
 */
@ApiTags('auth')
@Controller('auth')
@UseGuards(FirebaseAuthGuard, SponsorStatusGuard)
@ApiBearerAuth('JWT-auth')
export class AuthController {
  constructor(private readonly getAuthMeUseCase: GetAuthMeUseCase) {}

  @Get('me')
  @SponsorStatusExempt()
  @ApiOperation({
    summary: 'Obtener usuario y sponsor actual',
    description:
      'Devuelve user y sponsor (si aplica) para que el frontend decida a qué portal redirigir (user, sponsor, admin, espera, acceso denegado).',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario y opcionalmente sponsor',
    type: AuthMeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async me(@CurrentUser() user: UserPayload): Promise<AuthMeResponseDto> {
    return this.getAuthMeUseCase.execute(user.uid);
  }
}
