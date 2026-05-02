import { BadRequestException } from '@nestjs/common';

/**
 * Parsea YYYY-MM-DD sin interpretación de zona horaria ambigua.
 */
export function parseDateYmd(dateYmd: string): { y: number; m: number; d: number } {
  const trimmed = dateYmd.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) {
    throw new BadRequestException('Formato de fecha inválido; use YYYY-MM-DD');
  }
  const y = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (month < 1 || month > 12 || d < 1 || d > 31) {
    throw new BadRequestException('Fecha civil inválida');
  }
  return { y, m: month, d };
}

/**
 * Rango UTC de [start, end] para `createdAt` tal que corresponde al día civil
 * `dateYmd` en el dispositivo del usuario.
 *
 * [timeZoneOffsetMinutes] coincide con `DateTime.timeZoneOffset.inMinutes` en Dart:
 * positivo si la hora local va por delante de UTC.
 */
export function getCreatedAtBoundsForCalendarDay(
  dateYmd: string,
  timeZoneOffsetMinutes: number,
): { start: Date; end: Date } {
  const { y, m, d } = parseDateYmd(dateYmd);
  const offsetMs = timeZoneOffsetMinutes * 60 * 1000;
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - offsetMs);
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - offsetMs);
  return { start, end };
}

/** Fecha civil actual en UTC (fallback si el cliente no envía localDate). */
export function utcYmdFromDate(now: Date): string {
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}
