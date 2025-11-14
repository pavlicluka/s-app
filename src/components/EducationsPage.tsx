import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Plus } from 'lucide-react'
import Modal from './common/Modal'

export default function EducationsPage() {
  const { t } = useTranslation()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('educations.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('educations.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="w-12 h-12 text-accent-primary" />
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('educations.addModule')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Training Modules', 'Certifications', 'Resources'].map((title) => (
          <div key={title} className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
            <h3 className="text-heading-md font-semibold text-text-primary mb-4">{title}</h3>
            <p className="text-body-sm text-text-secondary">
              {title} za izobraževanje zaposlenih.
            </p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Dodaj novo izobraževanje"
      >
        <div className="space-y-4">
          <p className="text-body text-text-secondary">
            Tukaj boste lahko dodali novo izobraževalno vsebino ali modul.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-body text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              Prekliči
            </button>
            <button
              onClick={() => setShowAddModal(false)}
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
