import React, { useState } from 'react'
import { Plus, LayoutGrid } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { HabitCard } from '../components/habits/HabitCard'
import { HabitForm } from '../components/habits/HabitForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useHabitStore } from '../store/habitStore'
import { EmptyState } from '../components/ui/EmptyState'
import type { Habit } from '../types/habit'

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const HabitsPage: React.FC = () => {
  const { habits, habitOrder, reorderHabits } = useHabitStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleOpenModal = () => {
    setEditingHabit(null)
    setIsModalOpen(true)
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
  }

  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    habits.forEach(h => (h.tags ?? []).forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [habits])

  const orderedHabits = React.useMemo(() => {
    const habitMap = new Map(habits.map(h => [h.id, h]))
    const sorted = habitOrder
      .map(id => habitMap.get(id))
      .filter((h): h is Habit => !!h)
    
    const remaining = habits.filter(h => !habitOrder.includes(h.id))
    return [...sorted, ...remaining]
  }, [habits, habitOrder])

  const filteredHabits = selectedTag 
    ? orderedHabits.filter(h => (h.tags ?? []).includes(selectedTag))
    : orderedHabits

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = habitOrder.indexOf(active.id as string)
      const newIndex = habitOrder.indexOf(over.id as string)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderHabits(arrayMove(habitOrder, oldIndex, newIndex))
      }
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Mis Hábitos" 
        showDate={false}
        action={
          <Button onClick={handleOpenModal} className="rounded-full shadow-lg shadow-accent/20">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Hábito
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

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <EmptyState 
            icon={LayoutGrid}
            title="Tu lista está vacía"
            description="Crea hábitos que quieras mantener. El secreto del éxito está en tu rutina diaria."
            action={
              <Button onClick={handleOpenModal}>
                Crear mi primer hábito
              </Button>
            }
          />
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredHabits.map(h => h.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {filteredHabits.map(habit => (
                <SortableHabitItem key={habit.id} habit={habit} onEdit={handleEditHabit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
        title={editingHabit ? "Editar Hábito" : "Crear Hábito"}
      >
        <HabitForm onClose={() => setIsModalOpen(false)} initialData={editingHabit || undefined} />
      </Modal>
    </div>
  )
}

const SortableHabitItem: React.FC<{ habit: Habit, onEdit: (habit: Habit) => void }> = ({ habit, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <HabitCard 
        habit={habit} 
        onEdit={onEdit} 
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
    </div>
  )
}
