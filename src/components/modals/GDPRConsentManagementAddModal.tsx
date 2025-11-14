import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface GDPRConsentManagementAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRConsentManagementAddModal({ isOpen, onClose, onSave }: GDPRConsentManagementAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_email: '',
    consent_type: 'marketing_communication',
    consent_given: 'true',
    consent_date: '',
    withdrawal_date: '',
    purpose: '',
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
        .from('gdpr_consent_management')
        .insert([{
          ...formData,
          organization_id: userProfile.organization_id,
          consent_given: formData.consent_given === 'true',
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
        subject_name: '',
        subject_email: '',
        consent_type: 'marketing_communication',
        consent_given: 'true',
        consent_date: '',
        withdrawal_date: '',
        purpose: '',
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
          <h2 className="text-h3 text-text-primary">{t('modals.add.gdprConsentManagement.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('gdpr.consent.userName')} <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.subject_name}
                onChange={(e) => handleChange('subject_name', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('gdpr.consent.userEmail')} <span className="text-status-error">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.subject_email}
                onChange={(e) => handleChange('subject_email', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tip soglasja <span className="text-status-error">*</span>
              </label>
              <select
                required
                value={formData.consent_type}
                onChange={(e) => handleChange('consent_type', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="marketing_communication">Marketing Communication</option>
                <option value="data_processing">Data Processing</option>
                <option value="cookies">Cookies</option>
                <option value="analytics">Analytics</option>
                <option value="third_party_sharing">Third Party Sharing</option>
                <option value="data_retention">Data Retention</option>
                <option value="profiling">Profiling</option>
                <option value="automated_decision_making">Automated Decision Making</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Soglasje podano
              </label>
              <select
                value={formData.consent_given}
                onChange={(e) => handleChange('consent_given', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="true">Da</option>
                <option value="false">Ne</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Datum soglasja
              </label>
              <input
                type="datetime-local"
                value={formData.consent_date}
                onChange={(e) => handleChange('consent_date', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Datum preklica
              </label>
              <input
                type="datetime-local"
                value={formData.withdrawal_date}
                onChange={(e) => handleChange('withdrawal_date', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Namen <span className="text-status-error">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
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