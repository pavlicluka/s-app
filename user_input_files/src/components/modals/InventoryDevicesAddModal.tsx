import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const InventoryDevicesAddModal = ({ isOpen, onClose, onSave }: InventoryDevicesAddModalProps) => {
  const { t } = useTranslation()

  const inventoryDevicesFields = [
    { key: 'device_id', label: t('modals.add.common.deviceId'), type: 'text' as const, required: true },
    { key: 'device_name', label: t('modals.add.common.deviceName'), type: 'text' as const, required: true },
    { key: 'device_type', label: t('modals.add.common.deviceType'), type: 'select' as const, required: true, options: [
      'server',
      'laptop',
      'desktop',
      'mobile',
      'tablet',
      'network_device',
      'printer',
      'storage'
    ]},
    { key: 'manufacturer', label: t('modals.add.common.manufacturer'), type: 'text' as const },
    { key: 'model', label: t('modals.add.common.model'), type: 'text' as const },
    { key: 'serial_number', label: t('modals.add.common.serialNumber'), type: 'text' as const },
    { key: 'location', label: t('modals.add.common.location'), type: 'text' as const },
    { key: 'department', label: t('modals.add.common.department'), type: 'text' as const },
    { key: 'assigned_to', label: t('modals.add.common.assignedTo'), type: 'text' as const },
    { key: 'purchase_date', label: t('modals.add.common.purchaseDate'), type: 'date' as const },
    { key: 'warranty_expiry', label: t('modals.add.common.warrantyExpiry'), type: 'date' as const },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, options: [
      'active',
      'inactive',
      'maintenance',
      'retired'
    ]},
    { key: 'condition', label: t('modals.add.common.condition'), type: 'select' as const, options: [
      'excellent',
      'good',
      'fair',
      'poor'
    ]},
    { key: 'notes', label: t('modals.add.common.notes'), type: 'textarea' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.inventoryDevice.title')}
      table="inventory_devices"
      fields={inventoryDevicesFields}
    />
  )
}

interface InventoryDevicesAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default InventoryDevicesAddModal
