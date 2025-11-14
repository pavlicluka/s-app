import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoAuditLogFields = [
  { key: 'audit_id', label: 'ID revizije', type: 'text' as const, required: true },
  { key: 'audit_type', label: 'Tip revizije', type: 'select' as const, required: true, options: [
    'internal',
    'external',
    'compliance',
    'security',
    'quality',
    'risk_management',
    'business_continuity'
  ]},
  { key: 'audit_date', label: 'Datum revizije', type: 'date' as const, required: true },
  { key: 'auditor_name', label: 'Ime revizorja', type: 'text' as const, required: true },
  { key: 'scope', label: 'Obseg revizije', type: 'textarea' as const, required: true },
  { key: 'findings', label: 'Ugotovitve', type: 'textarea' as const },
  { key: 'recommendations', label: 'Priporočila', type: 'textarea' as const },
  { key: 'severity', label: 'Resnost', type: 'select' as const, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open',
    'in_progress',
    'resolved',
    'closed'
  ]},
  { key: 'remediation_plan', label: 'Načrt odprave', type: 'textarea' as const },
  { key: 'due_date', label: 'Rok za odpravljanje', type: 'date' as const }
]

interface ISOAuditLogAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOAuditLogAddModal({ isOpen, onClose, onSave }: ISOAuditLogAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo revizijo"
      table="iso_audit_log"
      fields={[
        ...isoAuditLogFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}