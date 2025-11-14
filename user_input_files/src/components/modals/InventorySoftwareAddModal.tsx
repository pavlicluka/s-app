import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const InventorySoftwareAddModal = ({ isOpen, onClose, onSave }: InventorySoftwareAddModalProps) => {
  const { t } = useTranslation()

  const inventorySoftwareFields = [
    { key: 'software_id', label: t('modals.add.common.softwareId'), type: 'text' as const, required: true },
    { key: 'software_name', label: t('modals.add.common.softwareName'), type: 'text' as const, required: true },
    { key: 'vendor', label: t('modals.add.common.vendor'), type: 'text' as const },
    { key: 'version', label: t('modals.add.common.version'), type: 'text' as const },
    { key: 'license_type', label: t('modals.add.common.licenseType'), type: 'select' as const, required: true, options: [
      'perpetual',
      'subscription',
      'trial',
      'open_source',
      'freeware'
    ]},
    { key: 'category', label: t('modals.add.common.category'), type: 'text' as const },
    { key: 'total_licenses', label: t('modals.add.common.totalLicenses'), type: 'number' as const, required: true },
    { key: 'licenses_in_use', label: t('modals.add.common.licensesInUse'), type: 'number' as const, required: true },
    { key: 'cost_per_license', label: t('modals.add.common.costPerLicense'), type: 'number' as const },
    { key: 'purchase_date', label: t('modals.add.common.purchaseDate'), type: 'date' as const },
    { key: 'renewal_date', label: t('modals.add.common.renewalDate'), type: 'date' as const },
    { key: 'support_expiry', label: t('modals.add.common.supportExpiry'), type: 'date' as const },
    { key: 'notes', label: t('modals.add.common.notes'), type: 'textarea' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.inventorySoftware.title')}
      table="inventory_software"
      fields={inventorySoftwareFields}
    />
  )
}

interface InventorySoftwareAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default InventorySoftwareAddModal