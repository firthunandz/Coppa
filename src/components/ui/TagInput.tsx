import React, { useState, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { useHabitStore } from '../../store/habitStore'
import { useTaskStore } from '../../store/taskStore'
import { useShoppingStore } from '../../store/shoppingStore'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  label?: string
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, label = 'Etiquetas' }) => {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const habits = useHabitStore(s => s.habits)
  const tasks = useTaskStore(s => s.tasks)
  const shopping = useShoppingStore(s => s.items)

  const existingTags = React.useMemo(() => {
    const allTags = new Set<string>()
    habits.forEach(h => (h.tags ?? []).forEach(t => allTags.add(t)))
    tasks.forEach(t => (t.tags ?? []).forEach(tag => allTags.add(tag)))
    shopping.forEach(i => (i.tags ?? []).forEach(t => allTags.add(t)))
    return Array.from(allTags).filter(t => !tags.includes(t))
  }, [habits, tasks, shopping, tags])

  const suggestions = existingTags
    .filter(t => t.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 6)

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (cleanTag && !tags.includes(cleanTag)) {
      onChange([...tags, cleanTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Escribí y presioná Enter o +"
            className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl overflow-hidden z-50">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                  className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  #{s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputValue.trim() && addTag(inputValue)}
          title="Agregar etiqueta"
          className="px-4 bg-bg-tertiary border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-bg-tertiary text-text-muted text-xs px-2.5 py-1 rounded-full border border-border/30"
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i) }}
                className="hover:text-accent transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
