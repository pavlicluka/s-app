import AddModal from './AddModal'

// GDPR Audit Trail Fields
const gdprAuditTrailFields = [
  { key: 'action_type', label: 'Tip akcije', type: 'select' as const, required: true, options: [
    'create', 'read', 'update', 'delete', 'export', 'archive'
  ]},
  { key: 'table_affected', label: 'Prizadeta tabela', type: 'text' as const, required: true },
  { key: 'record_id', label: 'ID zapisa', type: 'text' as const },
  { key: 'action_description', label: 'Opis akcije', type: 'textarea' as const, required: true },
  { key: 'data_before', label: 'Podatki pred akcijo', type: 'textarea' as const },
  { key: 'data_after', label: 'Podatki po akciji', type: 'textarea' as const },
  { key: 'ip_address', label: 'IP naslov', type: 'text' as const },
  { key: 'user_agent', label: 'User Agent', type: 'text' as const }
]

// GDPR Data Breach Log Fields
const gdprDataBreachLogFields = [
  { key: 'breach_id', label: 'ID kršitve', type: 'text' as const, required: true },
  { key: 'breach_type', label: 'Tip kršitve', type: 'select' as const, required: true, options: [
    'confidentiality', 'integrity', 'availability', 'unauthorized_access', 'data_loss'
  ]},
  { key: 'discovery_date', label: 'Datum odkritja', type: 'datetime' as const, required: true },
  { key: 'notification_date', label: 'Datum obvestila', type: 'datetime' as const },
  { key: 'affected_individuals', label: 'Število prizadetih', type: 'number' as const },
  { key: 'data_categories', label: 'Kategorije podatkov', type: 'textarea' as const, required: true },
  { key: 'impact_assessment', label: 'Ocenjevanje vpliva', type: 'textarea' as const },
  { key: 'remediation_actions', label: 'Ukepi odprave', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'investigating', 'reported', 'resolved', 'closed'
  ]}
]

// GDPR DPIA Assessment Fields  
const gdprDpiaAssessmentsFields = [
  { key: 'dpia_id', label: 'ID DPIA', type: 'text' as const, required: true },
  { key: 'processing_activity', label: 'Dejavnost obdelave', type: 'text' as const, required: true },
  { key: 'necessity', label: 'Potrebnost', type: 'textarea' as const, required: true },
  { key: 'proportionality', label: 'Sorazmernost', type: 'textarea' as const, required: true },
  { key: 'risks', label: 'Tveganja', type: 'textarea' as const, required: true },
  { key: 'mitigation_measures', label: 'Ukepi za zmanjšanje', type: 'textarea' as const },
  { key: 'consultation_required', label: 'Potrebno posvetovanje', type: 'select' as const, options: ['true', 'false'] },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'draft', 'assessment', 'approved', 'implemented'
  ]},
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
]

// GDPR Privacy Policy Fields
const gdprPrivacyPolicyFields = [
  { key: 'policy_id', label: 'ID politike', type: 'text' as const, required: true },
  { key: 'policy_name', label: 'Naziv politike', type: 'text' as const, required: true },
  { key: 'version', label: 'Verzija', type: 'text' as const, required: true },
  { key: 'effective_date', label: 'Datum uveljavitve', type: 'date' as const, required: true },
  { key: 'content', label: 'Vsebina', type: 'textarea' as const, required: true },
  { key: 'data_controller', label: 'Upravljavec podatkov', type: 'text' as const },
  { key: 'contact_info', label: 'Kontaktni podatki', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'draft', 'published', 'archived'
  ]}
]

// Cyber Reports Fields
const cyberReportsFields = [
  { key: 'report_id', label: 'ID poročila', type: 'text' as const, required: true },
  { key: 'incident_date', label: 'Datum incidenta', type: 'datetime' as const, required: true },
  { key: 'report_type', label: 'Tip poročila', type: 'select' as const, required: true, options: [
    'cyber_incident', 'security_violation', 'data_breach', 'threat_intelligence'
  ]},
  { key: 'severity', label: 'Resnost', type: 'select' as const, required: true, options: [
    'low', 'medium', 'high', 'critical'
  ]},
  { key: 'description', label: 'Opis', type: 'textarea' as const, required: true },
  { key: 'affected_systems', label: 'Prizadeti sistemi', type: 'textarea' as const },
  { key: 'response_actions', label: 'Ukrepi odziva', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'reported', 'investigating', 'contained', 'resolved'
  ]}
]

interface GDPRAuditTrailAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRAuditTrailAddModal({ isOpen, onClose, onSave }: GDPRAuditTrailAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov audit zapis"
      table="gdpr_audit_trail"
      fields={gdprAuditTrailFields}
    />
  )
}

interface GDPRDataBreachLogAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GDPRDataBreachLogAddModal({ isOpen, onClose, onSave }: GDPRDataBreachLogAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo kršitev podatkov"
      table="gdpr_data_breach_log"
      fields={gdprDataBreachLogFields}
    />
  )
}

interface GDPRDPIAAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GDPRDPIAAddModal({ isOpen, onClose, onSave }: GDPRDPIAAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo DPIA ocenjevanje"
      table="gdpr_dpia_assessments"
      fields={gdprDpiaAssessmentsFields}
    />
  )
}

interface GDPRPrivacyPolicyAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GDPRPrivacyPolicyAddModal({ isOpen, onClose, onSave }: GDPRPrivacyPolicyAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo politiko zasebnosti"
      table="gdpr_privacy_policies"
      fields={gdprPrivacyPolicyFields}
    />
  )
}

interface CyberReportsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function CyberReportsAddModal({ isOpen, onClose, onSave }: CyberReportsAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo kibernetsko poročilo"
      table="cyber_reports"
      fields={cyberReportsFields}
    />
  )
}

// GDPR Controller Processor Fields
const gdprControllerProcessorFields = [
  { key: 'entity_name', label: 'Naziv entitete', type: 'text' as const, required: true },
  { key: 'entity_type', label: 'Tip entitete', type: 'select' as const, required: true, options: [
    'Controller', 'Processor', 'Joint Controller', 'Sub-processor'
  ]},
  { key: 'contact_person', label: 'Kontaktna oseba', type: 'text' as const },
  { key: 'contact_email', label: 'Kontaktni email', type: 'text' as const },
  { key: 'contact_phone', label: 'Kontaktni telefon', type: 'text' as const },
  { key: 'role_description', label: 'Opis vloge', type: 'textarea' as const },
  { key: 'agreement_signed', label: 'Pogodba podpisana', type: 'select' as const, options: ['true', 'false'] },
  { key: 'agreement_date', label: 'Datum pogodbe', type: 'date' as const },
  { key: 'data_processing_activities', label: 'Dejavnosti obdelave podatkov', type: 'textarea' as const }
]

interface GDPRControllerProcessorAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GDPRControllerProcessorAddModal({ isOpen, onClose, onSave }: GDPRControllerProcessorAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo entiteto"
      table="gdpr_controller_processor"
      fields={gdprControllerProcessorFields}
    />
  )
}

// GDPR Right to be Forgotten Fields
const gdprRightForgottenFields = [
  { key: 'request_id', label: 'Zahtevek za podporo', type: 'text' as const, required: true },
  { key: 'subject_name', label: 'Ime subjekta', type: 'text' as const, required: true },
  { key: 'subject_email', label: 'Email subjekta', type: 'text' as const, required: true },
  { key: 'request_date', label: 'Datum zahteve', type: 'datetime' as const },
  { key: 'completion_date', label: 'Datum dokončanja', type: 'datetime' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'pending', 'in_progress', 'completed', 'rejected'
  ]},
  { key: 'data_deleted', label: 'Izbrisani podatki', type: 'textarea' as const },
  { key: 'notes', label: 'Opombe', type: 'textarea' as const }
]

interface GDPRRightForgottenAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function GDPRRightForgottenAddModal({ isOpen, onClose, onSave }: GDPRRightForgottenAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo zahtevo za izbris"
      table="gdpr_right_forgotten"
      fields={gdprRightForgottenFields}
    />
  )
}

// ZVOP-2 Compliance Fields
const zvop2ComplianceFields = [
  { key: 'compliance_area', label: 'Področje skladnosti', type: 'text' as const, required: true },
  { key: 'requirement_description', label: 'Opis zahteve', type: 'textarea' as const, required: true },
  { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, options: [
    'not_started', 'in_progress', 'completed', 'not_applicable'
  ]},
  { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
  { key: 'deadline', label: 'Rok', type: 'date' as const },
  { key: 'evidence_documentation', label: 'Dokazna dokumentacija', type: 'textarea' as const },
  { key: 'last_review_date', label: 'Datum zadnjega pregleda', type: 'date' as const }
]

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
      title="Dodaj novo ZVOP-2 zahtevo"
      table="zvop_2_compliance"
      fields={zvop2ComplianceFields}
    />
  )
}