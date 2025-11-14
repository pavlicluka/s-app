import { useState, useEffect } from 'react'
import { Bot } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface AISystemsAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function AISystemsAddModal({ isOpen, onClose, onSave }: AISystemsAddModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    system_type: '',
    risk_level: '',
    status: 'active',
    description: '',
    organization_id: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        system_type: '',
        risk_level: '',
        status: 'active',
        description: '',
        organization_id: userProfile?.organization_id || ''
      })
      setValidationErrors({})
    }
  }, [isOpen, userProfile?.organization_id])

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !isOpen) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user, isOpen])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = `${t('aiSystems.systemName')} ${t('forms.required')}`
    }
    
    if (!formData.system_type.trim()) {
      errors.system_type = `${t('aiSystems.systemType')} ${t('forms.required')}`
    }
    
    if (!formData.risk_level.trim()) {
      errors.risk_level = `${t('aiSystems.riskLevel')} ${t('forms.required')}`
    }
    
    // Validate organization context
    const orgId = formData.organization_id || userProfile?.organization_id || ''
    if (!orgId.trim()) {
      errors.organization_id = 'ID organizacije je obvezno polje'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      const submissionData = {
        ...formData,
        organization_id: userProfile.organization_id,
        created_date: new Date().toISOString().split('T')[0], // Today's date
        last_updated: new Date().toISOString().split('T')[0]  // Today's date
      }
      
      const { error } = await supabase.from('ai_systems').insert([submissionData])
      if (error) {
        // Handle specific database errors
        if (error.code === '23502') {
          throw new Error('Manjkajo obvezna polja')
        } else if (error.code === '23505') {
          throw new Error('Zapis s tem ID-jem že obstaja')
        } else {
          throw error
        }
      }
      
      onSave()
      onClose()
      setFormData({
        name: '',
        system_type: '',
        risk_level: '',
        status: 'active',
        description: '',
        organization_id: userProfile.organization_id
      })
      setValidationErrors({})
    } catch (error: any) {
      console.error('Napaka pri shranjevanju:', error)
      const errorMessage = error.message || 'Napaka pri shranjevanju podatkov'
      if (errorMessage.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center space-x-3">
            <Bot className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-text-primary">{t('aiSystems.addSystem')}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('aiSystems.systemName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="Vnesite ime AI sistema"
                required
              />
              {validationErrors.name && (
                <p className="text-status-error text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('aiSystems.systemType')} *
              </label>
              <select
                value={formData.system_type}
                onChange={(e) => handleChange('system_type', e.target.value)}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                required
              >
                <option value="">{t('common.selectOption')}</option>
                <option value="conversational">{t('aiSystems.systemTypeOptions.conversational')}</option>
                <option value="biometric">{t('aiSystems.systemTypeOptions.biometric')}</option>
                <option value="recommendation">{t('aiSystems.systemTypeOptions.recommendation')}</option>
                <option value="image_recognition">{t('aiSystems.systemTypeOptions.image_recognition')}</option>
                <option value="nlp">{t('aiSystems.systemTypeOptions.nlp')}</option>
                <option value="fraud_detection">{t('aiSystems.systemTypeOptions.fraud_detection')}</option>
                <option value="autonomous">{t('aiSystems.systemTypeOptions.autonomous')}</option>
                <option value="other">{t('aiSystems.systemTypeOptions.other')}</option>
              </select>
              {validationErrors.system_type && (
                <p className="text-status-error text-xs mt-1">{validationErrors.system_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('aiSystems.riskLevel')} *
              </label>
              <select
                value={formData.risk_level}
                onChange={(e) => handleChange('risk_level', e.target.value)}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                required
              >
                <option value="">{t('common.selectOption')}</option>
                <option value="low">{t('aiSystems.riskLevelOptions.low')}</option>
                <option value="medium">{t('aiSystems.riskLevelOptions.medium')}</option>
                <option value="high">{t('aiSystems.riskLevelOptions.high')}</option>
              </select>
              {validationErrors.risk_level && (
                <p className="text-status-error text-xs mt-1">{validationErrors.risk_level}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('aiSystems.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="active">{t('aiSystems.statusOptions.active')}</option>
                <option value="under_review">{t('aiSystems.statusOptions.under_review')}</option>
                <option value="inactive">{t('aiSystems.statusOptions.inactive')}</option>
                <option value="deprecated">{t('aiSystems.statusOptions.deprecated')}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('aiSystems.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary resize-none"
              placeholder="Opis funkcionalnosti in namena AI sistema..."
            />
          </div>

          {/* Organization ID validation error */}
          {validationErrors.organization_id && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-status-error text-sm">{validationErrors.organization_id}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface-hover transition-colors duration-150"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}