import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'
import { useTranslation } from 'react-i18next'

interface ISOAssetManagementAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOAssetManagementAddModal({ isOpen, onClose, onSave }: ISOAssetManagementAddModalProps) {
  const { t } = useTranslation()
  const { organizationId } = useOrganizationId()

  const isoAssetManagementFields = [
    { key: 'asset_id', label: t('iso.assets.assetId'), type: 'text' as const, required: true },
    { key: 'asset_name', label: t('iso.assets.assetName'), type: 'text' as const, required: true },
    { key: 'asset_type', label: t('iso.assets.assetType'), type: 'select' as const, required: true, options: [
      'hardware',
      'software',
      'data',
      'service',
      'facility',
      'human_resource',
      'intellectual_property',
      'reputation',
      'business_process'
    ]},
    { key: 'owner', label: t('iso.assets.owner'), type: 'text' as const, required: true },
    { key: 'classification', label: t('iso.assets.classification'), type: 'select' as const, required: true, options: [
      'public',
      'internal',
      'confidential',
      'restricted'
    ]},
    { key: 'location', label: 'Lokacija', type: 'text' as const },
    { key: 'value_rating', label: 'Ocenjena vrednost', type: 'select' as const, options: [
      'very_low',
      'low',
      'medium',
      'high',
      'very_high'
    ]},
    { key: 'risk_level', label: t('iso.risk.riskLevel'), type: 'select' as const, options: [
      'low',
      'medium',
      'high',
      'critical'
    ]},
    { key: 'last_assessment_date', label: 'Datum zadnjega pregleda', type: 'date' as const }
  ]

  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('iso.assets.addAsset')}
      table="iso_asset_management"
      fields={[
        ...isoAssetManagementFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}

