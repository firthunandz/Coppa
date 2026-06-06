import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Habit, CreateHabitInput } from '../types/habit'

interface HabitStore {
  habits: Habit[]
  habitOrder: string[]
  addHabit: (data: CreateHabitInput) => void
  updateHabit: (id: string, data: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (id: string, date: string) => void
  reorderHabits: (ids: string[]) => void
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      habitOrder: [],
      addHabit: (data) => set((s) => {
        const id = crypto.randomUUID()
        return {
          habits: [...s.habits, { ...data, id, completions: [], createdAt: new Date().toISOString() }],
          habitOrder: [...s.habitOrder, id]
        }
      }),
      updateHabit: (id, data) => set((s) => ({
        habits: s.habits.map((h) => h.id === id ? { ...h, ...data } : h)
      })),
      deleteHabit: (id) => set((s) => ({
        habits: s.habits.filter((h) => h.id !== id),
        habitOrder: s.habitOrder.filter((hId) => hId !== id)
      })),
      toggleCompletion: (id, date) => set((s) => ({
        habits: s.habits.map((h) => {
          if (h.id !== id) return h
          const has = h.completions.includes(date)
          return { ...h, completions: has ? h.completions.filter((d) => d !== date) : [...h.completions, date] }
        })
      })),
      reorderHabits: (ids) => set({ habitOrder: ids }),
    }),
    { 
      name: 'coppa-habits',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.habits = (state.habits || []).map((h: any) => ({
            ...h,
            tags: Array.isArray(h.tags) ? h.tags : [],
            frequency: h.frequency || 'daily'
          }))
        }
      }
    }
  )
)
