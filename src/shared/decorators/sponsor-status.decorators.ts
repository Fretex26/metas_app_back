import { SetMetadata } from '@nestjs/common';

/**
 * Clave para omitir el SponsorStatusGuard (ej. registro POST /users).
 */
export const SKIP_SPONSOR_STATUS_KEY = 'skipSponsorStatus';

/**
 * Clave para marcar rutas exentas (accesibles por sponsor PENDING/REJECTED/DISABLED para ver estado).
 */
export const SPONSOR_STATUS_EXEMPT_KEY = 'sponsorStatusExempt';

/**
 * Omite la verificación del SponsorStatusGuard.
 * Usar en rutas como POST /users (registro), donde el usuario aún no existe en BD.
 *
 * @example
 * @Post()
 * @SkipSponsorStatusGuard()
 * async register() { ... }
 */
export const SkipSponsorStatusGuard = () =>
  SetMetadata(SKIP_SPONSOR_STATUS_KEY, true);

/**
 * Marca la ruta como exenta: sponsors PENDING, REJECTED o DISABLED pueden acceder
 * (para ver perfil, estado, auth/me). El resto de rutas les devuelve 403.
 *
 * @example
 * @Get('profile')
 * @SponsorStatusExempt()
 * async getProfile() { ... }
 */
export const SponsorStatusExempt = () =>
  SetMetadata(SPONSOR_STATUS_EXEMPT_KEY, true);
