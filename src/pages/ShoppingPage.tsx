import React, { useState } from 'react'
import { GripVertical, Plus, ShoppingCart, Pencil, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { ShoppingForm } from '../components/shopping/ShoppingForm'
import { Modal } from '../components/ui/Modal'
import { ConfirmationModal } from '../components/ui/ConfirmationModal'
import { Button } from '../components/ui/Button'
import { useShoppingStore } from '../store/shoppingStore'
import { EmptyState } from '../components/ui/EmptyState'
import type { ShoppingItem } from '../types/shopping'
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

export const ShoppingPage: React.FC = () => {
  const { items, toggleChecked, clearChecked, reorderItems } = useShoppingStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    items.forEach(i => (i.tags ?? []).forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [items])

  const filteredItems = selectedTag 
    ? items.filter(i => (i.tags ?? []).includes(selectedTag))
    : items

  const uncheckedItems = filteredItems.filter(i => !i.checked)
  const checkedItems = filteredItems.filter(i => i.checked)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        reorderItems(newItems.map(i => i.id))
      }
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Lista de compras" 
        showDate={false}
        action={
          <Button onClick={handleOpenModal} className="rounded-full shadow-lg shadow-accent/20">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Artículo
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

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <EmptyState 
            icon={ShoppingCart}
            title="Tu lista está vacía"
            description="Agrega los artículos que necesitas comprar. Mantén todo organizado en un solo lugar."
            action={
              <Button onClick={handleOpenModal}>
                Agregar mi primer artículo
              </Button>
            }
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Unchecked Items */}
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={uncheckedItems.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {uncheckedItems.map(item => (
                  <SortableShoppingItem 
                    key={item.id} 
                    item={item} 
                    onToggle={toggleChecked} 
                    onEdit={handleEditItem} 
                  />
                ))}
                {uncheckedItems.length === 0 && items.length > 0 && selectedTag && (
                  <p className="text-center py-8 text-text-muted text-sm italic">No hay artículos pendientes con esta etiqueta.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
                  Ya comprado ({checkedItems.length})
                </h3>
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-danger/70 hover:text-danger font-medium transition-colors"
                >
                  Limpiar comprados
                </button>
              </div>
              
              <div className="space-y-2">
                {checkedItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-4 bg-bg-tertiary/20 p-3 rounded-xl border border-border/50 opacity-60"
                  >
                    <button 
                      onClick={() => toggleChecked(item.id)}
                      className="text-success"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-text-primary text-sm line-through">{item.name}</span>
                    </div>

                    <button 
                      onClick={() => handleEditItem(item)}
                      className="p-1.5 text-text-muted hover:text-accent"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        title={editingItem ? "Editar Artículo" : "Nuevo Artículo"}
      >
        <ShoppingForm onClose={() => setIsModalOpen(false)} initialData={editingItem || undefined} />
      </Modal>

      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearChecked}
        title="¿Limpiar lista?"
        description="Se eliminarán todos los artículos marcados como comprados. Esta acción no se puede deshacer."
      />
    </div>
  )
}

const SortableShoppingItem: React.FC<{ 
  item: ShoppingItem, 
  onToggle: (id: string) => void, 
  onEdit: (item: ShoppingItem) => void 
}> = ({ item, onToggle, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="group flex items-center gap-4 bg-bg-secondary p-4 rounded-2xl border border-border hover:border-border/80 transition-all"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-text-muted/30 hover:text-text-muted cursor-grab active:cursor-grabbing p-1 -ml-2"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <button 
        onClick={() => onToggle(item.id)}
        className="text-text-muted hover:text-accent transition-colors"
      >
        <Circle className="w-6 h-6" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary font-medium">{item.name}</span>
          {item.quantity && (
            <span className="px-2 py-0.5 bg-bg-tertiary text-text-muted text-[10px] font-bold uppercase rounded-md border border-border">
              {item.quantity}
            </span>
          )}
        </div>
        {(item.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-bg-tertiary text-text-muted text-xs px-1.5 py-0.5 rounded-full border border-border/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={() => onEdit(item)}
        className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  )
}
