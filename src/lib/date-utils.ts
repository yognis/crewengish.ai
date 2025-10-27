import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Formats a date to Turkish short format (e.g., "15 Oca")
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'd MMM', { locale: tr });
}

/**
 * Formats a date to Turkish long format (e.g., "15 Ocak 2024")
 */
export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'd MMMM yyyy', { locale: tr });
}

/**
 * Formats a date to relative time (e.g., "2 gün önce")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Bugün';
  if (diffInDays === 1) return 'Dün';
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
  return `${Math.floor(diffInDays / 365)} yıl önce`;
}

/**
 * Formats a date for chart display (e.g., "15 Oca")
 */
export function formatChartDate(date: Date | string): string {
  return formatShortDate(date);
}
