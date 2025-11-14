import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDeleting?: boolean
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isDeleting = false
}: DeleteConfirmModalProps) {
  const { t } = useTranslation()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-h3 text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-body text-text-secondary mb-6">{message}</p>
          
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="h-10 px-4 bg-bg-near-black hover:bg-bg-surface text-text-primary rounded-sm transition-colors duration-150"
            >
              {t('modals.deleteConfirm.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-10 px-4 bg-status-error hover:bg-status-error/80 text-white rounded-sm transition-colors duration-150 disabled:opacity-50"
            >
              {isDeleting ? t('forms.deleting') : t('modals.deleteConfirm.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
