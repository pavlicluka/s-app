import { X } from 'lucide-react'

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function DetailModal({ isOpen, onClose, title, children }: DetailModalProps) {
  if (!isOpen) return null

  console.log('DetailModal: Opening modal with title:', title)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          console.log('DetailModal: Backdrop clicked - closing modal')
          onClose()
        }}
      />
      
      {/* Modal */}
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10">
          <h2 className="text-h3 text-text-primary font-semibold">{title}</h2>
          <button
            onClick={() => {
              console.log('DetailModal: X button clicked - closing modal')
              onClose()
            }}
            className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150 hover:shadow-glow-sm"
            aria-label="Zapri"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
