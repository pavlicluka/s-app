import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoComplianceTrackingFields = [
  { key: 'compliance_id', label: 'ID skladnosti', type: 'text' as const, required: true },
  { key: 'requirement_name', label: 'Naziv zahteve', type: 'text' as const, required: true },
  { key: 'standard_reference', label: 'Referenca standarda', type: 'text' as const, required: true },
  { key: 'compliance_status', label: 'Status skladnosti', type: 'select' as const, options: [
    'compliant',
    'partially_compliant',
    'non_compliant',
    'under_review',
    'not_applicable'
  ]},
  { key: 'last_assessment_date', label: 'Datum zadnjega pregleda', type: 'date' as const },
  { key: 'next_review_date', label: 'Datum naslednjega pregleda', type: 'date' as const },
  { key: 'evidence', label: 'Dokazila', type: 'textarea' as const },
  { key: 'gaps_identified', label: 'Ugotovljene vrzeli', type: 'textarea' as const },
  { key: 'action_plan', label: 'Akcijski načrt', type: 'textarea' as const }
]

interface ISOComplianceTrackingAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOComplianceTrackingAddModal({ isOpen, onClose, onSave }: ISOComplianceTrackingAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo skladnost"
      table="iso_compliance_tracking"
      fields={[
        ...isoComplianceTrackingFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}