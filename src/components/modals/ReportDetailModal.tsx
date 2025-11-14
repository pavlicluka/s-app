import { CyberIncidentReport } from '../../lib/supabase'
import DetailModal from '../common/DetailModal'
import Badge from '../Badge'

interface ReportDetailModalProps {
  isOpen: boolean
  onClose: () => void
  report: CyberIncidentReport | null
}

export default function ReportDetailModal({ isOpen, onClose, report }: ReportDetailModalProps) {
  if (!report) return null

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cyber Poročilo: ${report.referencna_stevilka || report.incident_number || 'Novo poročilo'}`}
    >
      <div className="space-y-6">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              0.1 Referenčna številka
            </label>
            <p className="text-body-lg text-text-primary font-mono bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {report.referencna_stevilka || report.incident_number || `INC-${report.id?.slice(0, 8) || 'NEW'}`}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              0.2 Zadeva
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {report.zadeva || report.opis_incidenta || report.incident_description || 'Brez zadeve'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              1.5 Tip poročila
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {(() => {
                const type = report.tip_porocila || report.report_type
                const typeMap: { [key: string]: string } = {
                  'prvo_porocilo': 'Prvo poročilo zavezanca',
                  'vmesno_porocilo': 'Vmesno/končno poročilo',
                  'obvescanje_pno': 'Prvo obveščanje PNO',
                  'prostovoljna_priglasitev': 'Prostovoljna priglasitev incidenta',
                  'koncno_porocilo': 'Končno poročilo'
                }
                return typeMap[type] || type || '-'
              })()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <div className="flex items-center">
              <Badge type="status" value={report.trenutno_stanje || report.incident_status || 'v teku'} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              2.1 Začetek incidenta
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {(() => {
                const date = report.zacetek_incidenta || report.detection_datetime
                return date ? new Date(date).toLocaleString('sl-SI') : '-'
              })()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              3.2 Zadnje poročanje
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {report.cas_zadnjega_porocanja ? new Date(report.cas_zadnjega_porocanja).toLocaleString('sl-SI') : 'Ni podatka'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ustvarjeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(report.created_at).toLocaleString('sl-SI')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Posodobljeno
            </label>
            <p className="text-body-lg text-text-primary bg-bg-near-black px-4 py-2 rounded border border-border-subtle">
              {new Date(report.updated_at).toLocaleString('sl-SI')}
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
