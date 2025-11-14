import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Eye, X, Edit, Trash2, Download, Upload, Search } from 'lucide-react'
import TemplatesAddModal from '../modals/TemplatesAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import CSVImportModal from '../common/CSVImportModal'
import Modal from '../common/Modal'

export default function Templates() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    template_name: '',
    template_type: 'form',
    category: '',
    version: '',
    content: '',
    status: 'draft'
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, statusFilter, templateTypeFilter])

  const fetchRecords = async () => {
    try {
      const { data, error} = await supabase.from('templates').select('*').order('created_at', { ascending: false })
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
        r.template_name?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query) ||
        r.template_id?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Template type filter
    if (templateTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.template_type === templateTypeFilter)
    }

    setFilteredRecords(filtered)
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (template: any) => {
    setSelectedTemplate(template)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedTemplate(null)
  }

  const handleOpenEditModal = (template: any) => {
    setEditingTemplate(template)
    setEditFormData({
      template_name: template.template_name || '',
      template_type: template.template_type || 'form',
      category: template.category || '',
      version: template.version || '',
      content: template.content || '',
      status: template.status || 'draft',
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return
    
    setSaving(true)
    try {
      const updateData: any = {
        template_name: editFormData.template_name,
        template_type: editFormData.template_type,
        category: editFormData.category,
        version: editFormData.version,
        content: editFormData.content,
        status: editFormData.status
      }
      
      
      const { error } = await supabase
        .from('templates')
        .update(updateData)
        .eq('id', editingTemplate.id)
      
      if (error) throw error
      
      await handleSave()
      setIsEditModalOpen(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error updating document:', error)
      alert(t('templates.errors.update'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (template: any) => {
    setEditingTemplate(template)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingTemplate) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', editingTemplate.id)
      
      if (error) throw error
      
      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert(t('templates.errors.delete'))
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    setExporting(true)
    try {
      const headers = [
        t('templates.table.templateId'),
        t('templates.table.templateName'), 
        t('templates.table.templateType'),
        t('templates.table.category'),
        t('templates.table.version'),
        t('templates.table.status'),
        t('templates.table.content'),
        t('common.createdAt'),
        t('common.updatedAt')
      ]

      const rows = filteredRecords.map(record => [
        record.template_id || '-',
        record.template_name || '-',
        record.template_type ? getTemplateTypeText(record.template_type) : '-',
        record.category || '-',
        record.version || '-',
        record.status ? getStatusText(record.status) : '-',
        record.content ? record.content.replace(/[\r\n]+/g, ' ').replace(/;/g, ',') : '-',
        new Date(record.created_at).toLocaleString('sl-SI'),
        record.updated_at ? new Date(record.updated_at).toLocaleString('sl-SI') : '-'
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.join(';'))
        .join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${t('templates.exportFilename')}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export error:', error)
      alert(t('templates.errors.export'))
    } finally {
      setExporting(false)
    }
  }



  const getTemplateTypeText = (templateType: string) => {
    const typeMap: Record<string, string> = {
      'form': 'Obrazec',
      'report': 'Poročilo',
      'checklist': 'Kontrolni seznam',
      'contract': 'Pogodba',
      'other': 'Drugo'
    }
    return typeMap[templateType] || templateType
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Osnutek',
      'under_review': 'V pregledu',
      'approved': 'Odobreno',
      'active': 'Aktivno',
      'superseded': 'Zamenjano',
      'expired': 'Poteklo'
    }
    return statusMap[status] || status
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
            <h1 className="text-2xl font-bold text-text-primary">{t('templates.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('templates.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('templates.importCSV')}</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('templates.addTemplate')}</span>
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
              placeholder={t('templates.searchPlaceholder')}
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
            <option value="all">{t('templates.filters.statusAll')}</option>
            <option value="draft">{t('common.statusOptions.draft')}</option>
            <option value="approved">{t('common.statusOptions.approved')}</option>
            <option value="active">{t('common.statusOptions.active')}</option>
            <option value="archived">{t('common.statusOptions.archived')}</option>
          </select>
          
          {/* Document Type Filter */}
          <select
            value={templateTypeFilter}
            onChange={(e) => setTemplateTypeFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">{t('templates.filters.typeAll')}</option>
            <option value="form">{t('templates.types.form')}</option>
            <option value="report">{t('templates.types.report')}</option>
            <option value="checklist">{t('templates.types.checklist')}</option>
            <option value="contract">{t('templates.types.contract')}</option>
            <option value="other">{t('templates.types.other')}</option>
          </select>
          
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0 || exporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="text-body-sm font-medium">{exporting ? t('templates.exporting') : t('templates.exportCSV')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('templates.table.template')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('templates.table.type')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('templates.table.category')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('templates.table.version')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('templates.table.status')}</th>
                <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => {
                
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 text-body text-text-primary font-medium">{record.template_name}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{getTemplateTypeText(record.template_type)}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.category}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.version}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusBadge(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                          title="Podrobnosti predloge"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title="Uredi predlogo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                          title={t('templates.deleteTitle')}
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
            Ni najdenih dokumentov
          </div>
        )}
      </div>

      {/* Add Modal */}
      <TemplatesAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        tableName="templates"
        title={t('templates.importTitle')}
        columns={['template_name', 'template_type', 'category', 'version', 'status', 'content']}
        onSuccess={handleSave}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedTemplate && (
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
                  <h2 className="text-xl font-bold text-white">{selectedTemplate.template_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">Podrobnosti predloge</p>
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
                {selectedTemplate.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedTemplate.status)}`}>
                    {getStatusText(selectedTemplate.status)}
                  </span>
                )}
                
                {selectedTemplate.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {selectedTemplate.category}
                  </span>
                )}
              </div>

              {/* Osnovne Informacije - Grid 2 stolpca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.documentId')}</div>
                  <div className="text-sm text-white font-mono">{selectedTemplate.template_id || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.name')}</div>
                  <div className="text-sm text-white font-medium">{selectedTemplate.template_name}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.templateType')}</div>
                  <div className="text-sm text-white">{selectedTemplate.template_type ? getTemplateTypeText(selectedTemplate.template_type) : '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.category')}</div>
                  <div className="text-sm text-white">{selectedTemplate.category || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.version')}</div>
                  <div className="text-sm text-white font-medium">{selectedTemplate.version}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('templates.details.status')}</div>
                  <div className="text-sm text-white">{selectedTemplate.status ? getStatusText(selectedTemplate.status) : '-'}</div>
                </div>
              </div>

              {/* Vsebina dokumenta - Full width */}
              {selectedTemplate.content && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">{t('templates.details.content')}</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedTemplate.content}</div>
                </div>
              )}

              {/* Metapodatki */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">{t('common.metadata')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedTemplate.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">
                      {new Date(selectedTemplate.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedTemplate.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">
                        {new Date(selectedTemplate.updated_at).toLocaleString('sl-SI')}
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
      {isEditModalOpen && editingTemplate && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi predlogo">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="template_name" className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv dokumenta <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="template_name"
                  value={editFormData.template_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="template_type" className="block text-sm font-medium text-text-secondary mb-2">
                  Tip predloge <span className="text-status-error">*</span>
                </label>
                <select
                  id="template_type"
                  value={editFormData.template_type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, template_type: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="form">Obrazec</option>
                  <option value="report">Poročilo</option>
                  <option value="checklist">Kontrolni seznam</option>
                  <option value="contract">Pogodba</option>
                  <option value="other">Drugo</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  Kategorija <span className="text-status-error">*</span>
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
                  Verzija <span className="text-status-error">*</span>
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
                  Status <span className="text-status-error">*</span>
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="draft">Osnutek</option>
                  <option value="under_review">V pregledu</option>
                  <option value="approved">Odobreno</option>
                  <option value="active">Aktivno</option>
                  <option value="superseded">Zamenjano</option>
                  <option value="expired">Poteklo</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-2">
                  Vsebina
                </label>
                <textarea
                  id="content"
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
              >
                Prekliči
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? 'Shranjujem...' : 'Shrani'}
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
        title={t('templates.deleteTitle')}
        message={t('templates.deleteMessage', { name: editingTemplate?.template_name })}
        isDeleting={deleting}
      />
    </div>
  )
}
