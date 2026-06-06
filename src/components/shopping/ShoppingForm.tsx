// ShoppingForm.tsx
import React, { useState } from 'react'
import { useShoppingStore } from '../../store/shoppingStore'
import type { ShoppingItem } from '../../types/shopping'
import { Button } from '../ui/Button'
import { TagInput } from '../ui/TagInput'
import { ConfirmationModal } from '../ui/ConfirmationModal'

interface ShoppingFormProps {
  onClose: () => void
  initialData?: ShoppingItem
}

export const ShoppingForm: React.FC<ShoppingFormProps> = ({ onClose, initialData }) => {
  const { addItem, updateItem, deleteItem } = useShoppingStore()
  const isEditing = !!initialData
  
  const [name, setName] = useState(initialData?.name || '')
  const [quantity, setQuantity] = useState(initialData?.quantity || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const itemData = {
      name,
      quantity,
      tags,
    }

    if (isEditing && initialData) {
      updateItem(initialData.id, itemData)
    } else {
      addItem(itemData)
    }
    
    onClose()
  }

  const handleDelete = () => {
    if (initialData) {
      deleteItem(initialData.id)
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
            Nombre del artículo
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pan, Leche, Tornillos..."
            className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            Cantidad / Notas
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ej: 2, 1kg, un par"
            className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <TagInput tags={tags} onChange={setTags} />

        <div className="space-y-3 pt-2">
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-[2]">
              {isEditing ? 'Guardar Cambios' : 'Agregar a la lista'}
            </Button>
          </div>
          {isEditing && (
            <Button 
              type="button" 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)} 
              className="w-full bg-transparent border border-danger/20 hover:bg-danger/10"
            >
              Eliminar Artículo
            </Button>
          )}
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar artículo?"
        description={`¿Estás seguro que querés eliminar "${name}" de tu lista? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
