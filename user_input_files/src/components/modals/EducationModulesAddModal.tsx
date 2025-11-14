import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const EducationModulesAddModal = ({ isOpen, onClose, onSave }: EducationModulesAddModalProps) => {
  const { t } = useTranslation()

  const educationModulesFields = [
    { key: 'module_id', label: t('modals.add.common.moduleId'), type: 'text' as const, required: true },
    { key: 'module_name', label: t('modals.add.common.moduleName'), type: 'text' as const, required: true },
    { key: 'category', label: t('modals.add.common.category'), type: 'select' as const, required: true, options: [
      'security_awareness',
      'gdpr_compliance',
      'iso_27001',
      'nis2_directive',
      'data_protection',
      'incident_response',
      'risk_management',
      'business_continuity',
      'physical_security',
      'technical_training'
    ]},
    { key: 'duration_minutes', label: t('modals.add.common.duration'), type: 'number' as const },
    { key: 'description', label: t('modals.add.common.description'), type: 'textarea' as const, required: true },
    { key: 'learning_objectives', label: t('modals.add.common.learningObjectives'), type: 'textarea' as const },
    { key: 'content_url', label: t('modals.add.common.contentUrl'), type: 'text' as const },
    { key: 'mandatory', label: t('modals.add.common.isRequired'), type: 'select' as const, options: ['true', 'false'] },
    { key: 'completion_rate', label: t('modals.add.common.completionRate'), type: 'number' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.education.title')}
      table="education_modules"
      fields={educationModulesFields}
    />
  )
}

interface EducationModulesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default EducationModulesAddModal