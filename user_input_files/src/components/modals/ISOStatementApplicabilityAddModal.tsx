import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoStatementApplicabilityFields = [
  { key: 'soa_id', label: 'ID izjave', type: 'text' as const, required: true },
  { key: 'control_reference', label: 'Referenca kontrole', type: 'text' as const, required: true },
  { key: 'control_title', label: 'Naziv kontrole', type: 'text' as const, required: true },
  { key: 'applicability', label: 'Uporabnost', type: 'select' as const, required: true, options: [
    'applicable',
    'not_applicable',
    'partially_applicable'
  ]},
  { key: 'justification', label: 'Utemeljitev', type: 'textarea' as const, required: true },
  { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, options: [
    'implemented',
    'partially_implemented',
    'not_implemented',
    'planned'
  ]},
  { key: 'version', label: 'Verzija', type: 'text' as const },
  { key: 'effective_date', label: 'Datum uveljavitve', type: 'date' as const },
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
]

interface ISOStatementApplicabilityAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOStatementApplicabilityAddModal({ isOpen, onClose, onSave }: ISOStatementApplicabilityAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo izjavo o uporabnosti"
      table="iso_statement_applicability"
      fields={[
        ...isoStatementApplicabilityFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}