import AddModal from './AddModal'
import { useTranslation } from 'react-i18next'

const DeviceAddModal = ({ isOpen, onClose, onSave }: DeviceAddModalProps) => {
  const { t } = useTranslation()

  const deviceFields = [
    { key: 'manufacturer', label: t('modals.add.common.manufacturer'), type: 'text' as const, required: true },
    { key: 'model', label: t('modals.add.common.model'), type: 'text' as const, required: true },
    { key: 'device_type', label: t('modals.add.common.deviceType'), type: 'select' as const, required: true, options: [
      'server',
      'workstation',
      'laptop',
      'mobile_device',
      'network_device',
      'printer',
      'storage_device',
      'security_device',
      'iot_device',
      'other'
    ]},
    { key: 'location', label: t('modals.add.common.location'), type: 'text' as const, required: true },
    { key: 'device_user', label: t('modals.add.common.deviceUser'), type: 'text' as const },
    { key: 'risk_level', label: t('modals.add.common.riskLevel'), type: 'select' as const, required: true, options: [
      'Low',
      'Medium',
      'High'
    ]},
    { key: 'last_check', label: t('modals.add.common.lastCheck'), type: 'datetime' as const },
    { key: 'status', label: t('modals.add.common.status'), type: 'select' as const, options: [
      'active',
      'inactive',
      'maintenance'
    ]}
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('modals.add.device.title')}
      table="devices"
      fields={deviceFields}
    />
  )
}

interface DeviceAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default DeviceAddModal