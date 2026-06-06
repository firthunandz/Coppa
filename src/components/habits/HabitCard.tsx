import React from 'react'
import { Check, Pencil, GripVertical, Circle } from 'lucide-react'
import type { Habit } from '../../types/habit'
import { useHabitStore } from '../../store/habitStore'
import { getCurrentStreak, getGoalProgress, getWeekCells } from '../../utils/streakUtils'
import { getTodayStr } from '../../utils/dateUtils'
import { StreakBadge } from './StreakBadge'
import { ProgressBar } from './ProgressBar'
import { Button } from '../ui/Button'

interface HabitCardProps {
  habit: Habit
  isTodayView?: boolean
  onEdit?: (habit: Habit) => void
  dragHandleProps?: any
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isTodayView = false, onEdit, dragHandleProps }) => {
  const { toggleCompletion } = useHabitStore()
  const todayStr = getTodayStr()
  const isCompletedToday = habit.completions.includes(todayStr)
  const streak = getCurrentStreak(habit.completions)
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleCompletion(habit.id, todayStr)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) onEdit(habit)
  }

  const getFrequencyLabel = () => {
    if (habit.frequency === 'daily' || !habit.frequency) return 'Todos los días'
    if (habit.frequency === 'weekdays') return 'Lun – Vie'
    if (habit.frequency === 'goal') return `Meta: ${habit.goal?.targetDays} días`
    if (habit.frequency === 'custom' && habit.customDays) {
      const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
      return habit.customDays
        .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
        .map(d => dayNames[d])
        .join(' · ')
    }
    return ''
  }

  const weekCells = getWeekCells(habit.completions, habit.frequency, habit.customDays)

  return (
    <div className={`
      relative group px-6 py-4 rounded-3xl border transition-all duration-300 flex flex-col
      ${isTodayView ? 'w-full' : 'h-full justify-between'}
      ${isCompletedToday 
        ? 'bg-bg-tertiary/50 border-accent' 
        : 'bg-bg-secondary border-border hover:border-border/80 hover:bg-bg-tertiary/30'
      }
    `}>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isTodayView && (
              <div 
                {...dragHandleProps} 
                className="hidden md:flex text-text-muted/30 hover:text-text-muted cursor-grab active:cursor-grabbing p-1 -ml-2"
              >
                <GripVertical className="w-5 h-5" />
              </div>
            )}
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
              ${isCompletedToday ? 'bg-accent/20' : 'bg-bg-tertiary'}
            `}>
              {habit.emoji}
            </div>
            <div>
              <h3 className={`text-lg font-display font-semibold transition-colors ${
                isCompletedToday ? 'text-text-primary/60 line-through' : 'text-text-primary'
              }`}>
                {habit.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted">{getFrequencyLabel()}</span>
                {!isTodayView && streak >= 2 && <StreakBadge streak={streak} />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isTodayView && habit.frequency === 'goal' && <StreakBadge streak={streak} />}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEdit}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent hover:bg-accent/10 transition-opacity"
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {!isTodayView && (
              <button
                onClick={handleToggle}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isCompletedToday 
                    ? 'bg-success text-white shadow-lg shadow-success/20' 
                    : 'bg-bg-tertiary text-text-muted hover:text-accent hover:border-accent border border-border'
                  }
                `}
              >
                {isCompletedToday ? <Check className="w-4 h-4 stroke-[3px]" /> : <Circle className="w-4 h-4" />}
              </button>
            )}

            {isTodayView && (
              <button
                onClick={handleToggle}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompletedToday 
                    ? 'bg-success text-white scale-110 shadow-lg shadow-success/20' 
                    : 'bg-bg-tertiary text-text-muted hover:text-text-primary border border-border'
                  }
                `}
              >
                <Check className={`w-5 h-5 ${isCompletedToday ? 'stroke-[3px]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {(habit.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(habit.tags ?? []).map(tag => (
              <span 
                key={tag} 
                className="bg-bg-tertiary text-text-muted text-xs px-2 py-0.5 rounded-full border border-border/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isTodayView && (
        <div className="mt-2">
          {habit.frequency === 'goal' ? (
            <ProgressBar 
              progress={getGoalProgress(habit.completions, habit.goal?.targetDays || 1)} 
              label={`${habit.completions.length} / ${habit.goal?.targetDays || 1} días`}
              showTextInside
            />
          ) : (
            <div className="flex gap-1 mt-3 justify-center">
              {weekCells.map((cell, i) => (
                <div 
                  key={i}
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all
                    ${!cell.applicable 
                      ? 'bg-bg-tertiary/30 text-text-muted/20' 
                      : cell.completed 
                        ? 'bg-accent text-white' 
                        : 'bg-bg-tertiary text-text-muted'
                    }
                    ${cell.isToday ? 'ring-1 ring-accent ring-offset-2 ring-offset-bg-secondary' : ''}
                  `}
                >
                  {cell.day}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
