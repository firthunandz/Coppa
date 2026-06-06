import React, { useState } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { HabitCard } from '../components/habits/HabitCard'
import { TaskCard } from '../components/tasks/TaskCard'
import { useHabitStore } from '../store/habitStore'
import { useTaskStore } from '../store/taskStore'
import { useSettingsStore } from '../store/settingsStore'
import { getTodayStr, formatDate } from '../utils/dateUtils'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { HabitForm } from '../components/habits/HabitForm'
import { TaskForm } from '../components/tasks/TaskForm'
import { ProgressBar } from '../components/habits/ProgressBar'
import type { Habit } from '../types/habit'
import type { Task } from '../types/task'

export const TodayPage: React.FC = () => {
  const habits = useHabitStore((s) => s.habits)
  const tasks = useTaskStore((s) => s.tasks)
  const userName = useSettingsStore((s) => s.userName)
  const todayStr = getTodayStr()
  
  const currentDay = new Date().getDay()
  const habitsToday = habits.filter(h => {
    if (h.frequency === 'daily' || h.frequency === 'goal' || !h.frequency) return true
    if (h.frequency === 'weekdays') return currentDay >= 1 && currentDay <= 5
    if (h.frequency === 'custom') return (h.customDays ?? []).includes(currentDay)
    return false
  })

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const activeHabits = habitsToday.filter(h => !h.completions.includes(todayStr))
  const completedHabitsToday = habitsToday.filter(h => h.completions.includes(todayStr))
  
  const tasksToday = tasks.filter(t => !t.completed && (t.dueDate === todayStr || t.dueDate < todayStr))
  const completedTasksToday = tasks.filter(t => t.completed && t.completedAt?.startsWith(todayStr))

  const total = habitsToday.length + tasksToday.length + completedTasksToday.length
  const completed = completedHabitsToday.length + completedTasksToday.length
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const isEverythingDone = total > 0 && completed === total
  const hasCompletionsToday = completedHabitsToday.length > 0 || completedTasksToday.length > 0

  return (
    <div className="animate-in fade-in duration-500">
      <section className="mb-10 bg-bg-secondary p-6 md:p-8 rounded-[32px] border border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-1">
              Buenos días{userName ? `, ${userName}` : ''} 👋
            </h1>
            <p className="text-text-muted capitalize">
              {formatDate(new Date())}
            </p>
          </div>
        </div>

        <div>
          <ProgressBar 
            progress={progressPercent / 100} 
            className="h-3 bg-bg-tertiary"
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {total > 0 
                ? `${completed} de ${total} completadas hoy`
                : 'No tenés nada pendiente para hoy 🎉'}
            </span>
            {total > 0 && (
              <span className="font-bold text-accent">{progressPercent}%</span>
            )}
          </div>
        </div>
      </section>

      {isEverythingDone && total > 0 && (
        <div className="mb-10 p-8 rounded-[40px] bg-gradient-to-br from-accent/20 to-success/10 border border-accent/20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4 shadow-xl shadow-accent/40 animate-bounce">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">¡Todo completado por hoy!</h2>
          <p className="text-text-muted max-w-xs">Has cumplido con todos tus objetivos. ¡Tómate un descanso, te lo mereces!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-text-primary">Hábitos de hoy</h2>
            {habitsToday.length > 0 && (
              <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">
                {completedHabitsToday.length} / {habitsToday.length}
              </span>
            )}
          </div>

          {completedHabitsToday.length === habitsToday.length && habitsToday.length > 0 && (
            <div className="mb-4 p-4 rounded-2xl bg-accent/10 border border-accent/30 text-center animate-in zoom-in-95 duration-300">
              <p className="text-accent font-display text-lg">¡Todos los hábitos del día completados! 🎉</p>
              <p className="text-text-muted text-sm mt-1">Seguí así, cada día cuenta.</p>
            </div>
          )}
          
          {activeHabits.length === 0 && !isEverythingDone ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-bg-secondary/30 rounded-3xl border border-dashed border-border">
              <p className="text-sm text-text-muted">No hay más hábitos para hoy.</p>
            </div>
          ) : activeHabits.length === 0 && habits.length === 0 ? (
            <EmptyState 
              icon={Sparkles}
              title="No hay hábitos aún"
              description="Empieza creando tu primer hábito para ver tu progreso diario."
            />
          ) : (
            <div className="space-y-4">
              {activeHabits.map(habit => (
                <HabitCard key={habit.id} habit={habit} isTodayView onEdit={setEditingHabit} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-text-primary">Tareas pendientes</h2>
            {tasksToday.length > 0 && (
              <span className="text-xs font-bold text-danger px-3 py-1 bg-danger/10 rounded-full">
                {tasksToday.length}
              </span>
            )}
          </div>

          {tasksToday.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-bg-secondary/30 rounded-3xl border border-dashed border-border">
              <CheckCircle2 className="w-10 h-10 text-success mb-3 opacity-50" />
              <p className="text-sm text-text-muted">No tienes tareas para hoy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksToday.map(task => (
                <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
              ))}
            </div>
          )}
        </section>
      </div>

      {hasCompletionsToday && (
        <section className="mt-16 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-display font-bold text-text-primary mb-6">Completadas hoy</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {completedHabitsToday.map(habit => (
                <HabitCard key={habit.id} habit={habit} isTodayView onEdit={setEditingHabit} />
              ))}
            </div>
            <div className="space-y-3">
              {completedTasksToday.map(task => (
                <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Modal 
        isOpen={!!editingHabit} 
        onClose={() => setEditingHabit(null)} 
        title="Editar Hábito"
      >
        {editingHabit && <HabitForm onClose={() => setEditingHabit(null)} initialData={editingHabit} />}
      </Modal>

      <Modal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        title="Editar Tarea"
      >
        {editingTask && <TaskForm onClose={() => setEditingTask(null)} initialData={editingTask} />}
      </Modal>
    </div>
  )
}
