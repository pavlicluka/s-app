import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { toast } from 'sonner'

interface GDPRTransfersEvidenceAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any
}

export default function GDPRTransfersEvidenceAddModal({
  isOpen,
  onClose,
  onSuccess,
  editData
}: GDPRTransfersEvidenceAddModalProps) {
  const { t } = useTranslation()
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    transfer_id: editData?.transfer_id || '',
    transfer_name: editData?.transfer_name || '',
    transfer_type: editData?.transfer_type || 'single',
    source_country: editData?.source_country || 'SI',
    destination_country: editData?.destination_country || '',
    start_datetime: editData?.start_datetime || new Date().toISOString().split('T')[0],
    end_datetime: editData?.end_datetime || '',
    controller_processor_flag: editData?.controller_processor_flag || 'controller',
    data_volume_estimate: editData?.data_volume_estimate || 0,
    purpose_of_transfer: editData?.purpose_of_transfer || '',
    recipient_type: editData?.recipient_type || '',
    recipient_name: editData?.recipient_name || '',
    data_categories: editData?.data_categories || [],
    data_subjects: editData?.data_subjects || [],
    lawful_basis_transfer: editData?.lawful_basis_transfer || 'adequacy',
    mechanism_details_ref: editData?.mechanism_details_ref || '',
    status: editData?.status || 'active',
    tia_required: editData?.tia_required || false,
    tia_status: editData?.tia_status || '',
    tia_outcome: editData?.tia_outcome || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organizationId) {
      toast.error('Organizacija ni nastavljena')
      return
    }

    try {
      setLoading(true)

      const dataToSave = {
        ...formData,
        organization_id: organizationId,
        data_volume_estimate: Number(formData.data_volume_estimate)
      }

      if (editData?.id) {
        // Update existing record
        const { error } = await supabase
          .from('gdpr_transfers_third_countries')
          .update(dataToSave)
          .eq('id', editData.id)
          .eq('organization_id', organizationId)

        if (error) throw error
        toast.success('Prenos je bil uspešno posodobljen')
      } else {
        // Insert new record
        const { error } = await supabase
          .from('gdpr_transfers_third_countries')
          .insert([dataToSave])

        if (error) throw error
        toast.success('Prenos je bil uspešno dodan')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving transfer:', error)
      toast.error(error.message || 'Napaka pri shranjevanju prenosa')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-bg-surface rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-heading-3 font-bold text-text-primary">
            {editData ? 'Uredi prenos' : 'Dodaj nov prenos'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                ID prenosa *
              </label>
              <input
                type="text"
                value={formData.transfer_id}
                onChange={(e) => setFormData({ ...formData, transfer_id: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="npr. TRANS-2025-001"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Naziv prenosa *
              </label>
              <input
                type="text"
                value={formData.transfer_name}
                onChange={(e) => setFormData({ ...formData, transfer_name: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="npr. Prenos podatkov strank v ZDA"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Tip prenosa *
              </label>
              <select
                value={formData.transfer_type}
                onChange={(e) => setFormData({ ...formData, transfer_type: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              >
                <option value="single">Enkraten prenos</option>
                <option value="batch">Množični prenos</option>
                <option value="stream">Pretočni prenos</option>
                <option value="recurring">Ponavljajoči prenos</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              >
                <option value="active">Aktiven</option>
                <option value="under_review">V pregledu</option>
                <option value="suspended">Začasno ustavljen</option>
                <option value="inactive">Neaktiven</option>
              </select>
            </div>
          </div>

          {/* Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Izvorna država *
              </label>
              <input
                type="text"
                value={formData.source_country}
                onChange={(e) => setFormData({ ...formData, source_country: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="SI"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Ciljna država *
              </label>
              <input
                type="text"
                value={formData.destination_country}
                onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="US"
                maxLength={2}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Datum začetka *
              </label>
              <input
                type="date"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Datum konca
              </label>
              <input
                type="date"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Role and Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Vloga organizacije *
              </label>
              <select
                value={formData.controller_processor_flag}
                onChange={(e) => setFormData({ ...formData, controller_processor_flag: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              >
                <option value="controller">Upravljavec</option>
                <option value="processor">Obdelovalec</option>
                <option value="joint_controller">Skupni upravljavec</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Ocena obsega podatkov
              </label>
              <input
                type="number"
                value={formData.data_volume_estimate}
                onChange={(e) => setFormData({ ...formData, data_volume_estimate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Tip prejemnika *
              </label>
              <input
                type="text"
                value={formData.recipient_type}
                onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="npr. Strežniški ponudnik"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Ime prejemnika
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="npr. Amazon Web Services"
              />
            </div>
          </div>

          {/* Purpose and Legal Basis */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-2">
              Namen prenosa *
            </label>
            <textarea
              value={formData.purpose_of_transfer}
              onChange={(e) => setFormData({ ...formData, purpose_of_transfer: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              rows={3}
              required
              placeholder="Opišite namen prenosa osebnih podatkov..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Pravna podlaga prenosa *
              </label>
              <select
                value={formData.lawful_basis_transfer}
                onChange={(e) => setFormData({ ...formData, lawful_basis_transfer: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              >
                <option value="adequacy">Odločba o ustreznosti</option>
                <option value="SCC">Standardne pogodbene klavzule (SCC)</option>
                <option value="BCR">Zavezujoča pravila organizacije (BCR)</option>
                <option value="certification">Certifikacija</option>
                <option value="Art49">Člen 49 (izjeme)</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Referenca na mehanizem *
              </label>
              <input
                type="text"
                value={formData.mechanism_details_ref}
                onChange={(e) => setFormData({ ...formData, mechanism_details_ref: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="npr. SCC-2025-001"
              />
            </div>
          </div>

          {/* TIA Assessment */}
          <div className="border border-border-subtle rounded-lg p-4 bg-bg-near-black">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="tia_required"
                checked={formData.tia_required}
                onChange={(e) => setFormData({ ...formData, tia_required: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="tia_required" className="text-body-sm font-medium text-text-primary">
                Potrebna je ocena vpliva prenosa (TIA)
              </label>
            </div>

            {formData.tia_required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-body-sm font-medium text-text-primary mb-2">
                    Status TIA ocene
                  </label>
                  <select
                    value={formData.tia_status}
                    onChange={(e) => setFormData({ ...formData, tia_status: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Izberite status</option>
                    <option value="pending">V pripravi</option>
                    <option value="in_progress">V izvajanju</option>
                    <option value="completed">Dokončana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-primary mb-2">
                    Rezultat TIA ocene
                  </label>
                  <input
                    type="text"
                    value={formData.tia_outcome}
                    onChange={(e) => setFormData({ ...formData, tia_outcome: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                    placeholder="npr. Zadovoljivo"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
              <div className="text-body-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Pomembno</p>
                <p>
                  Evidenca prenosov osebnih podatkov v tretje države je obvezna po členu 30 GDPR.
                  Zagotovite, da ste izbrali ustrezno pravno podlago in dokumentirali vse zahtevane informacije.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            disabled={loading}
          >
            Prekliči
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Shranjujem...' : editData ? 'Posodobi' : 'Shrani'}
          </button>
        </div>
      </div>
    </div>
  )
}
