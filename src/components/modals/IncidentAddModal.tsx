import AddModal from './AddModal'

const incidentFields = [
  { key: 'incident_id', label: 'ID incidenta', type: 'text' as const, required: true },
  { key: 'type', label: 'Tip incidenta', type: 'text' as const, required: true },
  { key: 'estimated_damage', label: 'Ocenjena škoda', type: 'select' as const, options: [
    'Low',
    'Medium',
    'High'
  ]},
  { key: 'detected_at', label: 'Datum zaznave', type: 'datetime' as const, required: true },
  { key: 'resolved_at', label: 'Datum rešitve', type: 'datetime' as const },
  { key: 'nis2_required', label: 'Obvezno po NIS2', type: 'select' as const, options: ['true', 'false'] },
  { key: 'control_manager', label: 'Upravljalec kontrole (UUID)', type: 'text' as const },
  { key: 'report_date', label: 'Datum poročila', type: 'datetime' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open',
    'investigating',
    'resolved'
  ]}
]

interface IncidentAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function IncidentAddModal({ isOpen, onClose, onSave }: IncidentAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov incident"
      table="incidents"
      fields={incidentFields}
    />
  )
}