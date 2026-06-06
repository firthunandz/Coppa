import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, CreateTaskInput } from '../types/task'

interface TaskStore {
  tasks: Task[]
  addTask: (data: CreateTaskInput) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (data) => set((s) => ({
        tasks: [...s.tasks, { ...data, id: crypto.randomUUID(), completed: false, createdAt: new Date().toISOString() }]
      })),
      updateTask: (id, data) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== id) return t
          const completed = !t.completed
          return { 
            ...t, 
            completed, 
            completedAt: completed ? new Date().toISOString() : undefined 
          }
        })
      })),
    }),
    { 
      name: 'coppa-tasks',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tasks = (state.tasks || []).map((t: any) => ({
            ...t,
            tags: Array.isArray(t.tags) ? t.tags : []
          }))
        }
      }
    }
  )
)
