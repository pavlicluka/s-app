import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoRiskAssessmentFields = [
  { key: 'risk_id', label: 'ID tveganja', type: 'text' as const, required: true },
  { key: 'asset_name', label: 'Naziv sredstva', type: 'text' as const, required: true },
  { key: 'threat_description', label: 'Opis grožnje', type: 'textarea' as const, required: true },
  { key: 'vulnerability_description', label: 'Opis ranljivosti', type: 'textarea' as const },
  { key: 'likelihood', label: 'Verjetnost', type: 'select' as const, required: true, options: [
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
  ]},
  { key: 'impact', label: 'Vpliv', type: 'select' as const, required: true, options: [
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
  ]},
  { key: 'risk_level', label: 'Nivo tveganja', type: 'select' as const, required: true, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'mitigation_strategy', label: 'Strategija za zmanjšanje', type: 'textarea' as const },
  { key: 'residual_risk', label: 'Preostalo tveganje', type: 'select' as const, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'owner', label: 'Lastnik', type: 'text' as const },
  { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
]

interface ISORiskAssessmentAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISORiskAssessmentAddModal({ isOpen, onClose, onSave }: ISORiskAssessmentAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo oceno tveganja"
      table="iso_risk_assessment"
      fields={[
        ...isoRiskAssessmentFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}