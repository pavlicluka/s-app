import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const GDPRDataProtectionAddModal = ({ isOpen, onClose, onSave }: GDPRDataProtectionAddModalProps) => {
  const { t } = useTranslation()

  const gdprDataProtectionFields = [
    { key: 'data_type', label: t('modals.add.common.dataType'), type: 'text' as const, required: true },
    { key: 'processing_purpose', label: t('modals.add.common.processingPurpose'), type: 'textarea' as const, required: true },
    { key: 'legal_basis', label: t('modals.add.common.legalBasis'), type: 'select' as const, required: true, options: [
      'consent',
      'contract',
      'legal_obligation',
      'vital_interests',
      'public_task',
      'legitimate_interests'
    ]},
    { key: 'data_retention_period', label: t('modals.add.common.dataRetentionPeriod'), type: 'text' as const },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, options: [
      'active',
      'inactive',
      'under_review',
      'archived'
    ]}
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.gdprDataProtection.title')}
      table="gdpr_data_protection"
      fields={gdprDataProtectionFields}
    />
  )
}

interface GDPRDataProtectionAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default GDPRDataProtectionAddModal