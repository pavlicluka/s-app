import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const InventoryLicensesAddModal = ({ isOpen, onClose, onSave }: InventoryLicensesAddModalProps) => {
  const { t } = useTranslation()

  const inventoryLicensesFields = [
    { key: 'license_key', label: t('modals.add.common.licenseKey'), type: 'text' as const, required: true },
    { key: 'software_name', label: t('modals.add.common.softwareName'), type: 'text' as const, required: true },
    { key: 'license_type', label: t('modals.add.common.licenseType'), type: 'select' as const, required: true, options: [
      'perpetual',
      'subscription',
      'trial'
    ]},
    { key: 'seats', label: t('modals.add.common.seats'), type: 'number' as const, required: true },
    { key: 'seats_used', label: t('modals.add.common.seatsUsed'), type: 'number' as const, required: true },
    { key: 'assigned_to', label: t('modals.add.common.assignedTo'), type: 'text' as const },
    { key: 'purchase_date', label: t('modals.add.common.purchaseDate'), type: 'date' as const },
    { key: 'expiry_date', label: t('modals.add.common.expiryDate'), type: 'date' as const },
    { key: 'renewal_cost', label: t('modals.add.common.renewalCost'), type: 'number' as const },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, required: true, options: [
      'active',
      'expired',
      'suspended'
    ]},
    { key: 'notes', label: t('modals.add.common.notes'), type: 'textarea' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.inventoryLicense.title')}
      table="inventory_licenses"
      fields={inventoryLicensesFields}
    />
  )
}

interface InventoryLicensesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default InventoryLicensesAddModal