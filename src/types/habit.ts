// src/types/habit.ts
export type HabitFrequency = 'goal' | 'daily' | 'weekdays' | 'custom'

export interface Habit {
  id: string
  name: string
  emoji: string
  tags: string[]
  frequency: HabitFrequency
  customDays?: number[]      // for 'custom' frequency
  goal?: {
    targetDays: number
    startDate: string
  }
  completions: string[]        // ISO date strings: "2025-06-01"
  createdAt: string
}

export type CreateHabitInput = Omit<Habit, 'id' | 'completions' | 'createdAt'>
