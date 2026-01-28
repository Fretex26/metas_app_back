import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { GetAuthMeUseCase } from './application/use-cases/get-auth-me.use-case';
import { UsersModule } from '../users/users.module';
import { SponsorsModule } from '../sponsors/sponsors.module';

/**
 * Módulo de autenticación.
 * - GET /auth/me: user + sponsor para redirección en frontend.
 */
@Module({
  imports: [UsersModule, SponsorsModule],
  controllers: [AuthController],
  providers: [GetAuthMeUseCase],
})
export class AuthModule {}
