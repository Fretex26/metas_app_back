import { Global, Module } from '@nestjs/common';
import { SponsorStatusGuard } from './guards/sponsor-status.guard';
import { UsersModule } from '../modules/users/users.module';
import { SponsorsModule } from '../modules/sponsors/sponsors.module';

/**
 * Módulo global que provee SponsorStatusGuard.
 * Importa Users y Sponsors para resolver las dependencias del guard.
 * Al ser global, cualquier módulo puede usar el guard sin importar este módulo.
 */
@Global()
@Module({
  imports: [UsersModule, SponsorsModule],
  providers: [SponsorStatusGuard],
  exports: [SponsorStatusGuard],
})
export class SponsorStatusGuardModule {}
