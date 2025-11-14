import { Device } from '../../lib/supabase'
import DetailModal from '../common/DetailModal'
import Badge from '../Badge'

interface DeviceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  device: Device | null
}

export default function DeviceDetailModal({ isOpen, onClose, device }: DeviceDetailModalProps) {
  if (!device) return null

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Naprava: ${device.manufacturer} ${device.model}`}
    >
      <div className="space-y-6">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Proizvajalec
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.manufacturer}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Model
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.model}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tip naprave
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.device_type}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Lokacija
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.location}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Uporabnik naprave
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.device_user || 'Ni določen'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nivo tveganja
            </label>
            <div className="flex items-center">
              <Badge type="risk" value={device.risk_level} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Zadnji pregled
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {device.last_check ? new Date(device.last_check).toLocaleString('sl-SI') : 'Ni podatka'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <div className="flex items-center">
              <Badge type="status" value={device.status} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ustvarjeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(device.created_at).toLocaleString('sl-SI')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
          >
            Zapri
          </button>
        </div>
      </div>
    </DetailModal>
  )
}
