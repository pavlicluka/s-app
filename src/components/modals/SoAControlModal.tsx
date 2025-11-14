import { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SoAControl {
  id: string
  control_id: string
  control_name: string
  control_category: string
  status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'planned'
  justification: string
  isms_scope_reference?: string
  risk_reference?: string
  legal_requirements?: string
  policy_references?: string
  control_owner?: string
  implementation_date?: string
  last_review_date: string
  related_controls?: string
  evidence?: string
}

interface SoAControlModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  control: SoAControl | null
  organizationId: string
  mode?: 'view' | 'edit'
}

export default function SoAControlModal({ isOpen, onClose, onSave, control, organizationId, mode = 'edit' }: SoAControlModalProps) {
  const [formData, setFormData] = useState<Partial<SoAControl>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (control) {
      setFormData({
        ...control,
        implementation_date: control.implementation_date || '',
        last_review_date: control.last_review_date || new Date().toISOString().split('T')[0]
      })
    }
  }, [control])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!control || !organizationId) return

    setSaving(true)
    setError(null)

    try {
      const updateData = {
        status: formData.status || 'not_implemented',
        justification: formData.justification || 'Kontrola še ni bila ocenjena.',
        isms_scope_reference: formData.isms_scope_reference || null,
        risk_reference: formData.risk_reference || null,
        legal_requirements: formData.legal_requirements || null,
        policy_references: formData.policy_references || null,
        control_owner: formData.control_owner || null,
        implementation_date: formData.implementation_date || null,
        last_review_date: formData.last_review_date || new Date().toISOString().split('T')[0],
        related_controls: formData.related_controls || null,
        evidence: formData.evidence || null,
      }

      const { error: updateError } = await supabase
        .from('soa_controls')
        .update(updateData)
        .eq('id', control.id)
        .eq('organization_id', organizationId)

      if (updateError) throw updateError

      onSave()
    } catch (error: any) {
      console.error('Error updating control:', error)
      setError(error.message || 'Prišlo je do napake pri shranjevanju')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !control) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div>
            <h2 className="text-heading-lg font-semibold text-text-primary">
              {mode === 'view' ? 'Ogled kontrole' : 'Urejanje kontrole'} - {control.control_id}
            </h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {control.control_name} | Kategorija: {control.control_category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-body-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Status implementacije *
            </label>
            <select
              value={formData.status || 'not_implemented'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={mode === 'view'}
            >
              <option value="not_implemented">Ni implementirano</option>
              <option value="planned">Načrtovano</option>
              <option value="partially_implemented">Delno implementirano</option>
              <option value="implemented">Implementirano</option>
            </select>
          </div>

          {/* Justification */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Utemeljitev *
            </label>
            <textarea
              value={formData.justification || ''}
              onChange={(e) => handleChange('justification', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Razlogi za vključitev/izključitev kontrole..."
              required
              disabled={mode === 'view'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Control Owner */}
            <div>
              <label className="block text-body font-medium text-text-primary mb-2">
                Lastnik kontrole
              </label>
              <input
                type="text"
                value={formData.control_owner || ''}
                onChange={(e) => handleChange('control_owner', e.target.value)}
                className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="npr. Head of Security, IT Manager"
                disabled={mode === 'view'}
              />
            </div>

            {/* Implementation Date */}
            <div>
              <label className="block text-body font-medium text-text-primary mb-2">
                Datum implementacije
              </label>
              <input
                type="date"
                value={formData.implementation_date || ''}
                onChange={(e) => handleChange('implementation_date', e.target.value)}
                className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* ISMS Scope Reference */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Reference na obseg ISMS
            </label>
            <input
              type="text"
              value={formData.isms_scope_reference || ''}
              onChange={(e) => handleChange('isms_scope_reference', e.target.value)}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. Obseg-ISMS-2025-v1.0"
              disabled={mode === 'view'}
            />
          </div>

          {/* Risk Reference */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Reference na tveganja
            </label>
            <input
              type="text"
              value={formData.risk_reference || ''}
              onChange={(e) => handleChange('risk_reference', e.target.value)}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. RA-2025-ID-12, RTP-5.2"
              disabled={mode === 'view'}
            />
          </div>

          {/* Legal Requirements */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Pravne/pogodbene zahteve
            </label>
            <textarea
              value={formData.legal_requirements || ''}
              onChange={(e) => handleChange('legal_requirements', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. GDPR Art. 32, Pogodba XYZ-23"
              disabled={mode === 'view'}
            />
          </div>

          {/* Policy References */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Reference na politike/postopke
            </label>
            <textarea
              value={formData.policy_references || ''}
              onChange={(e) => handleChange('policy_references', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. POL-IA-01, SOP-IR-03"
              disabled={mode === 'view'}
            />
          </div>

          {/* Related Controls */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Povezane kontrole
            </label>
            <input
              type="text"
              value={formData.related_controls || ''}
              onChange={(e) => handleChange('related_controls', e.target.value)}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. A.5.24, A.5.26, A.8.15"
              disabled={mode === 'view'}
            />
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Dokazila
            </label>
            <textarea
              value={formData.evidence || ''}
              onChange={(e) => handleChange('evidence', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="npr. DLP-Policy.pdf, SIEM-report-Q3.pdf"
              disabled={mode === 'view'}
            />
          </div>

          {/* Last Review Date */}
          <div>
            <label className="block text-body font-medium text-text-primary mb-2">
              Datum zadnjega pregleda *
            </label>
            <input
              type="date"
              value={formData.last_review_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('last_review_date', e.target.value)}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={mode === 'view'}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-body font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {mode === 'view' ? 'Zapri' : 'Prekliči'}
            </button>
            {mode === 'edit' && (
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Shranjevanje...' : 'Shrani'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}