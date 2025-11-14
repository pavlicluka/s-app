import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { supabase, NIS2Control } from '../../lib/supabase'

interface NIS2ControlsModalProps {
  isOpen: boolean
  onClose: () => void
  control?: NIS2Control | null
  onSuccess: () => void
}

export default function NIS2ControlsModal({ 
  isOpen, 
  onClose, 
  control, 
  onSuccess 
}: NIS2ControlsModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: control?.title || '',
    description: control?.description || '',
    control_type: control?.control_type || '',
    control_category: control?.control_category || '',
    status: control?.status || 'planned',
    priority: control?.priority || 'medium',
    owner: control?.owner || '',
    procedures: control?.procedures || '',
    compliance_status: control?.compliance_status || 'not_assessed'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const controlData = {
        ...formData,
        control_id: control?.control_id || `NIS2-${Date.now()}`,
        organization_id: control?.organization_id || '11111111-1111-1111-1111-111111111111' // Use first org for now
      }

      if (control) {
        const { error } = await supabase
          .from('nis2_controls')
          .update(controlData)
          .eq('id', control.id)
      } else {
        const { error } = await supabase
          .from('nis2_controls')
          .insert([controlData])
      }

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {control ? t('nis2Controls.messages.editTitle') : t('nis2Controls.messages.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-error bg-opacity-20 border border-status-error border-opacity-30 rounded-lg">
            <p className="text-status-error text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('nis2Controls.fields.controlName')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('nis2Controls.fields.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('nis2Controls.fields.controlType')}
              </label>
              <input
                type="text"
                value={formData.control_type}
                onChange={(e) => setFormData({...formData, control_type: e.target.value})}
                placeholder={t('nis2Controls.fields.controlTypeExample')}
                className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('nis2Controls.fields.controlCategory')}
              </label>
              <select
                value={formData.control_category}
                onChange={(e) => setFormData({...formData, control_category: e.target.value})}
                className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="">{t('common.selectOption')}</option>
                <option value="governance">{t('nis2Controls.categoryOptions.governance')}</option>
                <option value="asset_management">{t('nis2Controls.categoryOptions.asset_management')}</option>
                <option value="hr_security">{t('nis2Controls.categoryOptions.hr_security')}</option>
                <option value="physical_environmental">{t('nis2Controls.categoryOptions.physical_environmental')}</option>
                <option value="network_systems">{t('nis2Controls.categoryOptions.network_systems')}</option>
                <option value="cryptography">{t('nis2Controls.categoryOptions.cryptography')}</option>
                <option value="physical_logical_access">{t('nis2Controls.categoryOptions.physical_logical_access')}</option>
                <option value="access_control">{t('nis2Controls.categoryOptions.access_control')}</option>
                <option value="communications_operations">{t('nis2Controls.categoryOptions.communications_operations')}</option>
                <option value="incident_management">{t('nis2Controls.categoryOptions.incident_management')}</option>
                <option value="business_continuity">{t('nis2Controls.categoryOptions.business_continuity')}</option>
                <option value="compliance">{t('nis2Controls.categoryOptions.compliance')}</option>
                <option value="supplier_relationships">{t('nis2Controls.categoryOptions.supplier_relationships')}</option>
                <option value="information_security">{t('nis2Controls.categoryOptions.information_security')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('nis2Controls.fields.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="planned">{t('nis2Controls.statusOptions.planned')}</option>
                <option value="in_progress">{t('nis2Controls.statusOptions.in_progress')}</option>
                <option value="implemented">{t('nis2Controls.statusOptions.implemented')}</option>
                <option value="not_applicable">{t('nis2Controls.statusOptions.not_applicable')}</option>
                <option value="deferred">{t('nis2Controls.statusOptions.deferred')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('nis2Controls.fields.priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="low">{t('nis2Controls.priorityOptions.low')}</option>
                <option value="medium">{t('nis2Controls.priorityOptions.medium')}</option>
                <option value="high">{t('nis2Controls.priorityOptions.high')}</option>
                <option value="critical">{t('nis2Controls.priorityOptions.critical')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('nis2Controls.fields.owner')}
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              placeholder={t('nis2Controls.fields.ownerPlaceholder')}
              className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('nis2Controls.fields.procedures')}
            </label>
            <textarea
              value={formData.procedures}
              onChange={(e) => setFormData({...formData, procedures: e.target.value})}
              rows={3}
              placeholder={t('nis2Controls.fields.proceduresPlaceholder')}
              className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('nis2Controls.fields.complianceStatus')}
            </label>
            <select
              value={formData.compliance_status}
              onChange={(e) => setFormData({...formData, compliance_status: e.target.value})}
              className="w-full px-3 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="compliant">{t('nis2Controls.complianceStatusOptions.compliant')}</option>
              <option value="partially_compliant">{t('nis2Controls.complianceStatusOptions.partially_compliant')}</option>
              <option value="non_compliant">{t('nis2Controls.complianceStatusOptions.non_compliant')}</option>
              <option value="not_assessed">{t('nis2Controls.complianceStatusOptions.not_assessed')}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
            >
              {saving ? t('common.saving') : control ? t('nis2Controls.update') : t('nis2Controls.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
