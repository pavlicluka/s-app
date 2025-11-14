import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface GDPRAuditTrailAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRAuditTrailAddModal({ isOpen, onClose, onSave }: GDPRAuditTrailAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    action_type: 'create',
    table_affected: '',
    record_id: '',
    action_description: '',
    data_before: '',
    data_after: '',
    ip_address: '',
    user_agent: '',
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
        .from('gdpr_audit_trail')
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
        action_type: 'create',
        table_affected: '',
        record_id: '',
        action_description: '',
        data_before: '',
        data_after: '',
        ip_address: '',
        user_agent: '',
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
          <h2 className="text-h3 text-text-primary">{t('modals.add.gdprAuditTrail.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tip dejanja <span className="text-status-error">*</span>
              </label>
              <select
                required
                value={formData.action_type}
                onChange={(e) => handleChange('action_type', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="export">Export</option>
                <option value="import">Import</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Prizadeta tabela <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.table_affected}
                onChange={(e) => handleChange('table_affected', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                ID zapisa
              </label>
              <input
                type="text"
                value={formData.record_id}
                onChange={(e) => handleChange('record_id', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                IP naslov
              </label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => handleChange('ip_address', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Opis dejanja
              </label>
              <textarea
                rows={3}
                value={formData.action_description}
                onChange={(e) => handleChange('action_description', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Podatki pred
              </label>
              <textarea
                rows={3}
                value={formData.data_before}
                onChange={(e) => handleChange('data_before', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Podatki po
              </label>
              <textarea
                rows={3}
                value={formData.data_after}
                onChange={(e) => handleChange('data_after', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                User Agent
              </label>
              <input
                type="text"
                value={formData.user_agent}
                onChange={(e) => handleChange('user_agent', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
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