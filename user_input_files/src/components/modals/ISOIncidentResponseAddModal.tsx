import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoIncidentResponseFields = [
  { key: 'incident_id', label: 'ID incidenta', type: 'text' as const, required: true },
  { key: 'incident_type', label: 'Tip incidenta', type: 'select' as const, required: true, options: [
    'malware',
    'phishing',
    'data_breach',
    'unauthorized_access',
    'ddos',
    'social_engineering',
    'insider_threat',
    'physical_security',
    'system_failure',
    'other'
  ]},
  { key: 'detection_date', label: 'Datum zaznave', type: 'datetime' as const, required: true },
  { key: 'severity', label: 'Resnost', type: 'select' as const, required: true, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'description', label: 'Opis incidenta', type: 'textarea' as const, required: true },
  { key: 'affected_systems', label: 'Prizadeti sistemi', type: 'textarea' as const },
  { key: 'response_actions', label: 'Ukrepi odziva', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open',
    'investigating',
    'contained',
    'resolved',
    'closed'
  ]},
  { key: 'closed_date', label: 'Datum zaprtja', type: 'datetime' as const },
  { key: 'lessons_learned', label: 'Pridobljene izkušnje', type: 'textarea' as const }
]

interface ISOIncidentResponseAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOIncidentResponseAddModal({ isOpen, onClose, onSave }: ISOIncidentResponseAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov incident"
      table="iso_incident_response"
      fields={[
        ...isoIncidentResponseFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}