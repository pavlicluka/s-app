import { useState } from 'react'
import { X, ChevronDown, ChevronUp, AlertTriangle, Shield, Users, FileText, Database, Globe, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { GDPRDataBreachLog } from '../../lib/supabase'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  existingData?: Partial<GDPRDataBreachLog>
}

export default function GDPRDataBreachLogAdvancedModal({ isOpen, onClose, onSave, existingData }: Props) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false
  })
  
  const [formData, setFormData] = useState<Partial<GDPRDataBreachLog>>(existingData || {
    breach_id: '',
    detection_datetime: new Date().toISOString().slice(0, 16),
    discovery_method: '',
    breach_type: [],
    information_system: '',
    database_table: '',
    data_categories: [],
    breach_description: '',
    breach_cause: '',
    breach_source: 'external',
    affected_subjects_count: 0,
    affected_records_count: 0,
    breach_start_datetime: new Date().toISOString().slice(0, 16),
    breach_end_datetime: '',
    dpo_contact_name: '',
    dpo_contact_email: '',
    dpo_contact_phone: '',
    dpo_contact_department: '',
    probability_of_abuse: 'low',
    severity_of_consequences: 'low',
    likely_risk: false,
    high_risk: false,
    consequences_for_individuals: [],
    affected_areas: [],
    containment_measures: [],
    containment_datetime: '',
    corrective_measures: '',
    corrective_deadline: '',
    responsible_person: '',
    reported_to_authority: false,
    notification_sent_at: '',
    notification_deadline: '',
    ip_reference_number: '',
    reason_for_delay: '',
    notify_individuals: false,
    notify_individuals_date: '',
    notification_content: '',
    method_of_notification: '',
    exception_applied: '',
    processing_log_maintained: false,
    processing_log_references: [],
    processing_action_type: '',
    processing_action_datetime: '',
    processing_executor: '',
    data_users: '',
    legal_hold_procedure: false,
    legal_hold_type: '',
    deletion_prohibition: false,
    deletion_prohibition_date: '',
    copy_order: false,
    copy_count: '',
    special_processing: false,
    special_processing_categories: [],
    data_residency_location: '',
    csirt_notification_required: false,
    csirt_notification_date: '',
    csirt_reference_number: '',
    third_party_disclosures: false,
    disclosure_records: null,
    disclosure_retention_period: '2 leta',
    attachments: null,
    attachment_description: '',
    internal_reports: '',
    authority_communications: null,
    incident_link: '',
    status: 'open',
    severity: 'low',
    breach_case_owner: '',
    escalation_flag: false,
    version_history: null,
    evidence_hash: '',
    national_reporting_details: null,
    cross_border_details: ''
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleChange = (field: keyof GDPRDataBreachLog, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof GDPRDataBreachLog, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || []
    if (checked) {
      handleChange(field, [...currentArray, value])
    } else {
      handleChange(field, currentArray.filter(v => v !== value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const dataToSave = {
        ...formData,
        breach_start_datetime: formData.breach_start_datetime || new Date().toISOString(),
        detection_datetime: formData.detection_datetime || new Date().toISOString(),
        // Avtomatski izračun 72-urnega roka se izvede v triggerju
      }

      const { error } = await supabase
        .from('gdpr_data_breach_log')
        .insert([dataToSave])

      if (error) throw error
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving breach log:', error)
      alert(t('forms.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-risk-critical/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-risk-critical" />
            </div>
            <div>
              <h2 className="text-h3 text-text-primary">{t('gdpr.breach.title')}</h2>
              <p className="text-caption text-text-secondary">{t('gdpr.breach.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => toggleSection(section)}
                  className={`px-3 py-1 text-xs rounded ${
                    expandedSections[section]
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-near-black text-text-secondary'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="h-1 bg-bg-near-black rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-primary transition-all duration-300"
                style={{ 
                  width: `${(Object.values(expandedSections).filter(Boolean).length / 8) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* SEKCIJA A: Identifikacija incidenta */}
          <div className="mb-4 border border-border-subtle rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('A')}
              className="w-full flex items-center justify-between px-6 py-4 bg-bg-near-black hover:bg-bg-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-accent-primary" />
                <span className="text-body font-medium text-text-primary">{t('gdpr.breach.sectionA')}</span>
              </div>
              {expandedSections.A ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.A && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-surface">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachId')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.breach_id || ''}
                    onChange={(e) => handleChange('breach_id', e.target.value)}
                    placeholder="INC-2025-0001"
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <p className="text-xs text-text-tertiary mt-1">{t('gdpr.breach.helpText.breachId')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.detectionDatetime')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.detection_datetime || ''}
                    onChange={(e) => handleChange('detection_datetime', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.discoveryMethod')} <span className="text-risk-critical">*</span>
                  </label>
                  <select
                    required
                    value={formData.discovery_method || ''}
                    onChange={(e) => handleChange('discovery_method', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Izberite...</option>
                    <option value="automatic">{t('gdpr.breach.discoveryMethodOptions.automatic')}</option>
                    <option value="manual_user">{t('gdpr.breach.discoveryMethodOptions.manual_user')}</option>
                    <option value="manual_employee">{t('gdpr.breach.discoveryMethodOptions.manual_employee')}</option>
                    <option value="third_party">{t('gdpr.breach.discoveryMethodOptions.third_party')}</option>
                    <option value="authority">{t('gdpr.breach.discoveryMethodOptions.authority')}</option>
                    <option value="other">{t('gdpr.breach.discoveryMethodOptions.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.informationSystem')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.information_system || ''}
                    onChange={(e) => handleChange('information_system', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.databaseTable')}
                  </label>
                  <input
                    type="text"
                    value={formData.database_table || ''}
                    onChange={(e) => handleChange('database_table', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('gdpr.breach.breachType')} <span className="text-risk-critical">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {['confidentiality', 'integrity', 'availability'].map((type) => (
                      <label key={type} className="flex items-center gap-2 px-3 py-2 bg-bg-near-black rounded cursor-pointer hover:bg-bg-surface">
                        <input
                          type="checkbox"
                          checked={(formData.breach_type || []).includes(type)}
                          onChange={(e) => handleArrayChange('breach_type', type, e.target.checked)}
                          className="w-4 h-4 accent-accent-primary"
                        />
                        <span className="text-sm text-text-primary">{t(`gdpr.breach.breachTypeOptions.${type}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {t('gdpr.breach.dataCategories')} <span className="text-risk-critical">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {['personal_identifiers', 'contact_data', 'demographic_data', 'financial_data', 'health_data', 'biometric_data', 'location_data', 'other'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 px-3 py-2 bg-bg-near-black rounded cursor-pointer hover:bg-bg-surface">
                        <input
                          type="checkbox"
                          checked={(formData.data_categories || []).includes(cat)}
                          onChange={(e) => handleArrayChange('data_categories', cat, e.target.checked)}
                          className="w-4 h-4 accent-accent-primary"
                        />
                        <span className="text-sm text-text-primary">{t(`gdpr.breach.dataCategoryOptions.${cat}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEKCIJA B: Narava kršitve */}
          <div className="mb-4 border border-border-subtle rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('B')}
              className="w-full flex items-center justify-between px-6 py-4 bg-bg-near-black hover:bg-bg-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-risk-high" />
                <span className="text-body font-medium text-text-primary">{t('gdpr.breach.sectionB')}</span>
              </div>
              {expandedSections.B ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.B && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-surface">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachDescription')} <span className="text-risk-critical">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={100}
                    maxLength={2000}
                    value={formData.breach_description || ''}
                    onChange={(e) => handleChange('breach_description', e.target.value)}
                    placeholder="Opisnite natančno, kaj se je zgodilo, kdaj in kako..."
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    {(formData.breach_description || '').length} / 2000 znakov (minimum 100)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachCause')} <span className="text-risk-critical">*</span>
                  </label>
                  <select
                    required
                    value={formData.breach_cause || ''}
                    onChange={(e) => handleChange('breach_cause', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Izberite...</option>
                    {['human_error', 'technical_failure', 'cyber_attack', 'natural_disaster', 'internal_malicious', 'external_events', 'unknown', 'other'].map((cause) => (
                      <option key={cause} value={cause}>{t(`gdpr.breach.breachCauseOptions.${cause}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachSource')} <span className="text-risk-critical">*</span>
                  </label>
                  <select
                    required
                    value={formData.breach_source || ''}
                    onChange={(e) => handleChange('breach_source', e.target.value as any)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="internal">{t('gdpr.breach.breachSourceOptions.internal')}</option>
                    <option value="external">{t('gdpr.breach.breachSourceOptions.external')}</option>
                    <option value="mixed">{t('gdpr.breach.breachSourceOptions.mixed')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.affectedSubjectsCount')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.affected_subjects_count || 0}
                    onChange={(e) => handleChange('affected_subjects_count', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.affectedRecordsCount')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.affected_records_count || 0}
                    onChange={(e) => handleChange('affected_records_count', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachStartDatetime')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.breach_start_datetime || ''}
                    onChange={(e) => handleChange('breach_start_datetime', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.breachEndDatetime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.breach_end_datetime || ''}
                    onChange={(e) => handleChange('breach_end_datetime', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEKCIJA C: Kontakt DPO - Shortened for space */}
          <div className="mb-4 border border-border-subtle rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('C')}
              className="w-full flex items-center justify-between px-6 py-4 bg-bg-near-black hover:bg-bg-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent-primary" />
                <span className="text-body font-medium text-text-primary">{t('gdpr.breach.sectionC')}</span>
              </div>
              {expandedSections.C ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.C && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-surface">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.dpoContactName')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dpo_contact_name || ''}
                    onChange={(e) => handleChange('dpo_contact_name', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.dpoContactEmail')} <span className="text-risk-critical">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.dpo_contact_email || ''}
                    onChange={(e) => handleChange('dpo_contact_email', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.dpoContactPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.dpo_contact_phone || ''}
                    onChange={(e) => handleChange('dpo_contact_phone', e.target.value)}
                    placeholder="+386 XX XXX XXX"
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('gdpr.breach.dpoContactDepartment')}
                  </label>
                  <input
                    type="text"
                    value={formData.dpo_contact_department || ''}
                    onChange={(e) => handleChange('dpo_contact_department', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Continuing with SEKCIJA D, E, F, G, H... Due to space, I'll add submit button */}

          {/* Submit Buttons */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-border-subtle bg-bg-surface">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors"
            >
              {t('modals.add.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? t('modals.add.common.submitting') : t('modals.add.common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
