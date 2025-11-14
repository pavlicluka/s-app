import AddModal from './AddModal'

// GDPR Right Forgotten Fields
const gdprRightForgottenFields = [
  { key: 'request_id', label: 'Zahtevek za podporo', type: 'text' as const, required: true },
  { key: 'data_subject_name', label: 'Ime nosilca podatkov', type: 'text' as const, required: true },
  { key: 'data_subject_email', label: 'Email nosilca podatkov', type: 'text' as const, required: true },
  { key: 'request_date', label: 'Datum zahtevka', type: 'datetime' as const, required: true },
  { key: 'data_categories', label: 'Kategorije podatkov', type: 'textarea' as const, required: true },
  { key: 'legal_basis', label: 'Pravna podlaga', type: 'select' as const, required: true, options: [
    'withdrawal_of_consent', 'objection_to_processing', 'unlawful_processing', 'legal_obligation'
  ]},
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'pending', 'in_progress', 'completed', 'rejected', 'partially_completed'
  ]},
  { key: 'completion_date', label: 'Datum dokončanja', type: 'datetime' as const },
  { key: 'notes', label: 'Opombe', type: 'textarea' as const }
]

// ZVOP2 Compliance Fields
const zvop2ComplianceFields = [
  { key: 'compliance_id', label: 'ID skladnosti', type: 'text' as const, required: true },
  { key: 'obligation_type', label: 'Tip obveznosti', type: 'select' as const, required: true, options: [
    'notification', 'consent', 'purpose_limitation', 'data_minimization', 'storage_limitation'
  ]},
  { key: 'organization_name', label: 'Naziv organizacije', type: 'text' as const, required: true },
  { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, required: true, options: [
    'implemented', 'partially_implemented', 'not_implemented', 'not_applicable'
  ]},
  { key: 'legal_reference', label: 'Pravna referenca', type: 'text' as const, required: true },
  { key: 'implementation_details', label: 'Podrobnosti implementacije', type: 'textarea' as const },
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const },
  { key: 'next_review', label: 'Naslednji pregled', type: 'date' as const }
]

// Support Requests Fields
const supportRequestsFields = [
  { key: 'request_id', label: 'Zahtevek za podporo', type: 'text' as const, required: true },
  { key: 'requester_name', label: 'Ime zahtevnika', type: 'text' as const, required: true },
  { key: 'requester_email', label: 'Email zahtevnika', type: 'text' as const, required: true },
  { key: 'request_type', label: 'Tip zahtevka', type: 'select' as const, required: true, options: [
    'technical_support', 'access_request', 'compliance_question', 'training', 'general_inquiry'
  ]},
  { key: 'subject', label: 'Zadeva', type: 'text' as const, required: true },
  { key: 'description', label: 'Opis', type: 'textarea' as const, required: true },
  { key: 'priority', label: 'Prioriteta', type: 'select' as const, required: true, options: [
    'low', 'medium', 'high', 'urgent'
  ]},
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open', 'in_progress', 'waiting_for_response', 'resolved', 'closed'
  ]},
  { key: 'assigned_to', label: 'Dodeljeno', type: 'text' as const },
  { key: 'created_date', label: 'Datum ustvaritve', type: 'datetime' as const },
  { key: 'resolution_notes', label: 'Opombe o rešitvi', type: 'textarea' as const }
]

// Settings Advanced Config Fields
const settingsAdvancedConfigFields = [
  { key: 'config_key', label: 'Ključ konfiguracije', type: 'text' as const, required: true },
  { key: 'config_value', label: 'Vrednost konfiguracije', type: 'textarea' as const, required: true },
  { key: 'description', label: 'Opis', type: 'textarea' as const },
  { key: 'category', label: 'Kategorija', type: 'select' as const, required: true, options: [
    'security', 'compliance', 'notifications', 'integrations', 'performance', 'backup'
  ]},
  { key: 'data_type', label: 'Tip podatkov', type: 'select' as const, required: true, options: [
    'string', 'number', 'boolean', 'json', 'encrypted'
  ]},
  { key: 'is_sensitive', label: 'Občutljivi podatki', type: 'select' as const, options: ['true', 'false'] },
  { key: 'last_modified', label: 'Zadnja sprememba', type: 'datetime' as const },
  { key: 'modified_by', label: 'Spremenil', type: 'text' as const }
]

interface GDPRRightForgottenAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRRightForgottenAddModal({ isOpen, onClose, onSave }: GDPRRightForgottenAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo pravico do pozabe"
      table="gdpr_right_forgotten"
      fields={gdprRightForgottenFields}
    />
  )
}

interface ZVOP2ComplianceAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ZVOP2ComplianceAddModal({ isOpen, onClose, onSave }: ZVOP2ComplianceAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo ZVOP2 skladnost"
      table="zvop_2_compliance"
      fields={zvop2ComplianceFields}
    />
  )
}

interface SupportRequestsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function SupportRequestsAddModal({ isOpen, onClose, onSave }: SupportRequestsAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo podporo zahtevo"
      table="support_requests"
      fields={supportRequestsFields}
    />
  )
}

interface SettingsAdvancedConfigAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function SettingsAdvancedConfigAddModal({ isOpen, onClose, onSave }: SettingsAdvancedConfigAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo napredno konfiguracijo"
      table="settings_advanced_config"
      fields={settingsAdvancedConfigFields}
    />
  )
}