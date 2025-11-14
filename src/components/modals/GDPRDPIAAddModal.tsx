import React, { useState, useEffect } from 'react'
import { X, FileText, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

interface GDPRDPIAAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const GDPRDPIAAddModal: React.FC<GDPRDPIAAddModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    assessment_id: '',
    project_name: '',
    assessment_date: '',
    data_processing_description: '',
    necessity_assessment: '',
    risks_identified: '',
    mitigation_measures: '',
    status: 'in_progress',
    approved_by: '',
    approval_date: '',
    organization_id: ''
  })
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Get user profile with organization context - Hook MUST be called unconditionally
  useEffect(() => {
    if (!isOpen || !user) return
    
    const fetchUserProfileData = async () => {
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

    fetchUserProfileData()
  }, [user, isOpen])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(t('validation.fileTooLarge'))
        return
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert('Dovoljeni so samo PDF, DOC, DOCX, XLS, XLSX, CSV fajli.')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const uploadFile = async (): Promise<{ url: string; name: string; size: number } | null> => {
    if (!selectedFile) return null
    
    setFileUploading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('gdpr-attachments')
        .upload(fileName, selectedFile)
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('gdpr-attachments')
        .getPublicUrl(fileName)
      
      return {
        url: urlData.publicUrl,
        name: selectedFile.name,
        size: selectedFile.size
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert(t('validation.fileUploadFailed'))
      return null
    } finally {
      setFileUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let fileData = null
      if (selectedFile) {
        fileData = await uploadFile()
        if (!fileData) {
          setSaving(false)
          return
        }
      }

      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      const submitData = {
        ...formData,
        organization_id: userProfile.organization_id,
        ...(fileData && {
          file_url: fileData.url,
          file_name: fileData.name,
          file_size: fileData.size
        })
      }

      const { error } = await supabase
        .from('gdpr_dpia_assessments')
        .insert([submitData])

      if (error) throw error

      onSuccess()
      onClose()
      setFormData({
        assessment_id: '',
        project_name: '',
        assessment_date: '',
        data_processing_description: '',
        necessity_assessment: '',
        risks_identified: '',
        mitigation_measures: '',
        status: 'in_progress',
        approved_by: '',
        approval_date: '',
        organization_id: userProfile?.organization_id || ''
      })
      setSelectedFile(null)
    } catch (error) {
      console.error('Error saving DPIA assessment:', error)
      if (error instanceof Error && error.message.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + error.message)
      } else {
        alert('Napaka pri shranjevanju DPIA ocene.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-pink-400" />
            <h2 className="text-xl font-semibold text-white">{t('modals.add.gdprDpia.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.assessmentId')} *
              </label>
              <input
                type="text"
                value={formData.assessment_id}
                onChange={(e) => setFormData({ ...formData, assessment_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.projectName')} *
              </label>
              <input
                type="text"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.assessmentDate')} *
              </label>
              <input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="in_progress">V izdelavi</option>
                <option value="completed">Dokončana</option>
                <option value="approved">Odobrena</option>
                <option value="rejected">Zavrnjena</option>
              </select>
            </div>
          </div>

          {/* Data Processing Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('modals.add.gdprDpia.dataProcessingDescription')} *
            </label>
            <textarea
              value={formData.data_processing_description}
              onChange={(e) => setFormData({ ...formData, data_processing_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Assessment Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.gdprDpia.necessityAssessment')}
              </label>
              <textarea
                value={formData.necessity_assessment}
                onChange={(e) => setFormData({ ...formData, necessity_assessment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.gdprDpia.risksIdentified')}
              </label>
              <textarea
                value={formData.risks_identified}
                onChange={(e) => setFormData({ ...formData, risks_identified: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.gdprDpia.mitigationMeasures')}
              </label>
              <textarea
                value={formData.mitigation_measures}
                onChange={(e) => setFormData({ ...formData, mitigation_measures: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Approval Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.approvedBy')}
              </label>
              <input
                type="text"
                value={formData.approved_by}
                onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.approvalDate')}
              </label>
              <input
                type="date"
                value={formData.approval_date}
                onChange={(e) => setFormData({ ...formData, approval_date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('forms.attachFile')}
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg cursor-pointer hover:bg-blue-600/30 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Izberi datoteko
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <span className="text-gray-300 text-sm">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dovoljeni formati: PDF, DOC, DOCX, XLS, XLSX, CSV (max 10MB)
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || fileUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving || fileUploading ? t('forms.submitting') : t('forms.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GDPRDPIAAddModal
