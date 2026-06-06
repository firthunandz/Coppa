import { format, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE, d 'de' MMMM", { locale: es })
}

export function getRelativeDateLabel(date: string): string {
  const d = parseISO(date)
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  if (isTomorrow(d)) return 'Mañana'
  return format(d, "d 'de' MMM", { locale: es })
}

export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
