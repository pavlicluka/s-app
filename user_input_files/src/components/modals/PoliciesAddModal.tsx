import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const PoliciesAddModal = ({ isOpen, onClose, onSave }: PoliciesAddModalProps) => {
  const { t } = useTranslation()

  const policiesFields = [
    { key: 'policy_id', label: t('modals.add.common.policyId'), type: 'text' as const, required: true },
    { key: 'policy_name', label: t('modals.add.common.policyName'), type: 'text' as const, required: true },
    { key: 'category', label: t('modals.add.common.category'), type: 'text' as const, required: true },
    { key: 'version', label: t('modals.add.common.version'), type: 'text' as const, required: true },
    { key: 'content', label: t('modals.add.common.content'), type: 'textarea' as const, required: false },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, options: [
      'draft',
      'under_review',
      'approved',
      'active',
      'superseded',
      'expired'
    ]},
    { key: 'approved_by', label: t('modals.add.common.approvedBy'), type: 'text' as const },
    { key: 'approval_date', label: t('modals.add.common.approvalDate'), type: 'date' as const },
    { key: 'review_date', label: t('modals.add.common.reviewDate'), type: 'date' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.policy.title')}
      table="policies"
      fields={policiesFields}
    />
  )
}

interface PoliciesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default PoliciesAddModal