import AddModal from './AddModal'

const inventoryAssetDetailsFields = [
  { key: 'asset_id', label: 'ID sredstva', type: 'text' as const, required: true },
  { key: 'serial_number', label: 'Serijska številka', type: 'text' as const },
  { key: 'purchase_date', label: 'Datum nakupa', type: 'date' as const },
  { key: 'warranty_expiry', label: 'Potek garancije', type: 'date' as const },
  { key: 'supplier', label: 'Dobavitelj', type: 'text' as const },
  { key: 'maintenance_schedule', label: 'Razpored vzdrževanja', type: 'textarea' as const },
  { key: 'last_maintenance', label: 'Zadnje vzdrževanje', type: 'date' as const },
  { key: 'specifications', label: 'Specifikacije', type: 'textarea' as const },
  { key: 'criticality_level', label: 'Nivo kritičnosti', type: 'select' as const, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'backup_asset_id', label: 'ID rezervnega sredstva', type: 'text' as const }
]

interface InventoryAssetDetailsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function InventoryAssetDetailsAddModal({ isOpen, onClose, onSave }: InventoryAssetDetailsAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj podrobnosti sredstva"
      table="inventory_asset_details"
      fields={inventoryAssetDetailsFields}
    />
  )
}