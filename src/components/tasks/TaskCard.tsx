import React from 'react'
import { Check, Pencil, Calendar } from 'lucide-react'
import type { Task, Priority } from '../../types/task'
import { useTaskStore } from '../../store/taskStore'
import { getRelativeDateLabel, getTodayStr } from '../../utils/dateUtils'
import { Button } from '../ui/Button'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTask } = useTaskStore()
  const todayStr = getTodayStr()
  const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed

  const priorityColors: Record<Priority, string> = {
    high: 'bg-danger',
    medium: 'bg-accent',
    low: 'bg-success',
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) onEdit(task)
  }

  return (
    <div className={`
      group flex items-center gap-3 p-4 rounded-2xl border transition-all
      ${task.completed 
        ? 'bg-bg-tertiary/20 border-border/50 opacity-60' 
        : 'bg-bg-secondary border-border hover:border-border/80 shadow-sm'
      }
    `}>
      <button
        onClick={() => toggleTask(task.id)}
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
          ${task.completed 
            ? 'bg-success border-success text-white' 
            : 'border-border text-transparent hover:border-accent'
          }
        `}
      >
        <Check className="w-3 h-3 stroke-[4px]" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
          <h4 className={`text-sm font-medium transition-all truncate ${
            task.completed ? 'line-through text-text-muted' : 'text-text-primary'
          }`}>
            {task.title}
          </h4>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${isOverdue ? 'text-danger' : 'text-text-muted'}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{getRelativeDateLabel(task.dueDate)}</span>
              </div>
            )}

            {(task.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-bg-tertiary text-text-muted text-[10px] px-1.5 py-0.5 rounded-full border border-border/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEdit}
            className="md:opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent hover:bg-accent/10 transition-opacity h-8 w-8"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
