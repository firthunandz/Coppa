import React, { useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  variant = 'danger'
}) => {
  const [isLoading, setIsLoading] = useState(false)

  // Reset loading state when modal opens/closes
  useEffect(() => {
    if (!isOpen) setIsLoading(false)
  }, [isOpen])

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirmation failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={isLoading ? () => {} : onClose} 
      title={title}
    >
      <div className="space-y-8">
        <div className="flex items-center gap-4 bg-bg-tertiary/30 p-4 rounded-2xl border border-border/50">
          <div className={`p-3 rounded-xl flex-shrink-0 ${variant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-2xl"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-2xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
