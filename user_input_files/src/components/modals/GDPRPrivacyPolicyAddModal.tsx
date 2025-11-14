import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface GDPRPrivacyPolicyAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRPrivacyPolicyAddModal({ isOpen, onClose, onSave }: GDPRPrivacyPolicyAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    policy_name: '',
    version: '',
    effective_date: '',
    content: '',
    status: 'draft',
    approved_by: '',
    last_updated: '',
    description: '',
    organization_id: ''
  })

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
        setFormData(prev => ({
          ...prev,
          organization_id: data.organization_id || ''
        }))
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number } | null> => {
    try {
      // Validacija file size (10MB max)
      if (file.size > 10485760) {
        alert(t('validation.fileTooLarge'))
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from('gdpr-attachments')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('gdpr-attachments')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        name: file.name,
        size: file.size
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert(t('validation.fileUploadFailed'))
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let fileData = null
      if (selectedFile) {
        fileData = await uploadFile(selectedFile)
        if (!fileData) {
          setSaving(false)
          return
        }
      }

      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      const { error } = await supabase
        .from('gdpr_privacy_policies')
        .insert([{
          ...formData,
          organization_id: userProfile.organization_id,
          ...(fileData && {
            file_url: fileData.url,
            file_name: fileData.name,
            file_size: fileData.size
          })
        }])

      if (error) throw error
      onSave()
      onClose()
      setFormData({
        policy_name: '',
        version: '',
        effective_date: '',
        content: '',
        status: 'draft',
        approved_by: '',
        last_updated: '',
        description: '',
        organization_id: userProfile?.organization_id || ''
      })
      setSelectedFile(null)
    } catch (error) {
      console.error('Error:', error)
      if (error instanceof Error && error.message.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + error.message)
      } else {
        alert(t('forms.saveFailed'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-h3 text-text-primary">{t('modals.add.gdprPrivacyPolicy.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('gdpr.privacyPolicy.policyName')} <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.policy_name}
                onChange={(e) => handleChange('policy_name', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('modals.add.common.version')} <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('gdpr.privacyPolicy.effectiveDate')} <span className="text-status-error">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.effective_date}
                onChange={(e) => handleChange('effective_date', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('modals.add.common.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('modals.add.common.approvedBy')}
              </label>
              <input
                type="text"
                value={formData.approved_by}
                onChange={(e) => handleChange('approved_by', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('common.lastUpdated')}
              </label>
              <input
                type="date"
                value={formData.last_updated}
                onChange={(e) => handleChange('last_updated', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('common.description')}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Kratek opis politike"
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('modals.add.common.content')}
              </label>
              <textarea
                rows={4}
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('forms.attachFile')} <span className="text-text-tertiary text-xs">(opcijsko)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accent-primary file:text-white hover:file:bg-accent-primary-hover"
              />
              {selectedFile && (
                <p className="text-xs text-text-tertiary mt-1">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
            >
              {t('modals.add.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? t('modals.add.common.submitting') : t('modals.add.common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}