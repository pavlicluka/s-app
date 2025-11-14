import { Incident } from '../../lib/supabase'
import DetailModal from '../common/DetailModal'
import Badge from '../Badge'

interface IncidentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  incident: Incident | null
}

export default function IncidentDetailModal({ isOpen, onClose, incident }: IncidentDetailModalProps) {
  if (!incident) return null

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Incident: ${incident.incident_id}`}
    >
      <div className="space-y-6">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ID incidenta
            </label>
            <p className="text-body-lg text-text-primary font-mono bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.incident_id}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tip incidenta
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.type}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ocenjena škoda
            </label>
            <div className="flex items-center">
              <Badge type="risk" value={incident.estimated_damage} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <div className="flex items-center">
              <Badge type="status" value={incident.status} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Datum detekcije
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(incident.detected_at).toLocaleString('sl-SI')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Datum rešitve
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString('sl-SI') : 'Ni rešeno'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              zahteva NIS-2
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.nis2_required ? '✅ Da' : '❌ Ne'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Control Manager
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.control_manager || 'Ni določen'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Datum poročanja
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {incident.report_date ? new Date(incident.report_date).toLocaleDateString('sl-SI') : 'Ni poročano'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ustvarjeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(incident.created_at).toLocaleString('sl-SI')}
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
