import AddModal from './AddModal'

const settingsAdvancedConfigFields = [
  { key: 'setting_key', label: 'Ključ nastavitve', type: 'text' as const, required: true },
  { key: 'setting_value', label: 'Vrednost', type: 'textarea' as const, required: true },
  { key: 'setting_category', label: 'Kategorija', type: 'select' as const, required: true, options: [
    'security',
    'privacy',
    'compliance',
    'backup',
    'audit',
    'integration',
    'notification',
    'user_management',
    'system',
    'performance'
  ]},
  { key: 'data_type', label: 'Tip podatkov', type: 'select' as const, required: true, options: [
    'string',
    'number',
    'boolean',
    'json',
    'encrypted'
  ]},
  { key: 'description', label: 'Opis', type: 'textarea' as const },
  { key: 'is_sensitive', label: 'Občutljivi podatki', type: 'select' as const, options: ['true', 'false'] },
  { key: 'requires_restart', label: 'Zahteva ponovni zagon', type: 'select' as const, options: ['true', 'false'] },
  { key: 'validation_rule', label: 'Pravilo validacije', type: 'text' as const }
]

interface SettingsAdvancedConfigAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function SettingsAdvancedConfigAddModal({ isOpen, onClose, onSave }: SettingsAdvancedConfigAddModalProps) {
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo sistemsko nastavitev"
      table="settings_advanced_config"
      fields={settingsAdvancedConfigFields}
    />
  )
}
