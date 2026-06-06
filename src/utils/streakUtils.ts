import { format, subDays, startOfWeek, addDays } from 'date-fns'
import type { HabitFrequency } from '../types/habit'

export function getWeekCells(completions: string[], frequency: HabitFrequency, customDays?: number[]): { day: string, applicable: boolean, completed: boolean, isToday: boolean }[] {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  
  // Get Monday of current week (date-fns startOfWeek defaults to Sunday, so we use { weekStartsOn: 1 })
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  
  return days.map((day, i) => {
    const date = addDays(monday, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dow = date.getDay() // Sun=0, Mon=1, ...
    
    let applicable = true
    if (frequency === 'weekdays') applicable = dow >= 1 && dow <= 5
    if (frequency === 'custom') applicable = (customDays ?? []).includes(dow)
    
    return {
      day,
      applicable,
      completed: completions.includes(dateStr),
      isToday: dateStr === todayStr
    }
  })
}

export function getCurrentStreak(completions: string[]): number {
  if (completions.length === 0) return 0
  
  let streak = 0
  
  // Check if completed today. If not, check if completed yesterday to continue streak.
  // If neither, streak is 0.
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  
  if (!completions.includes(todayStr) && !completions.includes(yesterdayStr)) {
    return 0
  }

  // Start checking from the most recent completion
  let currentCheck = completions.includes(todayStr) ? new Date() : subDays(new Date(), 1)

  while (true) {
    const dateStr = format(currentCheck, 'yyyy-MM-dd')
    if (completions.includes(dateStr)) {
      streak++
      currentCheck = subDays(currentCheck, 1)
    } else {
      break
    }
  }
  
  return streak
}

export function getBestStreak(completions: string[]): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort()
  let best = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) { 
      current++; 
      best = Math.max(best, current) 
    }
    else if (diff > 1) {
      current = 1
    }
  }
  return best
}

export function getGoalProgress(completions: string[], targetDays: number): number {
  if (!targetDays) return 0
  return Math.min(completions.length / targetDays, 1)
}

export function getStreakMessage(streak: number): string | null {
  if (streak === 3) return '🔥 ¡3 días seguidos!'
  if (streak === 7) return '⚡ ¡Una semana completa!'
  if (streak === 14) return '💪 ¡Dos semanas!'
  if (streak === 30) return '🏆 ¡30 días — legendario!'
  return null
}
