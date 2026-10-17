import { daysBetween, type LocalDate } from './dates';

export const BACKUP_EVERY_DAYS = 14;

/**
 * Lembrar de backup: os dados só existem no celular, e limpar o navegador apaga tudo.
 * Só depois de uma semana de uso (antes disso há pouco a perder) e no máximo a cada 14 dias.
 */
export function needsBackup(today: LocalDate, start: LocalDate, lastBackup: LocalDate | null, snoozeUntil: LocalDate | null): boolean {
  if (daysBetween(start, today) < 7) return false;
  if (snoozeUntil && today < snoozeUntil) return false;
  return !lastBackup || daysBetween(lastBackup, today) >= BACKUP_EVERY_DAYS;
}
