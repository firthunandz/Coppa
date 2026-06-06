// TaskForm.tsx
import React, { useState } from 'react'
import { useTaskStore } from '../../store/taskStore'
import type { Priority, Task } from '../../types/task'
import { Button } from '../ui/Button'
import { getTodayStr } from '../../utils/dateUtils'
import { TagInput } from '../ui/TagInput'
import { ConfirmationModal } from '../ui/ConfirmationModal'

interface TaskFormProps {
  onClose: () => void
  initialData?: Task
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, initialData }) => {
  const { addTask, updateTask, deleteTask } = useTaskStore()
  const isEditing = !!initialData
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [dueDate, setDueDate] = useState(initialData?.dueDate || getTodayStr())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData = {
      title,
      priority,
      tags,
      dueDate: dueDate || undefined
    }

    if (isEditing && initialData) {
      updateTask(initialData.id, taskData)
    } else {
      addTask(taskData)
    }
    
    onClose()
  }

  const handleDelete = () => {
    if (initialData) {
      deleteTask(initialData.id)
      onClose()
    }
  }

  return (
    <>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            Título de la tarea
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comprar fruta, Enviar email..."
            className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
              Fecha límite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <TagInput tags={tags} onChange={setTags} />

        <div className="space-y-3 pt-2">
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-[2]">
              {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
          </div>
          {isEditing && (
            <Button 
              type="button" 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)} 
              className="w-full bg-transparent border border-danger/20 hover:bg-danger/10"
            >
              Eliminar Tarea
            </Button>
          )}
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar tarea?"
        description={`¿Estás seguro que querés eliminar la tarea "${title}"? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
