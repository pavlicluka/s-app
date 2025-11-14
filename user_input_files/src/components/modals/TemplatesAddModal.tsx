import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const TemplatesAddModal = ({ isOpen, onClose, onSave }: TemplatesAddModalProps) => {
  const { t } = useTranslation()

  const templatesFields = [
    { key: 'template_id', label: t('modals.add.common.templateId'), type: 'text' as const, required: true },
    { key: 'template_name', label: t('modals.add.common.templateName'), type: 'text' as const, required: true },
    { key: 'template_type', label: t('modals.add.common.templateType'), type: 'select' as const, required: true, options: [
      'form',
      'report',
      'checklist',
      'contract',
      'other'
    ]},
    { key: 'category', label: t('modals.add.common.category'), type: 'text' as const, required: true },
    { key: 'version', label: t('modals.add.common.version'), type: 'text' as const, required: true },
    { key: 'content', label: t('modals.add.common.content'), type: 'textarea' as const, required: false },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, options: [
      'draft',
      'approved',
      'active',
      'archived'
    ]}
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.template.title')}
      table="templates"
      fields={templatesFields}
    />
  )
}

interface TemplatesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default TemplatesAddModal