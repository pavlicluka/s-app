import AddModal from './AddModal'

const supportTicketManagementFields = [
  { key: 'ticket_id', label: 'Zahtevek za podporo', type: 'text' as const, required: true },
  { key: 'subject', label: 'Zadeva', type: 'text' as const, required: true },
  { key: 'description', label: 'Opis', type: 'textarea' as const, required: true },
  { key: 'priority', label: 'Prioriteta', type: 'select' as const, required: true, options: [
    'low',
    'medium',
    'high',
    'urgent'
  ]},
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open',
    'in_progress',
    'waiting_for_customer',
    'resolved',
    'closed'
  ]},
  { key: 'category', label: 'Kategorija', type: 'select' as const, options: [
    'technical_issue',
    'access_request',
    'password_reset',
    'software_install',
    'hardware_issue',
    'network_problem',
    'security_incident',
    'compliance_question',
    'training_request',
    'other'
  ]},
  { key: 'assigned_to', label: 'Dodeljeno', type: 'text' as const },
  { key: 'requester_name', label: 'Ime zahtevnika', type: 'text' as const, required: true },
  { key: 'requester_email', label: 'Email zahtevnika', type: 'text' as const, required: true },
  { key: 'resolved_date', label: 'Datum rešitve', type: 'datetime' as const },
  { key: 'resolution_notes', label: 'Opombe o rešitvi', type: 'textarea' as const },
  { key: 'satisfaction_rating', label: 'Ocena zadovoljstva (1-5)', type: 'number' as const }
]

interface SupportTicketManagementAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function SupportTicketManagementAddModal({ isOpen, onClose, onSave }: SupportTicketManagementAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov zahtevek"
      table="support_ticket_management"
      fields={supportTicketManagementFields}
    />
  )
}