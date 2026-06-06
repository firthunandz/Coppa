// src/types/task.ts
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  priority: Priority
  tags: string[]
  completed: boolean
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export type CreateTaskInput = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>
