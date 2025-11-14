import { SupportRequest } from '../../lib/supabase'
import DetailModal from '../common/DetailModal'
import Badge from '../Badge'

interface SupportDetailModalProps {
  isOpen: boolean
  onClose: () => void
  supportRequest: SupportRequest | null
}

export default function SupportDetailModal({ isOpen, onClose, supportRequest }: SupportDetailModalProps) {
  if (!supportRequest) return null

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Zahtevek: ${supportRequest.ticket_id}`}
    >
      <div className="space-y-6">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Zahtevek za podporo
            </label>
            <p className="text-body-lg text-text-primary font-mono bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {supportRequest.ticket_id}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ime in Priimek
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {supportRequest.full_name}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Zadeva
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {supportRequest.subject}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Prioriteta
            </label>
            <div className="flex items-center">
              <Badge type="priority" value={supportRequest.priority} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status zahtevka
            </label>
            <div className="flex items-center">
              <Badge type="status" value={supportRequest.status} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ustvarjeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(supportRequest.created_at).toLocaleString('sl-SI')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Posodobljeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(supportRequest.updated_at).toLocaleString('sl-SI')}
            </p>
          </div>

          {supportRequest.user_id && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ID uporabnika
              </label>
              <p className="text-body-lg text-text-primary font-mono bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
                {supportRequest.user_id}
              </p>
            </div>
          )}
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
