import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import Modal from './common/Modal'

export default function ProceduresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Procedures & Policies
          </h1>
          <p className="text-body text-text-secondary">
            Dokumentacija postopkov in politik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="w-12 h-12 text-accent-primary" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">Nov dokument</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Procedures', 'Policies', 'Templates'].map((title) => (
          <div key={title} className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
            <h3 className="text-heading-md font-semibold text-text-primary mb-4">{title}</h3>
            <p className="text-body-sm text-text-secondary">
              Dostop do {title.toLowerCase()} dokumentov.
            </p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dodaj nov dokument"
      >
        <div className="space-y-4">
          <p className="text-body text-text-secondary">
            Tukaj boste lahko dodali nov postopek ali politiko.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-body text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              Prekliči
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150"
            >
              Shrani
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
