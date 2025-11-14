import React, { useState, useEffect } from 'react'
import { X, Users, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

interface GDPRControllerProcessorAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const GDPRControllerProcessorAddModal: React.FC<GDPRControllerProcessorAddModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    entity_name: '',
    entity_type: 'controller',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    headquarters_address: '',
    legal_basis: '',
    processing_type: '',
    data_categories: '',
    recipients: '',
    retention_period: '',
    security_measures: '',
    international_transfers: false,
    sub_processors: '',
    dpo_contact: '',
    role_description: '',
    agreement_signed: false,
    agreement_date: '',
    data_processing_activities: '',
    organization_id: ''
  })
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Get user profile with organization context
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchUserProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        if (isMounted) {
          setUserProfile(data)
          setFormData(prev => ({
            ...prev,
            organization_id: data.organization_id || ''
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()

    return () => {
      isMounted = false
    }
  }, [user, isOpen])

  // Conditional return after all hooks
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
        user_id: user?.id,
        organization_id: userProfile.organization_id,
        ...(fileData && {
          file_url: fileData.url,
          file_name: fileData.name,
          file_size: fileData.size
        })
      }

      console.log('Submitting data:', submitData)
      const { data, error } = await supabase
        .from('gdpr_controller_processor')
        .insert([submitData])

      if (error) {
        console.error('Database insert error:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Data successfully inserted:', data)
      onSuccess()
      onClose()
      setFormData({
        entity_name: '',
        entity_type: 'controller',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        headquarters_address: '',
        legal_basis: '',
        processing_type: '',
        data_categories: '',
        recipients: '',
        retention_period: '',
        security_measures: '',
        international_transfers: false,
        sub_processors: '',
        dpo_contact: '',
        role_description: '',
        agreement_signed: false,
        agreement_date: '',
        data_processing_activities: '',
        organization_id: userProfile?.organization_id || ''
      })
      setSelectedFile(null)
    } catch (error) {
      console.error('Error saving controller/processor:', error)
      const errorMsg = error instanceof Error ? error.message : 'Neznana napaka pri shranjevanju'
      alert('Napaka pri shranjevanju upravljavca/obdelovalca: ' + errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">{t('gdprController.title_new')}</h2>
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
                {t('gdprController.fields.company_name')} *
              </label>
              <input
                type="text"
                value={formData.entity_name}
                onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('gdprController.typeColumnName')} *
              </label>
              <select
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="controller">{t('gdprController.options.controller')}</option>
                <option value="processor">{t('gdprController.options.processor')}</option>
                <option value="joint_controller">Skupni upravljavec</option>
                <option value="sub_processor">Pod-obdelovalec</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.contactPerson')}
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.contactEmail')}
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modals.add.common.contactPhone')}
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.headquarters_address')} *
            </label>
            <textarea
              value={formData.headquarters_address}
              onChange={(e) => setFormData({ ...formData, headquarters_address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.headquarters_address_placeholder')}
              required
            />
          </div>

          {/* Legal Basis */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.legal_basis')} *
            </label>
            <select
              value={formData.legal_basis}
              onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">{t('gdprController.fields.legal_basis_placeholder')}</option>
              <option value="consent">{t('gdprController.legal_basis_options.consent')}</option>
              <option value="contract">{t('gdprController.legal_basis_options.contract')}</option>
              <option value="legal_obligation">{t('gdprController.legal_basis_options.legal_obligation')}</option>
              <option value="vital_interests">{t('gdprController.legal_basis_options.vital_interests')}</option>
              <option value="public_task">{t('gdprController.legal_basis_options.public_task')}</option>
              <option value="legitimate_interests">{t('gdprController.legal_basis_options.legitimate_interests')}</option>
            </select>
          </div>

          {/* Processing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.processing_type')}
            </label>
            <textarea
              value={formData.processing_type}
              onChange={(e) => setFormData({ ...formData, processing_type: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.processing_type_placeholder')}
            />
          </div>

          {/* Data Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.data_categories')}
            </label>
            <textarea
              value={formData.data_categories}
              onChange={(e) => setFormData({ ...formData, data_categories: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.data_categories_placeholder')}
            />
          </div>

          {/* Data Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.recipients')}
            </label>
            <textarea
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.recipients_placeholder')}
            />
          </div>

          {/* Retention Period */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.retention_period')}
            </label>
            <input
              type="text"
              value={formData.retention_period}
              onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.retention_period_placeholder')}
            />
          </div>

          {/* Security Measures */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.security_measures')}
            </label>
            <textarea
              value={formData.security_measures}
              onChange={(e) => setFormData({ ...formData, security_measures: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.security_measures_placeholder')}
            />
          </div>

          {/* International Transfers */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="international_transfers"
              checked={formData.international_transfers}
              onChange={(e) => setFormData({ ...formData, international_transfers: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="international_transfers" className="text-sm font-medium text-gray-300">
              {t('gdprController.fields.international_transfers')}
            </label>
          </div>

          {/* Sub-processors */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.sub_processors')}
            </label>
            <textarea
              value={formData.sub_processors}
              onChange={(e) => setFormData({ ...formData, sub_processors: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.sub_processors_placeholder')}
            />
          </div>

          {/* DPO Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.fields.dpo_contact')}
            </label>
            <input
              type="text"
              value={formData.dpo_contact}
              onChange={(e) => setFormData({ ...formData, dpo_contact: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('gdprController.fields.dpo_contact_placeholder')}
            />
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.roleDescription')}
            </label>
            <textarea
              value={formData.role_description}
              onChange={(e) => setFormData({ ...formData, role_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Data Processing Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('gdprController.dataProcessingActivities')}
            </label>
            <textarea
              value={formData.data_processing_activities}
              onChange={(e) => setFormData({ ...formData, data_processing_activities: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Agreement Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agreement_signed"
                checked={formData.agreement_signed}
                onChange={(e) => setFormData({ ...formData, agreement_signed: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="agreement_signed" className="text-sm font-medium text-gray-300">
                {t('gdprController.agreementSigned')}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('forms.agreementDate')}
              </label>
              <input
                type="date"
                value={formData.agreement_date}
                onChange={(e) => setFormData({ ...formData, agreement_date: e.target.value })}
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

export default GDPRControllerProcessorAddModal