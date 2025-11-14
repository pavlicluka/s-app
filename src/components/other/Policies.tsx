import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Eye, X, Edit, Trash2, Download, Upload, Search, AlertTriangle } from 'lucide-react'
import PoliciesAddModal from '../modals/PoliciesAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import CSVImportModal from '../common/CSVImportModal'
import Modal from '../common/Modal'

export default function Policies() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedPolicy, setSelectedProcedure] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingPolicy, setEditingProcedure] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    policy_name: '',
    
    category: '',
    version: '',
    content: '',
    status: 'draft',
    approved_by: '',
    approval_date: '',
    review_date: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, statusFilter, categoryFilter])

  const fetchRecords = async () => {
    try {
      const { data, error} = await supabase.from('policies').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.policy_name?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query) ||
        r.policy_id?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Document type filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter)
    }

    setFilteredRecords(filtered)
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (procedure: any) => {
    setSelectedProcedure(procedure)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedProcedure(null)
  }

  const handleOpenEditModal = (policy: any) => {
    setEditingProcedure(policy)
    setEditFormData({
      policy_name: policy.policy_name || '',
      category: policy.category || '',
      version: policy.version || '',
      content: policy.content || '',
      status: policy.status || 'draft',
      approved_by: policy.approved_by || '',
      approval_date: policy.approval_date ? new Date(policy.approval_date).toISOString().split('T')[0] : '',
      review_date: policy.review_date ? new Date(policy.review_date).toISOString().split('T')[0] : ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPolicy) return
    
    setSaving(true)
    try {
      const updateData: any = {
        policy_name: editFormData.policy_name,
        category: editFormData.category,
        version: editFormData.version,
        content: editFormData.content,
        status: editFormData.status
      }
      
      if (editFormData.approved_by) updateData.approved_by = editFormData.approved_by
      if (editFormData.approval_date) updateData.approval_date = editFormData.approval_date
      if (editFormData.review_date) updateData.review_date = editFormData.review_date
      
      const { error } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', editingPolicy.id)
      
      if (error) throw error
      
      await handleSave()
      setIsEditModalOpen(false)
      setEditingProcedure(null)
    } catch (error) {
      console.error('Error updating document:', error)
      alert(t('policies.errors.update'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (procedure: any) => {
    setEditingProcedure(procedure)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingPolicy) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', editingPolicy.id)
      
      if (error) throw error
      
      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingProcedure(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert(t('policies.errors.delete'))
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    setExporting(true)
    try {
      const headers = [
        t('policies.table.policyId'),
        t('policies.table.policyName'), 
        t('policies.table.type'),
        t('policies.table.category'),
        t('policies.table.version'),
        t('policies.table.status'),
        t('policies.table.content'),
        t('policies.table.approvedBy'),
        t('policies.table.approvalDate'),
        t('policies.table.reviewDate'),
        t('common.createdAt'),
        t('common.updatedAt')
      ]

      const rows = filteredRecords.map(record => [
        record.policy_id || '-',
        record.policy_name || '-',
        record.category || '-',
        record.category || '-',
        record.version || '-',
        record.status || '-',
        record.content ? record.content.replace(/[\r\n]+/g, ' ').replace(/;/g, ',') : '-',
        record.approved_by || '-',
        record.approval_date ? new Date(record.approval_date).toLocaleDateString('sl-SI') : '-',
        record.review_date ? new Date(record.review_date).toLocaleDateString('sl-SI') : '-',
        new Date(record.created_at).toLocaleString('sl-SI'),
        record.updated_at ? new Date(record.updated_at).toLocaleString('sl-SI') : '-'
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.join(';'))
        .join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${t('policies.exportFilename')}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export error:', error)
      alert(t('policies.errors.export'))
    } finally {
      setExporting(false)
    }
  }

  const isReviewSoon = (reviewDate: string | null) => {
    if (!reviewDate) return false
    const today = new Date('2025-11-01')
    const review = new Date(reviewDate)
    const daysUntilReview = Math.floor((review.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilReview > 0 && daysUntilReview <= 30
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'approved': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'under_review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'superseded': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'expired': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return badges[status] || badges['draft']
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('policies.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('policies.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('policies.importCSV')}</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('policies.addPolicy')}</span>
          </button>
        </div>
      </div>

      {/* Filter/Search/Export Section */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={t('policies.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">{t('policies.filters.statusAll')}</option>
            <option value="draft">{t('common.statusOptions.draft')}</option>
            <option value="under_review">{t('common.statusOptions.under_review')}</option>
            <option value="approved">{t('common.statusOptions.approved')}</option>
            <option value="active">{t('common.statusOptions.active')}</option>
            <option value="superseded">{t('common.statusOptions.superseded')}</option>
            <option value="expired">{t('common.statusOptions.expired')}</option>
          </select>
          
          {/* Document Type Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">{t('policies.filters.categoryAll')}</option>
            <option value="Security">{t('policies.categories.security')}</option>
            <option value="IT Operations">{t('policies.categories.itOperations')}</option>
            <option value="HR">{t('policies.categories.hr')}</option>
            <option value="Compliance">{t('policies.categories.compliance')}</option>
            <option value="Data Governance">{t('policies.categories.dataGovernance')}</option>
            <option value="Legal">{t('policies.categories.legal')}</option>
          </select>
          
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0 || exporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="text-body-sm font-medium">{exporting ? t('policies.exporting') : t('policies.exportCSV')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.document')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.type')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.category')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.version')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.status')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.approvedBy')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('policies.table.review')}</th>
                <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => {
                const reviewSoon = isReviewSoon(record.review_date)
                
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 text-body text-text-primary font-medium">{record.policy_name}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.category}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.category}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.version}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.approved_by || '-'}</td>
                    <td className="px-6 py-4">
                      {record.review_date ? (
                        <div className="flex items-center gap-2">
                          {reviewSoon && (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" title={t('policies.reviewSoon')} />
                          )}
                          <span className={`text-body ${reviewSoon ? 'text-yellow-400 font-medium' : 'text-text-secondary'}`}>
                            {new Date(record.review_date).toLocaleDateString('sl-SI')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-body text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                          title={t('policies.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title={t('policies.editPolicy')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                          title={t('policies.deletePolicy')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            {t('policies.noDocuments')}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <PoliciesAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        tableName="policies"
        title={t('policies.importTitle')}
        columns={['policy_name', 'category', 'category', 'version', 'status', 'content', 'approved_by', 'approval_date', 'review_date']}
        sampleData="policy_name;category;category;version;status;content;approved_by;approval_date;review_date\nPrimer dokumenta;policy;IT Security;1.0;draft;Vsebina dokumenta;Ime Priimek;2025-01-01;2025-12-01"
        onSuccess={handleSave}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedPolicy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetailModal() }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* HEADER - Sticky */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPolicy.policy_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">{t('policies.detailsSubtitle')}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseDetailModal} 
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="px-6 py-6 space-y-6">
              
              {/* Status & Type Badges */}
              <div className="flex flex-wrap gap-3">
                {selectedPolicy.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                )}
                
                {selectedPolicy.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {selectedPolicy.category}
                  </span>
                )}

                {isReviewSoon(selectedPolicy.review_date) && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('policies.reviewSoon')}
                  </span>
                )}
              </div>

              {/* Osnovne Informacije - Grid 2 stolpca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.documentId')}</div>
                  <div className="text-sm text-white font-mono">{selectedPolicy.policy_id || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.name')}</div>
                  <div className="text-sm text-white font-medium">{selectedPolicy.policy_name}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.documentType')}</div>
                  <div className="text-sm text-white">{selectedPolicy.category || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.category')}</div>
                  <div className="text-sm text-white">{selectedPolicy.category || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.version')}</div>
                  <div className="text-sm text-white font-medium">{selectedPolicy.version}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('policies.details.status')}</div>
                  <div className="text-sm text-white">{selectedPolicy.status}</div>
                </div>
              </div>

              {/* Vsebina dokumenta - Full width */}
              {selectedPolicy.content && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">{t('policies.details.content')}</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedPolicy.content}</div>
                </div>
              )}

              {/* Odobritev in Pregled - Grid 2 stolpca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPolicy.approved_by && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">{t('policies.details.approvedBy')}</div>
                    <div className="text-sm text-white">{selectedPolicy.approved_by}</div>
                  </div>
                )}
                
                {selectedPolicy.approval_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">{t('policies.details.approvalDate')}</div>
                    <div className="text-sm text-white">
                      {new Date(selectedPolicy.approval_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
                
                {selectedPolicy.review_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">{t('policies.details.reviewDate')}</div>
                    <div className={`text-sm font-medium ${isReviewSoon(selectedPolicy.review_date) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(selectedPolicy.review_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
              </div>

              {/* Metapodatki */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">{t('common.metadata')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t('common.id')}</div>
                    <div className="text-sm text-white font-mono break-all">{selectedPolicy.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t('common.createdAt')}</div>
                    <div className="text-sm text-white">
                      {new Date(selectedPolicy.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedPolicy.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t('common.updatedAt')}</div>
                      <div className="text-sm text-white">
                        {new Date(selectedPolicy.updated_at).toLocaleString('sl-SI')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER - Sticky */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700/50 px-6 py-4 flex justify-end">
              <button 
                onClick={handleCloseDetailModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingPolicy && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('policies.editTitle')}>
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="policy_name" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.policyName')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="policy_name"
                  value={editFormData.policy_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, policy_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.documentType')} <span className="text-status-error">*</span>
                </label>
                <select
                  id="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="policy">policy</option>
                  <option value="procedure">procedure</option>
                  <option value="guideline">guideline</option>
                  <option value="standard">standard</option>
                  <option value="form">form</option>
                  <option value="template">template</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.category')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.version')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="version"
                  value={editFormData.version}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, version: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.status')} <span className="text-status-error">*</span>
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="draft">draft</option>
                  <option value="under_review">under_review</option>
                  <option value="approved">approved</option>
                  <option value="active">active</option>
                  <option value="superseded">superseded</option>
                  <option value="expired">expired</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.content')}
                </label>
                <textarea
                  id="content"
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
              <div>
                <label htmlFor="approved_by" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.approvedBy')}
                </label>
                <input
                  type="text"
                  id="approved_by"
                  value={editFormData.approved_by}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, approved_by: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="approval_date" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.approvalDate')}
                </label>
                <input
                  type="date"
                  id="approval_date"
                  value={editFormData.approval_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, approval_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="review_date" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('policies.form.reviewDate')}
                </label>
                <input
                  type="date"
                  id="review_date"
                  value={editFormData.review_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, review_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('policies.deleteTitle')}
        message={t('policies.deleteMessage', { name: editingPolicy?.policy_name })}
        isDeleting={deleting}
      />
    </div>
  )
}
