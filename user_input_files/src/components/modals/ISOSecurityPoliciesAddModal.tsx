import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoSecurityPoliciesFields = [
  { key: 'policy_id', label: 'ID politike', type: 'text' as const, required: true },
  { key: 'policy_name', label: 'Naziv politike', type: 'text' as const, required: true },
  { key: 'policy_type', label: 'Tip politike', type: 'select' as const, required: true, options: [
    'information_security_policy',
    'access_control_policy',
    'data_protection_policy',
    'incident_response_policy',
    'business_continuity_policy',
    'risk_management_policy',
    'acceptable_use_policy',
    'remote_work_policy',
    'third_party_policy',
    'physical_security_policy'
  ]},
  { key: 'version', label: 'Verzija', type: 'text' as const, required: true },
  { key: 'effective_date', label: 'Datum uveljavitve', type: 'date' as const, required: true },
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const },
  { key: 'content', label: 'Vsebina', type: 'textarea' as const, required: true },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'draft',
    'under_review',
    'approved',
    'active',
    'superseded',
    'retired'
  ]},
  { key: 'approved_by', label: 'Odobril', type: 'text' as const }
]

interface ISOSecurityPoliciesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOSecurityPoliciesAddModal({ isOpen, onClose, onSave }: ISOSecurityPoliciesAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo varnostno politiko"
      table="iso_security_policies"
      fields={[
        ...isoSecurityPoliciesFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}