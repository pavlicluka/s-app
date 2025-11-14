import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import i18n from '../../i18n'

interface GDPRProcessingActivitiesRecordAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function GDPRProcessingActivitiesRecordAddModal({ 
  isOpen, 
  onClose, 
  onSave 
}: GDPRProcessingActivitiesRecordAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [i18nReady, setI18nReady] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Počakaj na inicializacijo i18n - robustnejša rešitev
  useEffect(() => {
    const initI18n = async () => {
      if (i18n.isInitialized) {
        setI18nReady(true)
        return
      }
      
      const initializeI18n = () => {
        if (i18n.isInitialized) {
          setI18nReady(true)
        } else {
          // Če se ne inicializira takoj, preveri vsakih 50ms
          setTimeout(initializeI18n, 50)
        }
      }
      
      // Zaženje preverjanja
      initializeI18n()
    }
    
    initI18n()
  }, [])

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
  const [formData, setFormData] = useState({
    controller_name: '',
    controller_address: '',
    controller_email: '',
    controller_phone: '',
    dpo_contact: '',
    processing_purpose: '',
    lawful_basis: '',
    legitimate_interests: '',
    special_categories: '',
    personal_data_categories: '',
    data_sources: '',
    recipients_categories: '',
    international_transfers: '',
    retention_period: '',
    retention_explanation: '',
    technical_measures: '',
    organizational_measures: '',
    data_processor_name: '',
    processor_contact: '',
    data_loss_incidents: 0,
    data_subject_requests: 0,
    automated_decision_making: false,
    automated_explanation: '',
    status: 'active',
    last_review_date: '',
    next_review_date: '',
    documentation_url: '',
    organization_id: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      const { error } = await supabase
        .from('gdpr_processing_activities_record')
        .insert([{
          ...formData,
          organization_id: userProfile.organization_id,
          user_id: user?.id
        }])
      
      if (error) throw error
      
      onSave()
      resetForm()
    } catch (error) {
      console.error('Error creating processing activities record:', error)
      if (error instanceof Error && error.message.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + error.message)
      } else {
        alert(t('common.errorCreating'))
      }
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      controller_name: '',
      controller_address: '',
      controller_email: '',
      controller_phone: '',
      dpo_contact: '',
      processing_purpose: '',
      lawful_basis: '',
      legitimate_interests: '',
      special_categories: '',
      personal_data_categories: '',
      data_sources: '',
      recipients_categories: '',
      international_transfers: '',
      retention_period: '',
      retention_explanation: '',
      technical_measures: '',
      organizational_measures: '',
      data_processor_name: '',
      processor_contact: '',
      data_loss_incidents: 0,
      data_subject_requests: 0,
      automated_decision_making: false,
      automated_explanation: '',
      status: 'active',
      last_review_date: '',
      next_review_date: '',
      documentation_url: '',
      organization_id: userProfile?.organization_id || ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen || !i18nReady) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-2xl font-bold text-text-primary">{t('gdpr.processingActivities.addProcessingActivity')}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Controller Information */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.controllerInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.controllerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.controller_name}
                    onChange={(e) => setFormData({ ...formData, controller_name: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.controllerNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.dpoContact')}
                  </label>
                  <input
                    type="text"
                    value={formData.dpo_contact}
                    onChange={(e) => setFormData({ ...formData, dpo_contact: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.dpoContactPlaceholder')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.controllerAddress')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.controller_address}
                    onChange={(e) => setFormData({ ...formData, controller_address: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.controllerAddressPlaceholder') || 'Polni naslov organizacije'}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.controllerEmail')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.controller_email}
                    onChange={(e) => setFormData({ ...formData, controller_email: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.controllerPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.controller_phone}
                    onChange={(e) => setFormData({ ...formData, controller_phone: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Processing Purpose and Legal Basis */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.purposeAndLegalBasis')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.processingPurpose')} *
                  </label>
                  <textarea
                    required
                    value={formData.processing_purpose}
                    onChange={(e) => setFormData({ ...formData, processing_purpose: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={3}
                    placeholder={t('gdpr.processingActivities.placeholders.processingPurposePlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm text-text-secondary mb-2">
                      {t('gdpr.processingActivities.lawfulBasis')} *
                    </label>
                    <select
                      required
                      value={formData.lawful_basis}
                      onChange={(e) => setFormData({ ...formData, lawful_basis: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    >
                      <option value="">{t('common.selectOption')}</option>
                      <option value="Pogodba">{t('gdpr.processingActivities.legalBasisOptions.contract')}</option>
                      <option value="Privolitev">{t('gdpr.processingActivities.legalBasisOptions.consent')}</option>
                      <option value="Zakonska obveznost">{t('gdpr.processingActivities.legalBasisOptions.legal')}</option>
                      <option value="Zakoniti interes">{t('gdpr.processingActivities.legalBasisOptions.legitimate')}</option>
                      <option value="Nujna potreba">{t('gdpr.processingActivities.legalBasisOptions.vital')}</option>
                      <option value="Javni interes">{t('gdpr.processingActivities.legalBasisOptions.public')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-body-sm text-text-secondary mb-2">
                      {t('gdpr.processingActivities.legitimateInterests')}
                    </label>
                    <input
                      type="text"
                      value={formData.legitimate_interests}
                      onChange={(e) => setFormData({ ...formData, legitimate_interests: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                      placeholder={t('gdpr.processingActivities.placeholders.legitimateInterestsPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Categories */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.dataCategories')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.personalDataCategories')} *
                  </label>
                  <textarea
                    required
                    value={formData.personal_data_categories}
                    onChange={(e) => setFormData({ ...formData, personal_data_categories: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={3}
                    placeholder={t('gdpr.processingActivities.placeholders.personalDataCategoriesPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.specialCategories')}
                  </label>
                  <textarea
                    value={formData.special_categories}
                    onChange={(e) => setFormData({ ...formData, special_categories: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={2}
                    placeholder={t('gdpr.processingActivities.placeholders.specialCategoriesPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.dataSources')} *
                  </label>
                  <textarea
                    required
                    value={formData.data_sources}
                    onChange={(e) => setFormData({ ...formData, data_sources: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={2}
                    placeholder={t('gdpr.processingActivities.placeholders.dataSourcesPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Recipients and Transfers */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.recipientsAndTransfers')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.recipientsCategories')} *
                  </label>
                  <textarea
                    required
                    value={formData.recipients_categories}
                    onChange={(e) => setFormData({ ...formData, recipients_categories: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={2}
                    placeholder={t('gdpr.processingActivities.placeholders.recipientsCategoriesPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.internationalTransfers')}
                  </label>
                  <textarea
                    value={formData.international_transfers}
                    onChange={(e) => setFormData({ ...formData, international_transfers: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={2}
                    placeholder={t('gdpr.processingActivities.placeholders.internationalTransfersPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Retention */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.retention')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.retentionPeriod')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.retention_period}
                    onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.retentionPeriodPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.retentionExplanation')}
                  </label>
                  <textarea
                    value={formData.retention_explanation}
                    onChange={(e) => setFormData({ ...formData, retention_explanation: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={2}
                    placeholder={t('gdpr.processingActivities.placeholders.retentionExplanationPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Security Measures */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.securityMeasures')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.technicalMeasures')} *
                  </label>
                  <textarea
                    required
                    value={formData.technical_measures}
                    onChange={(e) => setFormData({ ...formData, technical_measures: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={3}
                    placeholder={t('gdpr.processingActivities.placeholders.technicalMeasuresPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.organizationalMeasures')} *
                  </label>
                  <textarea
                    required
                    value={formData.organizational_measures}
                    onChange={(e) => setFormData({ ...formData, organizational_measures: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    rows={3}
                    placeholder={t('gdpr.processingActivities.placeholders.organizationalMeasuresPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Data Processor */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.dataProcessor')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.dataProcessorName')}
                  </label>
                  <input
                    type="text"
                    value={formData.data_processor_name}
                    onChange={(e) => setFormData({ ...formData, data_processor_name: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.dataProcessorNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.processorContact')}
                  </label>
                  <input
                    type="text"
                    value={formData.processor_contact}
                    onChange={(e) => setFormData({ ...formData, processor_contact: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.processorContactPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Monitoring and Review */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.monitoringAndReview')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.dataLossIncidents')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.data_loss_incidents}
                    onChange={(e) => setFormData({ ...formData, data_loss_incidents: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.dataSubjectRequests')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.data_subject_requests}
                    onChange={(e) => setFormData({ ...formData, data_subject_requests: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="automated_decision_making"
                      checked={formData.automated_decision_making}
                      onChange={(e) => setFormData({ ...formData, automated_decision_making: e.target.checked })}
                      className="rounded border-border-subtle bg-bg-near-black text-accent-primary focus:ring-accent-primary"
                    />
                    <label htmlFor="automated_decision_making" className="text-body-sm text-text-secondary">
                      {t('gdpr.processingActivities.automatedDecisionMaking')}
                    </label>
                  </div>
                </div>
                {formData.automated_decision_making && (
                  <div className="md:col-span-2">
                    <label className="block text-body-sm text-text-secondary mb-2">
                      {t('gdpr.processingActivities.automatedExplanation')}
                    </label>
                    <textarea
                      value={formData.automated_explanation}
                      onChange={(e) => setFormData({ ...formData, automated_explanation: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                      rows={2}
                      placeholder={t('gdpr.processingActivities.placeholders.automatedExplanationPlaceholder')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Review Dates and Documentation */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-text-primary border-b border-border-subtle pb-2">
                {t('gdpr.processingActivities.sections.reviewAndDocumentation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.lastReviewDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.last_review_date}
                    onChange={(e) => setFormData({ ...formData, last_review_date: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.nextReviewDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.next_review_date}
                    onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.processingActivities.documentationUrl')}
                  </label>
                  <input
                    type="url"
                    value={formData.documentation_url}
                    onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.processingActivities.placeholders.documentationUrlPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-body-sm text-text-secondary mb-2">
                {t('common.status')} *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
                <option value="under_review">{t('gdpr.processingActivities.statusOptions.underReview')}</option>
                <option value="suspended">{t('gdpr.processingActivities.statusOptions.suspended')}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleClose}
                className="h-10 px-4 bg-bg-near-black hover:bg-bg-surface text-text-primary rounded-sm transition-colors duration-150"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}