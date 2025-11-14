import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Database, Plus, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import Modal from '../common/Modal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import { useOrganization } from '../../hooks/useOrganization'

interface DataProtectionRecord {
  id: string
  data_type: string
  processing_purpose: string
  legal_basis: string
  data_retention_period: string
  status: string
  created_at: string
  // Controller Information
  controller_name?: string
  controller_address?: string
  controller_email?: string
  controller_phone?: string
  eu_representative?: string
  // DPO Contact
  dpo_contact_name?: string
  dpo_contact_email?: string
  dpo_contact_phone?: string
  dpo_appointed?: boolean
  // Purposes and Legal Bases
  processing_purposes_detailed?: string
  legal_basis_detailed?: string
  legitimate_interests?: string
  data_subject_categories?: string
  // Data Categories
  personal_data_categories?: string
  special_data_categories?: string
  data_sources?: string
  // Recipients and Transfers
  recipient_categories?: string
  international_transfers?: string
  transfer_safeguards?: string
  // Security Measures
  technical_measures?: string
  organizational_measures?: string
  // Retention
  retention_period_detailed?: string
  retention_criteria?: string
  // Data Subject Rights
  data_subject_rights?: string
  rights_exercise_procedure?: string
  // Automated Decision-Making
  automated_decision_making?: boolean
  profiling_description?: string
  // ZVOP-2 Specifics
  processing_logs_maintained?: boolean
  special_systems?: string
  data_residency_location?: string
}

export default function GDPRDataProtection() {
  const { t } = useTranslation()
  const { organizationId, userProfile, loading: orgLoading, error: orgError } = useOrganization()
  const [records, setRecords] = useState<DataProtectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DataProtectionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    controllerInfo: true,
    dpoInfo: false,
    purposesAndBasis: false,
    dataCategories: false,
    recipientsTransfers: false,
    security: false,
    retention: false,
    dataSubjectRights: false,
    automatedDecisions: false,
    zvop2: false
  })
  
  const [formData, setFormData] = useState<Partial<DataProtectionRecord>>({
    data_type: '',
    processing_purpose: '',
    legal_basis: '',
    data_retention_period: '',
    status: 'active',
    dpo_appointed: false,
    automated_decision_making: false,
    processing_logs_maintained: false
  })
  
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (organizationId) {
      fetchRecords()
    }
  }, [organizationId])

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (orgError || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t('common.accessDenied')}</h2>
          <p className="text-body text-text-secondary">
            {orgError || t('gdpr.dataProtection.noOrganization')}
          </p>
        </div>
      </div>
    )
  }

  const fetchRecords = async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error } = await supabase
        .from('gdpr_data_protection')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) {
      setError(t('common.noOrganization'))
      return
    }

    setSaving(true)
    try {
      const recordData = {
        ...formData,
        organization_id: organizationId
      }

      const { error } = await supabase
        .from('gdpr_data_protection')
        .insert([recordData])
      
      if (error) throw error
      
      await fetchRecords()
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Error creating record:', error)
      setError(error.message || t('common.errorCreating'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord || !organizationId) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('gdpr_data_protection')
        .update(formData)
        .eq('id', selectedRecord.id)
        .eq('organization_id', organizationId)
      
      if (error) throw error
      
      await fetchRecords()
      setIsEditModalOpen(false)
      setSelectedRecord(null)
      resetForm()
    } catch (error: any) {
      console.error('Error updating record:', error)
      setError(error.message || t('common.errorUpdating'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedRecord || !organizationId) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('gdpr_data_protection')
        .delete()
        .eq('id', selectedRecord.id)
        .eq('organization_id', organizationId)
      
      if (error) throw error
      
      await fetchRecords()
      setIsDeleteModalOpen(false)
      setSelectedRecord(null)
    } catch (error: any) {
      console.error('Error deleting record:', error)
      setError(error.message || t('common.errorDeleting'))
    } finally {
      setDeleting(false)
    }
  }

  const openEditModal = (record: DataProtectionRecord) => {
    setSelectedRecord(record)
    setFormData(record)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (record: DataProtectionRecord) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      data_type: '',
      processing_purpose: '',
      legal_basis: '',
      data_retention_period: '',
      status: 'active',
      dpo_appointed: false,
      automated_decision_making: false,
      processing_logs_maintained: false
    })
    setExpandedSections({
      controllerInfo: true,
      dpoInfo: false,
      purposesAndBasis: false,
      dataCategories: false,
      recipientsTransfers: false,
      security: false,
      retention: false,
      dataSubjectRights: false,
      automatedDecisions: false,
      zvop2: false
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredRecords = records.filter(record => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      (record.controller_name?.toLowerCase().includes(searchLower) ||
       record.processing_purposes_detailed?.toLowerCase().includes(searchLower) ||
       record.processing_purpose?.toLowerCase().includes(searchLower) ||
       record.legal_basis_detailed?.toLowerCase().includes(searchLower) ||
       record.legal_basis?.toLowerCase().includes(searchLower) ||
       record.dpo_contact_name?.toLowerCase().includes(searchLower))
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const renderFormSection = (
    sectionKey: string,
    title: string,
    content: React.ReactNode
  ) => (
    <div className="border border-border-subtle rounded-sm overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 bg-bg-near-black hover:bg-bg-surface flex items-center justify-between transition-colors duration-150"
      >
        <span className="text-body font-medium text-text-primary">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-4 space-y-4 bg-bg-surface">
          {content}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t('common.error')}</h2>
          <p className="text-body text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => fetchRecords()}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('gdpr.dataProtection.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('gdpr.dataProtection.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('common.addRecord')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-body-sm text-text-secondary mb-2">
              {t('common.search')}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('gdpr.dataProtection.searchPlaceholder')}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-body-sm text-text-secondary mb-2">
              {t('common.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-sm p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-status-error" />
            <span className="text-body text-status-error">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.dataProtection.fields.controllerName')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.dataProtection.fields.processingPurposesDetailed')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.dataProtection.fields.legalBasisDetailed')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.dataProtection.fields.dpoContactName')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4 text-body text-text-primary">{record.controller_name || record.data_type}</td>
                  <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.processing_purposes_detailed || record.processing_purpose}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-accent-primary/10 text-accent-primary">
                      {record.legal_basis_detailed || record.legal_basis}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.dpo_contact_name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                      record.status === 'active' 
                        ? 'bg-status-success/10 text-status-success' 
                        : 'bg-status-error/10 text-status-error'
                    }`}>
                      {record.status === 'active' ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                      >
                        <Edit className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <div className="text-caption text-text-secondary uppercase tracking-wide mb-2">{t('common.totalRecords')}</div>
          <div className="text-2xl font-bold text-text-primary">{records.length}</div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <div className="text-caption text-text-secondary uppercase tracking-wide mb-2">{t('common.active')}</div>
          <div className="text-h2 text-status-success">{records.filter(r => r.status === 'active').length}</div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <div className="text-caption text-text-secondary uppercase tracking-wide mb-2">{t('common.inactive')}</div>
          <div className="text-h2 text-status-warning">{records.filter(r => r.status !== 'active').length}</div>
        </div>
      </div>

      {/* Create/Edit Modal - TO BE CONTINUED IN NEXT PART */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => { 
          if (isCreateModalOpen) setIsCreateModalOpen(false)
          if (isEditModalOpen) setIsEditModalOpen(false)
          setSelectedRecord(null)
          resetForm()
        }}
        title={isCreateModalOpen ? t('common.addRecord') : t('common.editRecord')}
      >
        <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Controller Information */}
          {renderFormSection(
            'controllerInfo',
            t('gdpr.dataProtection.sections.controllerInfo'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.controllerName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.controller_name || ''}
                  onChange={(e) => setFormData({ ...formData, controller_name: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.controllerName')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.controllerAddress')}
                </label>
                <input
                  type="text"
                  value={formData.controller_address || ''}
                  onChange={(e) => setFormData({ ...formData, controller_address: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.controllerAddress')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.dataProtection.fields.controllerEmail')}
                  </label>
                  <input
                    type="email"
                    value={formData.controller_email || ''}
                    onChange={(e) => setFormData({ ...formData, controller_email: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.dataProtection.placeholders.controllerEmail')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.dataProtection.fields.controllerPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.controller_phone || ''}
                    onChange={(e) => setFormData({ ...formData, controller_phone: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.dataProtection.placeholders.controllerPhone')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.euRepresentative')}
                </label>
                <input
                  type="text"
                  value={formData.eu_representative || ''}
                  onChange={(e) => setFormData({ ...formData, eu_representative: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.euRepresentative')}
                />
              </div>
            </>
          )}

          {/* Section 2: DPO Contact */}
          {renderFormSection(
            'dpoInfo',
            t('gdpr.dataProtection.sections.dpoContact'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.dpoContactName')}
                </label>
                <input
                  type="text"
                  value={formData.dpo_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, dpo_contact_name: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.dpoContactName')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.dataProtection.fields.dpoContactEmail')}
                  </label>
                  <input
                    type="email"
                    value={formData.dpo_contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, dpo_contact_email: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.dataProtection.placeholders.dpoContactEmail')}
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.dataProtection.fields.dpoContactPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.dpo_contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, dpo_contact_phone: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.dataProtection.placeholders.dpoContactPhone')}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dpo_appointed"
                  checked={formData.dpo_appointed || false}
                  onChange={(e) => setFormData({ ...formData, dpo_appointed: e.target.checked })}
                  className="w-4 h-4 text-accent-primary bg-bg-near-black border-border-subtle rounded focus:ring-accent-primary"
                />
                <label htmlFor="dpo_appointed" className="text-body-sm text-text-secondary">
                  {t('gdpr.dataProtection.fields.dpoAppointed')}
                </label>
              </div>
            </>
          )}

          {/* Section 3: Purposes and Legal Bases */}
          {renderFormSection(
            'purposesAndBasis',
            t('gdpr.dataProtection.sections.purposesAndBasis'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.processingPurposes')} *
                </label>
                <textarea
                  required
                  value={formData.processing_purposes_detailed || formData.processing_purpose || ''}
                  onChange={(e) => setFormData({ ...formData, processing_purposes_detailed: e.target.value, processing_purpose: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.processingPurposes')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.legalBasisDetailed')} *
                </label>
                <textarea
                  required
                  value={formData.legal_basis_detailed || formData.legal_basis || ''}
                  onChange={(e) => setFormData({ ...formData, legal_basis_detailed: e.target.value, legal_basis: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.legalBasisDetailed')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.legitimateInterests')}
                </label>
                <textarea
                  value={formData.legitimate_interests || ''}
                  onChange={(e) => setFormData({ ...formData, legitimate_interests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.legitimateInterests')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.dataSubjectCategories')}
                </label>
                <textarea
                  value={formData.data_subject_categories || ''}
                  onChange={(e) => setFormData({ ...formData, data_subject_categories: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.dataSubjectCategories')}
                />
              </div>
            </>
          )}

          {/* Section 4: Data Categories */}
          {renderFormSection(
            'dataCategories',
            t('gdpr.dataProtection.sections.dataCategories'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.personalDataCategories')}
                </label>
                <textarea
                  value={formData.personal_data_categories || formData.data_type || ''}
                  onChange={(e) => setFormData({ ...formData, personal_data_categories: e.target.value, data_type: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.personalDataCategories')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.specialDataCategories')}
                </label>
                <textarea
                  value={formData.special_data_categories || ''}
                  onChange={(e) => setFormData({ ...formData, special_data_categories: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.specialDataCategories')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.dataSources')}
                </label>
                <textarea
                  value={formData.data_sources || ''}
                  onChange={(e) => setFormData({ ...formData, data_sources: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.dataSources')}
                />
              </div>
            </>
          )}

          {/* Section 5: Recipients and Transfers */}
          {renderFormSection(
            'recipientsTransfers',
            t('gdpr.dataProtection.sections.recipientsTransfers'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.recipientCategories')}
                </label>
                <textarea
                  value={formData.recipient_categories || ''}
                  onChange={(e) => setFormData({ ...formData, recipient_categories: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.recipientCategories')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.internationalTransfers')}
                </label>
                <textarea
                  value={formData.international_transfers || ''}
                  onChange={(e) => setFormData({ ...formData, international_transfers: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.internationalTransfers')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.transferSafeguards')}
                </label>
                <textarea
                  value={formData.transfer_safeguards || ''}
                  onChange={(e) => setFormData({ ...formData, transfer_safeguards: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.transferSafeguards')}
                />
              </div>
            </>
          )}

          {/* Section 6: Security Measures */}
          {renderFormSection(
            'security',
            t('gdpr.dataProtection.sections.securityMeasures'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.technicalMeasures')}
                </label>
                <textarea
                  value={formData.technical_measures || ''}
                  onChange={(e) => setFormData({ ...formData, technical_measures: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.technicalMeasures')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.organizationalMeasures')}
                </label>
                <textarea
                  value={formData.organizational_measures || ''}
                  onChange={(e) => setFormData({ ...formData, organizational_measures: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.organizationalMeasures')}
                />
              </div>
            </>
          )}

          {/* Section 7: Retention */}
          {renderFormSection(
            'retention',
            t('gdpr.dataProtection.sections.retention'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.retentionPeriodDetailed')}
                </label>
                <textarea
                  value={formData.retention_period_detailed || formData.data_retention_period || ''}
                  onChange={(e) => setFormData({ ...formData, retention_period_detailed: e.target.value, data_retention_period: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.retentionPeriodDetailed')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.retentionCriteria')}
                </label>
                <textarea
                  value={formData.retention_criteria || ''}
                  onChange={(e) => setFormData({ ...formData, retention_criteria: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.retentionCriteria')}
                />
              </div>
            </>
          )}

          {/* Section 8: Data Subject Rights */}
          {renderFormSection(
            'dataSubjectRights',
            t('gdpr.dataProtection.sections.dataSubjectRights'),
            <>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.dataSubjectRights')}
                </label>
                <textarea
                  value={formData.data_subject_rights || ''}
                  onChange={(e) => setFormData({ ...formData, data_subject_rights: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.dataSubjectRights')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.rightsExerciseProcedure')}
                </label>
                <textarea
                  value={formData.rights_exercise_procedure || ''}
                  onChange={(e) => setFormData({ ...formData, rights_exercise_procedure: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.rightsExerciseProcedure')}
                />
              </div>
            </>
          )}

          {/* Section 9: Automated Decision-Making */}
          {renderFormSection(
            'automatedDecisions',
            t('gdpr.dataProtection.sections.automatedDecisions'),
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="automated_decision_making"
                  checked={formData.automated_decision_making || false}
                  onChange={(e) => setFormData({ ...formData, automated_decision_making: e.target.checked })}
                  className="w-4 h-4 text-accent-primary bg-bg-near-black border-border-subtle rounded focus:ring-accent-primary"
                />
                <label htmlFor="automated_decision_making" className="text-body-sm text-text-secondary">
                  {t('gdpr.dataProtection.fields.automatedDecisionMaking')}
                </label>
              </div>
              {formData.automated_decision_making && (
                <div>
                  <label className="block text-body-sm text-text-secondary mb-2">
                    {t('gdpr.dataProtection.fields.profilingDescription')}
                  </label>
                  <textarea
                    value={formData.profiling_description || ''}
                    onChange={(e) => setFormData({ ...formData, profiling_description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                    placeholder={t('gdpr.dataProtection.placeholders.profilingDescription')}
                  />
                </div>
              )}
            </>
          )}

          {/* Section 10: ZVOP-2 Specifics */}
          {renderFormSection(
            'zvop2',
            t('gdpr.dataProtection.sections.zvop2Specifics'),
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="processing_logs_maintained"
                  checked={formData.processing_logs_maintained || false}
                  onChange={(e) => setFormData({ ...formData, processing_logs_maintained: e.target.checked })}
                  className="w-4 h-4 text-accent-primary bg-bg-near-black border-border-subtle rounded focus:ring-accent-primary"
                />
                <label htmlFor="processing_logs_maintained" className="text-body-sm text-text-secondary">
                  {t('gdpr.dataProtection.fields.processingLogsMaintained')}
                </label>
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.specialSystems')}
                </label>
                <textarea
                  value={formData.special_systems || ''}
                  onChange={(e) => setFormData({ ...formData, special_systems: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.specialSystems')}
                />
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  {t('gdpr.dataProtection.fields.dataResidencyLocation')}
                </label>
                <input
                  type="text"
                  value={formData.data_residency_location || ''}
                  onChange={(e) => setFormData({ ...formData, data_residency_location: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder={t('gdpr.dataProtection.placeholders.dataResidencyLocation')}
                />
              </div>
            </>
          )}

          {/* Status */}
          <div className="border border-border-subtle rounded-sm p-4 bg-bg-surface">
            <label className="block text-body-sm text-text-secondary mb-2">
              {t('common.status')}
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => { 
                if (isCreateModalOpen) setIsCreateModalOpen(false)
                if (isEditModalOpen) setIsEditModalOpen(false)
                setSelectedRecord(null)
                resetForm()
              }}
              className="h-10 px-4 bg-bg-near-black hover:bg-bg-surface text-text-primary rounded-sm transition-colors duration-150"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? t('common.saving') : (isCreateModalOpen ? t('common.save') : t('common.update'))}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedRecord(null); }}
        onConfirm={handleDelete}
        title={t('common.deleteRecord')}
        message={`${t('deleteConfirm.message')} "${selectedRecord?.controller_name || selectedRecord?.data_type}"`}
        isDeleting={deleting}
      />
    </div>
  )
}
