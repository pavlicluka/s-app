import AddModal from './AddModal'

const proceduresDocumentsFields = [
  { key: 'document_id', label: 'ID dokumenta', type: 'text' as const, required: true },
  { key: 'document_name', label: 'Naziv dokumenta', type: 'text' as const, required: true },
  { key: 'document_type', label: 'Tip dokumenta', type: 'select' as const, required: true, options: [
    'procedure',
    'policy',
    'guideline',
    'standard',
    'checklist',
    'template',
    'workflow',
    'process_map'
  ]},
  { key: 'category', label: 'Kategorija', type: 'select' as const, required: true, options: [
    'security',
    'privacy',
    'compliance',
    'operations',
    'business_continuity',
    'risk_management',
    'incident_response',
    'data_protection',
    'access_control',
    'audit'
  ]},
  { key: 'version', label: 'Verzija', type: 'text' as const, required: true },
  { key: 'content', label: 'Vsebina', type: 'textarea' as const, required: true },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'draft',
    'under_review',
    'approved',
    'active',
    'superseded',
    'retired'
  ]},
  { key: 'approved_by', label: 'Odobril', type: 'text' as const },
  { key: 'approval_date', label: 'Datum odobritve', type: 'date' as const },
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
]

interface ProceduresDocumentsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ProceduresDocumentsAddModal({ isOpen, onClose, onSave }: ProceduresDocumentsAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov dokument"
      table="procedures_documents"
      fields={proceduresDocumentsFields}
    />
  )
}