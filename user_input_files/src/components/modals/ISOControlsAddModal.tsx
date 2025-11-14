import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoControlsFields = [
  { key: 'control_id', label: 'ID kontrole', type: 'text' as const, required: true },
  { key: 'control_name', label: 'Naziv kontrole', type: 'text' as const, required: true },
  { key: 'control_category', label: 'Kategorija kontrole', type: 'select' as const, required: true, options: [
    'A.5 - Varnostne politike',
    'A.6 - Organizacija varnosti informacij',
    'A.7 - Človeški viri',
    'A.8 - Upravljanje s sredstvi',
    'A.9 - Nadzor dostopa',
    'A.10 - Kriptografija',
    'A.11 - Fizična in okoljska varnost',
    'A.12 - Varnost operacij',
    'A.13 - Varnost komunikacij',
    'A.14 - Pridobivanje, razvoj in vzdrževanje sistemov',
    'A.15 - Odnosi z dobavitelji',
    'A.16 - Upravljanje incidentov',
    'A.17 - Vidiki informacijske varnosti pri upravljanju poslovne kontinuitete',
    'A.18 - Skladnost'
  ]},
  { key: 'description', label: 'Opis kontrole', type: 'textarea' as const, required: true },
  { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, required: true, options: [
    'implemented',
    'partially_implemented',
    'not_implemented'
  ]},
  { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
  { key: 'effectiveness', label: 'Učinkovitost', type: 'select' as const, options: [
    'high',
    'medium',
    'low'
  ]},
  { key: 'last_review_date', label: 'Datum zadnjega pregleda', type: 'date' as const },
  { key: 'notes', label: 'Opombe', type: 'textarea' as const }
]

interface ISOControlsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOControlsAddModal({ isOpen, onClose, onSave }: ISOControlsAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo kontrolo"
      table="iso_controls_management"
      fields={[
        ...isoControlsFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}