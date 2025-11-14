import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Eye, X, Edit, Trash2, Download, Upload, Search, AlertTriangle } from 'lucide-react'
import ProceduresDocumentsAddModal from '../modals/ProceduresDocumentsAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import CSVImportModal from '../common/CSVImportModal'
import Modal from '../common/Modal'

export default function ProceduresDocuments() {
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    document_name: '',
    document_type: 'policy',
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
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, statusFilter, documentTypeFilter])

  const fetchRecords = async () => {
    try {
      const { data, error} = await supabase.from('procedures_documents').select('*').order('created_at', { ascending: false })
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
        r.document_name?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query) ||
        r.document_id?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.document_type === documentTypeFilter)
    }

    setFilteredRecords(filtered)
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (document: any) => {
    setSelectedDocument(document)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedDocument(null)
  }

  const handleOpenEditModal = (document: any) => {
    setEditingDocument(document)
    setEditFormData({
      document_name: document.document_name || '',
      document_type: document.document_type || 'policy',
      category: document.category || '',
      version: document.version || '',
      content: document.content || '',
      status: document.status || 'draft',
      approved_by: document.approved_by || '',
      approval_date: document.approval_date ? new Date(document.approval_date).toISOString().split('T')[0] : '',
      review_date: document.review_date ? new Date(document.review_date).toISOString().split('T')[0] : ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDocument) return
    
    setSaving(true)
    try {
      const updateData: any = {
        document_name: editFormData.document_name,
        document_type: editFormData.document_type,
        category: editFormData.category,
        version: editFormData.version,
        content: editFormData.content,
        status: editFormData.status
      }
      
      if (editFormData.approved_by) updateData.approved_by = editFormData.approved_by
      if (editFormData.approval_date) updateData.approval_date = editFormData.approval_date
      if (editFormData.review_date) updateData.review_date = editFormData.review_date
      
      const { error } = await supabase
        .from('procedures_documents')
        .update(updateData)
        .eq('id', editingDocument.id)
      
      if (error) throw error
      
      await handleSave()
      setIsEditModalOpen(false)
      setEditingDocument(null)
    } catch (error) {
      console.error('Error updating document:', error)
      alert('Napaka pri posodabljanju dokumenta')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (document: any) => {
    setEditingDocument(document)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingDocument) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('procedures_documents')
        .delete()
        .eq('id', editingDocument.id)
      
      if (error) throw error
      
      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingDocument(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Napaka pri brisanju dokumenta')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    setExporting(true)
    try {
      const headers = [
        'Document ID',
        'Document Name', 
        'Document Type',
        'Category',
        'Version',
        'Status',
        'Content',
        'Approved By',
        'Approval Date',
        'Review Date',
        'Created At',
        'Updated At'
      ]

      const rows = filteredRecords.map(record => [
        record.document_id || '-',
        record.document_name || '-',
        record.document_type || '-',
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
      link.download = `Procedures_Documents_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export error:', error)
      alert('Napaka pri izvozu CSV')
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
            <h1 className="text-2xl font-bold text-text-primary">Procesi in dokumenti</h1>
            <p className="text-body-sm text-text-secondary">Poslovni postopki in navodila</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">Nov dokument</span>
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
              placeholder="Išči po nazivu, kategoriji, ID-ju..."
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
            <option value="all">Status: Vsi</option>
            <option value="draft">draft</option>
            <option value="under_review">under_review</option>
            <option value="approved">approved</option>
            <option value="active">active</option>
            <option value="superseded">superseded</option>
            <option value="expired">expired</option>
          </select>
          
          {/* Document Type Filter */}
          <select
            value={documentTypeFilter}
            onChange={(e) => setDocumentTypeFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">Tip: Vsi</option>
            <option value="policy">policy</option>
            <option value="procedure">procedure</option>
            <option value="guideline">guideline</option>
            <option value="standard">standard</option>
            <option value="form">form</option>
            <option value="template">template</option>
            <option value="other">other</option>
          </select>
          
          {/* Import/Export Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-150 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="text-body-sm font-medium">Uvozi CSV</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0 || exporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="text-body-sm font-medium">{exporting ? 'Izvažam...' : 'Izvozi CSV'}</span>
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="text-body-sm font-medium">Izvozi PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dokument</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Kategorija</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Verzija</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Odobril</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Pregled</th>
                <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => {
                const reviewSoon = isReviewSoon(record.review_date)
                
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 text-body text-text-primary font-medium">{record.document_name}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.document_type}</td>
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
                            <AlertTriangle className="w-4 h-4 text-yellow-400" title="Pregled potreben kmalu" />
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
                          title="Podrobnosti dokumenta"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title="Uredi dokument"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                          title="Izbriši dokument"
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
      <ProceduresDocumentsAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        tableName="procedures_documents"
        title="Uvoz dokumentov"
        columns={['document_name', 'document_type', 'category', 'version', 'status', 'content', 'approved_by', 'approval_date', 'review_date']}
        sampleData="document_name;document_type;category;version;status;content;approved_by;approval_date;review_date\nPrimer dokumenta;policy;IT Security;1.0;draft;Vsebina dokumenta;Ime Priimek;2025-01-01;2025-12-01"
        onSuccess={handleSave}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedDocument && (
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
                  <h2 className="text-xl font-bold text-white">{selectedDocument.document_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">Podrobnosti dokumenta</p>
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
                {selectedDocument.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedDocument.status)}`}>
                    {selectedDocument.status}
                  </span>
                )}
                
                {selectedDocument.document_type && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {selectedDocument.document_type}
                  </span>
                )}

                {isReviewSoon(selectedDocument.review_date) && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Pregled potreben kmalu
                  </span>
                )}
              </div>

              {/* Osnovne Informacije - Grid 2 stolpca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">ID Dokumenta</div>
                  <div className="text-sm text-white font-mono">{selectedDocument.document_id || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Naziv</div>
                  <div className="text-sm text-white font-medium">{selectedDocument.document_name}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Tip dokumenta</div>
                  <div className="text-sm text-white">{selectedDocument.document_type || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Kategorija</div>
                  <div className="text-sm text-white">{selectedDocument.category || '-'}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Verzija</div>
                  <div className="text-sm text-white font-medium">{selectedDocument.version}</div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <div className="text-sm text-white">{selectedDocument.status}</div>
                </div>
              </div>

              {/* Vsebina dokumenta - Full width */}
              {selectedDocument.content && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Vsebina dokumenta</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedDocument.content}</div>
                </div>
              )}

              {/* Odobritev in Pregled - Grid 2 stolpca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDocument.approved_by && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Odobril</div>
                    <div className="text-sm text-white">{selectedDocument.approved_by}</div>
                  </div>
                )}
                
                {selectedDocument.approval_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum odobritve</div>
                    <div className="text-sm text-white">
                      {new Date(selectedDocument.approval_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
                
                {selectedDocument.review_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum pregleda</div>
                    <div className={`text-sm font-medium ${isReviewSoon(selectedDocument.review_date) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(selectedDocument.review_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
              </div>

              {/* Metapodatki */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedDocument.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">
                      {new Date(selectedDocument.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedDocument.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">
                        {new Date(selectedDocument.updated_at).toLocaleString('sl-SI')}
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
                Zapri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingDocument && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi dokument">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="document_name" className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv dokumenta <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="document_name"
                  value={editFormData.document_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, document_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-text-secondary mb-2">
                  Tip dokumenta <span className="text-status-error">*</span>
                </label>
                <select
                  id="document_type"
                  value={editFormData.document_type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, document_type: e.target.value }))}
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
              <div>
                <label htmlFor="approved_by" className="block text-sm font-medium text-text-secondary mb-2">
                  Odobril
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
                  Datum odobritve
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
                  Datum pregleda
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
        title="Izbriši dokument"
        message={`Ali ste prepričani, da želite izbrisati dokument "${editingDocument?.document_name}"? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />
    </div>
  )
}
