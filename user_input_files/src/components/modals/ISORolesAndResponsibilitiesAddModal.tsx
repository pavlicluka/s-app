import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoRolesAndResponsibilitiesFields = [
  { key: 'role_name', label: 'Naziv vloge', type: 'text' as const, required: true },
  { key: 'role_purpose', label: 'Namembnost vloge', type: 'textarea' as const, required: true },
  { key: 'key_responsibilities', label: 'Ključne odgovornosti', type: 'textarea' as const, required: true },
  { key: 'authorities', label: 'Pooblastila', type: 'textarea' as const, required: true },
  { key: 'reporting_lines', label: 'Hierarhija poročanja', type: 'textarea' as const, required: true },
  { key: 'required_competencies', label: 'Zahtevane kompetence', type: 'textarea' as const, required: true },
  { key: 'required_training', label: 'Zahtevano usposabljanje', type: 'textarea' as const, required: true },
  { key: 'completed_training', label: 'Opravljeno usposabljanje', type: 'textarea' as const },
  { key: 'relevant_processes', label: 'Ustrezni procesi', type: 'textarea' as const, required: true },
  { key: 'related_controls', label: 'Povezane kontrole', type: 'textarea' as const, required: true },
  { key: 'related_risks', label: 'Povezana tveganja', type: 'textarea' as const },
  { key: 'performance_indicators', label: 'Kazalniki uspešnosti', type: 'textarea' as const, required: true },
  { key: 'kpi_targets', label: 'Cilji KPI', type: 'textarea' as const },
  { key: 'person_assigned', label: 'Dodeljena oseba', type: 'text' as const, required: true },
  { key: 'appointment_date', label: 'Datum imenovanja', type: 'date' as const, required: true },
  { key: 'validity_start', label: 'Začetek veljavnosti', type: 'date' as const, required: true },
  { key: 'validity_end', label: 'Konec veljavnosti', type: 'date' as const, required: true },
  { key: 'document_version', label: 'Verzija dokumenta', type: 'text' as const },
  { key: 'document_owner', label: 'Lastnik dokumenta', type: 'text' as const },
  { key: 'communication_plan', label: 'Komunikacijski načrt', type: 'textarea' as const },
  { key: 'stakeholder_notification', label: 'Obveščanje stakeholderjem', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'active',
    'inactive',
    'pending'
  ]},
  { key: 'notes', label: 'Opombe', type: 'textarea' as const }
]

interface ISORolesAndResponsibilitiesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISORolesAndResponsibilitiesAddModal({ isOpen, onClose, onSave }: ISORolesAndResponsibilitiesAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo vlogo"
      table="iso_roles_responsibilities"
      fields={[
        ...isoRolesAndResponsibilitiesFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ 
        organization_id: organizationId,
        status: 'active'
      }}
    />
  )
}
