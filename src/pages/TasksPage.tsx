import React, { useState } from 'react'
import { Plus, ListTodo } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useTaskStore } from '../store/taskStore'
import { getTodayStr } from '../utils/dateUtils'
import { EmptyState } from '../components/ui/EmptyState'
import type { Task, Priority } from '../types/task'

type SortType = 'priority' | 'dueDate'

export const TasksPage: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [sortBy, setSortBy] = useState<SortType>('priority')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  
  const todayStr = getTodayStr()

  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    tasks.forEach(t => (t.tags ?? []).forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [tasks])

  const filteredTasks = selectedTag 
    ? tasks.filter(t => (t.tags ?? []).includes(selectedTag))
    : tasks

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
    })
  }

  const todayTasks = sortTasks(filteredTasks.filter(t => !t.completed && t.dueDate === todayStr))
  const upcomingTasks = sortTasks(filteredTasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > todayStr)))
  const overdueTasks = sortTasks(filteredTasks.filter(t => !t.completed && (t.dueDate && t.dueDate < todayStr)))
  const completedTasks = sortTasks(filteredTasks.filter(t => t.completed))

  const handleOpenModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const renderTaskSection = (title: string, taskList: Task[], variant: 'danger' | 'primary' | 'muted' = 'primary') => {
    if (taskList.length === 0) return null
    
    return (
      <div className="mb-10">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 px-1 ${
          variant === 'danger' ? 'text-danger' : variant === 'muted' ? 'text-text-muted' : 'text-accent'
        }`}>
          {title} ({taskList.length})
        </h3>
        <div className="space-y-3">
          {taskList.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Mis Tareas" 
        showDate={false}
        action={
          <Button onClick={handleOpenModal} className="rounded-full shadow-lg shadow-accent/20">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Tarea
          </Button>
        }
      />

      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedTag === null 
                ? 'bg-accent text-white' 
                : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
            }`}
          >
            Todas
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag 
                  ? 'bg-accent text-white' 
                  : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setSortBy('priority')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              sortBy === 'priority' 
                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-transparent border-border text-text-muted hover:text-text-primary'
            }`}
          >
            Prioridad
          </button>
          <button
            onClick={() => setSortBy('dueDate')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              sortBy === 'dueDate' 
                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-transparent border-border text-text-muted hover:text-text-primary'
            }`}
          >
            Fecha límite
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <EmptyState 
            icon={ListTodo}
            title="Nada pendiente"
            description="Organiza tu día agregando tareas. Divide tus grandes metas en pasos pequeños."
            action={
              <Button onClick={handleOpenModal}>
                Agregar mi primera tarea
              </Button>
            }
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {renderTaskSection('Atrasadas', overdueTasks, 'danger')}
          {renderTaskSection('Para Hoy', todayTasks)}
          {renderTaskSection('Próximas', upcomingTasks)}
          {renderTaskSection('Completadas', completedTasks, 'muted')}
        </div>
      )}

      {/* FAB for Mobile */}
      <button
        onClick={handleOpenModal}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl shadow-accent/40 active:scale-90 transition-transform z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTask ? "Editar Tarea" : "Nueva Tarea"}
      >
        <TaskForm onClose={() => setIsModalOpen(false)} initialData={editingTask || undefined} />
      </Modal>
    </div>
  )
}
