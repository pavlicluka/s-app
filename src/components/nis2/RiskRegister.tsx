import React, { useState, useEffect } from 'react'
import { Plus, Search, Download, Eye, Edit, Trash2, Filter, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import NIS2RiskRegisterAddModal from '../modals/NIS2RiskRegisterAddModal'
import Modal from '../common/Modal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import jsPDF from 'jspdf'

interface RiskRegisterRecord {
  id: string
  risk_id: string
  risk_name: string
  category: string
  risk_description: string
  threat_source: string
  vulnerability: string
  affected_assets: string
  likelihood: number
  impact: number
  risk_score: number
  risk_level: string
  risk_owner: string
  current_controls: string | null
  treatment_strategy: string
  mitigation_actions: string | null
  treatment_status: string
  priority: string
  residual_likelihood: number | null
  residual_impact: number | null
  residual_risk_score: number | null
  residual_risk_level: string | null
  identified_date: string
  review_date: string | null
  target_closure_date: string | null
  last_reviewed: string | null
  comments: string | null
  created_at: string
  updated_at: string
}

interface FormData {
  risk_id: string
  risk_name: string
  category: string
  risk_description: string
  threat_source: string
  vulnerability: string
  affected_assets: string
  likelihood: number
  impact: number
  risk_owner: string
  current_controls: string
  treatment_strategy: string
  mitigation_actions: string
  treatment_status: string
  priority: string
  residual_likelihood: number | null
  residual_impact: number | null
  identified_date: string
  review_date: string
  target_closure_date: string
  last_reviewed: string
  comments: string
}

const RiskRegister: React.FC = () => {
  const { t } = useTranslation()
  const [records, setRecords] = useState<RiskRegisterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filters
  const [riskLevelFilter, setRiskLevelFilter] = useState('all')
  const [treatmentStatusFilter, setTreatmentStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Selected record for operations
  const [selectedRecord, setSelectedRecord] = useState<RiskRegisterRecord | null>(null)
  const [editFormData, setEditFormData] = useState<FormData | null>(null)
  
  // Loading states
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [exporting, setExporting] = useState(false)

  const generatePDF = async () => {
    setIsExportingPDF(true)
    try {
      const doc = new jsPDF()
      
      // Naslov
      doc.setFontSize(16)
      doc.text(`${t('nis2.riskRegister.title')} - NIS2 Control Dashboard`, 20, 20)
      
      // Datum generiranja
      doc.setFontSize(10)
      doc.text(`Generirano: ${new Date().toLocaleDateString('sl-SI')}`, 20, 30)
      
      // Pripravi podatke za tabelo
      const tableData = filteredRecords.map(risk => [
        risk.risk_id,
        risk.risk_name,
        risk.category,
        risk.risk_level,
        risk.likelihood.toString(),
        risk.impact.toString(),
        risk.risk_score.toString(),
        risk.treatment_status,
        risk.risk_owner,
        risk.identified_date
      ])
      
      // Dodaj tabelo (če je jspdf-autotable na voljo)
      // @ts-expect-error - jspdf-autotable tip
      if ((doc as any).autoTable) {
        (doc as any).autoTable({
          head: [['ID', 'Ime tveganja', 'Kategorija', 'Nivo', 'Verjetnost', 'Vpliv', 'Skor', 'Status', 'Lastnik', 'Datum']],
          body: tableData,
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        })
      } else {
        // Fallback - preprosta tabela brez jspdf-autotable
        let y = 50
        doc.setFontSize(8)
        
        // Headers
        const headers = ['ID', 'Ime tveganja', 'Kategorija', 'Nivo', 'Verjetnost', 'Vpliv', 'Skor', 'Status', 'Lastnik', 'Datum']
        headers.forEach((header, i) => {
          doc.text(header, 5 + (i * 18), y)
        })
        
        y += 10
        // Data
        tableData.forEach(row => {
          row.forEach((cell, i) => {
            doc.text(cell.toString(), 5 + (i * 18), y)
          })
          y += 8
        })
      }
      
      // Dodaj statistiko
      const totalRisks = filteredRecords.length
      const highRisks = filteredRecords.filter(r => r.risk_level === 'High' || r.risk_level === 'Critical').length
      const openRisks = filteredRecords.filter(r => r.treatment_status === 'Open').length
      
      doc.setFontSize(10)
      doc.text(`Skupaj tveganj: ${totalRisks}`, 20, doc.internal.pageSize.height - 20)
      doc.text(`Visoka tveganja: ${highRisks}`, 20, doc.internal.pageSize.height - 15)
      doc.text(`Odprta tveganja: ${openRisks}`, 20, doc.internal.pageSize.height - 10)
      
      // Shrani PDF
      doc.save(`evidenca-tveganj-${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Napaka pri generiranju PDF:', error)
      alert('Prišlo je do napake pri generiranju PDF.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('nis2_risk_register')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching risk register records:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter records based on search term and filters
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.risk_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.risk_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.risk_owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.risk_description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRiskLevel = riskLevelFilter === 'all' || record.risk_level === riskLevelFilter
    const matchesTreatmentStatus = treatmentStatusFilter === 'all' || record.treatment_status === treatmentStatusFilter
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter
    
    return matchesSearch && matchesRiskLevel && matchesTreatmentStatus && matchesCategory
  })

  // Get risk level badge styling
  const getRiskLevelBadge = (level: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium inline-flex items-center"
    switch (level) {
      case 'Critical':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'High':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'Medium':
        return `${baseClasses} text-yellow-500 bg-yellow-500/10`
      case 'Low':
        return `${baseClasses} text-green-500 bg-green-500/10`
      default:
        return `${baseClasses} text-gray-500 bg-gray-500/10`
    }
  }

  // Get risk level label in Slovenian
  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'Critical': return 'Kritično'
      case 'High': return 'Visoko'
      case 'Medium': return 'Srednje'
      case 'Low': return 'Nizko'
      default: return level
    }
  }

  // Get category badge styling with appropriate colors
  const getCategoryBadge = (category: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (category) {
      case 'Operational':
        return `${baseClasses} text-blue-500 bg-blue-500/10`
      case 'Technical':
        return `${baseClasses} text-emerald-500 bg-emerald-500/10`
      case 'Strategic':
        return `${baseClasses} text-orange-500 bg-orange-500/10`
      case 'Compliance':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'Financial':
        return `${baseClasses} text-yellow-500 bg-yellow-500/10`
      case 'Reputational':
        return `${baseClasses} text-gray-500 bg-gray-500/10`
      case 'Supply Chain':
        return `${baseClasses} text-purple-500 bg-purple-500/10`
      case 'Human Resources':
        return `${baseClasses} text-pink-500 bg-pink-500/10`
      case 'Cyber':
        return `${baseClasses} text-red-600 bg-red-600/10`
      default:
        return `${baseClasses} text-gray-500 bg-gray-500/10`
    }
  }

  // Get treatment status label in Slovenian
  const getTreatmentStatusLabel = (status: string) => {
    switch (status) {
      case 'Open': return 'Odprto'
      case 'In Progress': return 'V delu'
      case 'Implemented': return 'Implementirano'
      case 'Accepted': return 'Sprejeto'
      case 'Closed': return 'Zaprto'
      default: return status
    }
  }

  // Get treatment status value for form (reverse mapping from Slovenian to English)
  const getTreatmentStatusValue = (label: string) => {
    switch (label) {
      case 'Odprto': return 'Open'
      case 'V delu': return 'In Progress'
      case 'Implementirano': return 'Implemented'
      case 'Sprejeto': return 'Accepted'
      case 'Zaprto': return 'Closed'
      default: return label
    }
  }

  // Get category label in Slovenian
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Operational': return 'Operativno'
      case 'Technical': return 'Tehnično'
      case 'Strategic': return 'Strateško'
      case 'Compliance': return 'Skladnost'
      case 'Financial': return 'Finančno'
      case 'Reputational': return 'Reputacijsko'
      case 'Supply Chain': return 'Dobavna veriga'
      case 'Human Resources': return 'Človeški viri'
      case 'Cyber': return 'Kibernetsko'
      default: return category
    }
  }

  // Get category value for form (reverse mapping from Slovenian to English)
  const getCategoryValue = (label: string) => {
    switch (label) {
      case 'Operativno': return 'Operational'
      case 'Tehnično': return 'Technical'
      case 'Strateško': return 'Strategic'
      case 'Skladnost': return 'Compliance'
      case 'Finančno': return 'Financial'
      case 'Reputacijsko': return 'Reputational'
      case 'Dobavna veriga': return 'Supply Chain'
      case 'Človeški viri': return 'Human Resources'
      case 'Kibernetsko': return 'Cyber'
      default: return label
    }
  }

  // Get treatment status icon
  const getTreatmentStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="w-4 h-4" />
      case 'In Progress': return <Clock className="w-4 h-4" />
      case 'Implemented': return <CheckCircle className="w-4 h-4" />
      case 'Accepted': return <CheckCircle className="w-4 h-4" />
      case 'Closed': return <CheckCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Get treatment status badge styling
  const getTreatmentStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'Open':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'In Progress':
        return `${baseClasses} text-yellow-500 bg-yellow-500/10`
      case 'Implemented':
        return `${baseClasses} text-green-500 bg-green-500/10`
      case 'Accepted':
        return `${baseClasses} text-green-500 bg-green-500/10`
      case 'Closed':
        return `${baseClasses} text-gray-500 bg-gray-500/10`
      default:
        return `${baseClasses} text-gray-500 bg-gray-500/10`
    }
  }

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    switch (priority) {
      case 'Critical':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'High':
        return `${baseClasses} text-red-500 bg-red-500/10`
      case 'Medium':
        return `${baseClasses} text-yellow-500 bg-yellow-500/10`
      case 'Low':
        return `${baseClasses} text-green-500 bg-green-500/10`
      default:
        return `${baseClasses} text-gray-500 bg-gray-500/10`
    }
  }

  // Get priority label in Slovenian
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'Kritično'
      case 'High': return 'Visoko'
      case 'Medium': return 'Srednje'
      case 'Low': return 'Nizko'
      default: return priority
    }
  }

  // Check if review date is soon (within 30 days from 2025-11-01)
  const isReviewSoon = (reviewDateStr: string | null) => {
    if (!reviewDateStr) return false
    const today = new Date('2025-11-01')
    const reviewDate = new Date(reviewDateStr)
    const daysUntilReview = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilReview > 0 && daysUntilReview <= 30
  }

  // Handle CSV Export
  const handleExportCSV = () => {
    setExporting(true)
    
    try {
      const headers = [
        'Risk ID', 'Risk Name', 'Category', 'Risk Description', 'Threat Source', 'Vulnerability',
        'Affected Assets', 'Likelihood', 'Impact', 'Risk Score', 'Risk Level', 'Risk Owner',
        'Current Controls', 'Treatment Strategy', 'Mitigation Actions', 'Treatment Status',
        'Priority', 'Residual Likelihood', 'Residual Impact', 'Residual Risk Score',
        'Residual Risk Level', 'Identified Date', 'Review Date', 'Target Closure Date',
        'Last Reviewed', 'Comments', 'Created At', 'Updated At'
      ]
      
      const csvContent = [
        headers.join(';'),
        ...filteredRecords.map(record => [
          record.risk_id,
          record.risk_name,
          record.category,
          record.risk_description,
          record.threat_source,
          record.vulnerability,
          record.affected_assets,
          record.likelihood,
          record.impact,
          record.risk_score,
          record.risk_level,
          record.risk_owner,
          record.current_controls || '',
          record.treatment_strategy,
          record.mitigation_actions || '',
          record.treatment_status,
          record.priority,
          record.residual_likelihood || '',
          record.residual_impact || '',
          record.residual_risk_score || '',
          record.residual_risk_level || '',
          record.identified_date,
          record.review_date || '',
          record.target_closure_date || '',
          record.last_reviewed || '',
          record.comments || '',
          new Date(record.created_at).toLocaleDateString('sl-SI'),
          new Date(record.updated_at).toLocaleDateString('sl-SI')
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `NIS2_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  // Handle view details
  const handleViewDetails = (record: RiskRegisterRecord) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  // Handle edit
  const handleOpenEditModal = (record: RiskRegisterRecord) => {
    setSelectedRecord(record)
    setEditFormData({
      risk_id: record.risk_id,
      risk_name: record.risk_name,
      category: record.category,
      risk_description: record.risk_description,
      threat_source: record.threat_source,
      vulnerability: record.vulnerability,
      affected_assets: record.affected_assets,
      likelihood: record.likelihood,
      impact: record.impact,
      risk_owner: record.risk_owner,
      current_controls: record.current_controls || '',
      treatment_strategy: record.treatment_strategy,
      mitigation_actions: record.mitigation_actions || '',
      treatment_status: record.treatment_status,
      priority: record.priority,
      residual_likelihood: record.residual_likelihood,
      residual_impact: record.residual_impact,
      identified_date: record.identified_date,
      review_date: record.review_date || '',
      target_closure_date: record.target_closure_date || '',
      last_reviewed: record.last_reviewed || '',
      comments: record.comments || ''
    })
    setIsEditModalOpen(true)
  }

  // Handle update
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord || !editFormData) return

    setSaving(true)
    try {
      // Calculate risk scores and levels
      const risk_score = editFormData.likelihood * editFormData.impact
      const risk_level = risk_score >= 21 ? 'Critical' : 
                        risk_score >= 13 ? 'High' : 
                        risk_score >= 7 ? 'Medium' : 'Low'
      
      const residual_risk_score = editFormData.residual_likelihood && editFormData.residual_impact ?
        editFormData.residual_likelihood * editFormData.residual_impact : null
      
      const residual_risk_level = residual_risk_score ? 
        (residual_risk_score >= 21 ? 'Critical' : 
         residual_risk_score >= 13 ? 'High' : 
         residual_risk_score >= 7 ? 'Medium' : 'Low') : null

      const { error } = await supabase
        .from('nis2_risk_register')
        .update({
          ...editFormData,
          risk_score,
          risk_level,
          residual_risk_score,
          residual_risk_level,
          // Convert empty strings to null for optional fields
          review_date: editFormData.review_date || null,
          target_closure_date: editFormData.target_closure_date || null,
          last_reviewed: editFormData.last_reviewed || null,
          comments: editFormData.comments || null,
          current_controls: editFormData.current_controls || null,
          mitigation_actions: editFormData.mitigation_actions || null
        })
        .eq('id', selectedRecord.id)

      if (error) throw error

      await fetchRecords()
      setIsEditModalOpen(false)
      setSelectedRecord(null)
      setEditFormData(null)
    } catch (error) {
      console.error('Error updating record:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleOpenDeleteModal = (record: RiskRegisterRecord) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedRecord) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('nis2_risk_register')
        .delete()
        .eq('id', selectedRecord.id)

      if (error) throw error

      await fetchRecords()
      setIsDeleteModalOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error('Error deleting record:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editFormData) return

    const { name, value } = e.target
    
    // Handle numeric fields
    if (['likelihood', 'impact', 'residual_likelihood', 'residual_impact'].includes(name)) {
      const numValue = value === '' ? null : parseInt(value)
      setEditFormData(prev => prev ? { ...prev, [name]: numValue } : null)
    } else {
      setEditFormData(prev => prev ? { ...prev, [name]: value } : null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Nalagam evidenco tveganj...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('nis2.riskRegister.title')}
          </h1>
          <p className="text-text-tertiary mt-1">
            {t('nis2.riskRegister.description')}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj tveganje
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Iskanje po ID, naslovu, lastniku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskLevelFilter}
            onChange={(e) => setRiskLevelFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="all">Vsi nivoji</option>
            <option value="Low">Nizko</option>
            <option value="Medium">Srednje</option>
            <option value="High">Visoko</option>
            <option value="Critical">Kritično</option>
          </select>

          {/* Treatment Status Filter */}
          <select
            value={treatmentStatusFilter}
            onChange={(e) => setTreatmentStatusFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="all">Vsi statusi</option>
            <option value="Open">Odprto</option>
            <option value="In Progress">V delu</option>
            <option value="Implemented">Implementirano</option>
            <option value="Accepted">Sprejeto</option>
            <option value="Closed">Zaprto</option>
          </select>

          {/* Clear Filters and Export */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setRiskLevelFilter('all')
                setTreatmentStatusFilter('all')
                setCategoryFilter('all')
              }}
              className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              Počisti filter
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting || filteredRecords.length === 0}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-subtle">
              <tr>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.riskId')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.riskName')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.category')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.riskLevel')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.riskScore')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.treatmentStatus')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.priority')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.riskOwner')}</th>
                <th className="text-left p-4 text-text-secondary font-medium">{t('nis2.riskRegister.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-tertiary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-tertiary">
                    {searchTerm || riskLevelFilter !== 'all' || treatmentStatusFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Nobeno tveganje ne ustreza izbranim filtrom.'
                      : 'Ni najdenih tveganj'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border-subtle hover:bg-bg-near-black transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-text-primary">{record.risk_id}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-text-primary font-medium">{record.risk_name}</div>
                      <div className="text-text-tertiary text-sm mt-1">{record.risk_description.substring(0, 100)}...</div>
                    </td>
                    <td className="p-4">
                      <span className={getCategoryBadge(record.category)}>
                        {getCategoryLabel(record.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={getRiskLevelBadge(record.risk_level)}>
                        {record.risk_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary font-medium">{record.risk_score}</span>
                    </td>
                    <td className="p-4">
                      <span className={getTreatmentStatusBadge(record.treatment_status)}>
                        {getTreatmentStatusIcon(record.treatment_status)}
                        {getTreatmentStatusLabel(record.treatment_status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={getPriorityBadge(record.priority)}>
                        {record.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">{record.risk_owner}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                          title="Podrobnosti"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="text-yellow-500 hover:text-yellow-400 transition-colors"
                          title="Uredi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Izbriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <NIS2RiskRegisterAddModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRecords}
      />

      {/* Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedRecord.risk_name}
        >
          <div className="space-y-6">
            {/* Risk Level and Status Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={getRiskLevelBadge(selectedRecord.risk_level)}>
                {getRiskLevelLabel(selectedRecord.risk_level)} Tveganje
              </span>
              <span className={getTreatmentStatusBadge(selectedRecord.treatment_status)}>
                {getTreatmentStatusIcon(selectedRecord.treatment_status)}
                {getTreatmentStatusLabel(selectedRecord.treatment_status)}
              </span>
              <span className={getPriorityBadge(selectedRecord.priority)}>
                {getPriorityLabel(selectedRecord.priority)} Prioriteta
              </span>
              {isReviewSoon(selectedRecord.review_date) && (
                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Pregled potreben kmalu
                </span>
              )}
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Osnovne informacije</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Risk ID</label>
                  <p className="text-text-primary font-mono">{selectedRecord.risk_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Kategorija</label>
                  <p className="text-text-primary">{getCategoryLabel(selectedRecord.category)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Vir grožnje</label>
                  <p className="text-text-primary">{selectedRecord.threat_source}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Lastnik tveganja</label>
                  <p className="text-text-primary">{selectedRecord.risk_owner}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Verjetnost</label>
                  <p className="text-text-primary">{selectedRecord.likelihood}/5</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Vpliv</label>
                  <p className="text-text-primary">{selectedRecord.impact}/5</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Ocena tveganja</label>
                  <p className="text-text-primary font-medium">{selectedRecord.risk_score}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Strategija obravnavanja</label>
                  <p className="text-text-primary">{selectedRecord.treatment_strategy}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Opis tveganja</h4>
              <p className="text-text-primary whitespace-pre-wrap">{selectedRecord.risk_description}</p>
            </div>

            {/* Vulnerability and Affected Assets */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Ranljivost in prizadeti sistemi</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Ranljivost</label>
                  <p className="text-text-primary">{selectedRecord.vulnerability}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Prizadeti sistemi</label>
                  <p className="text-text-primary">{selectedRecord.affected_assets}</p>
                </div>
              </div>
            </div>

            {/* Risk Treatment */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Obravnavanje tveganja</h4>
              <div className="space-y-3">
                {selectedRecord.current_controls && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Trenutni nadzori</label>
                    <p className="text-text-primary whitespace-pre-wrap">{selectedRecord.current_controls}</p>
                  </div>
                )}
                {selectedRecord.mitigation_actions && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Ukrepi za zmanjšanje</label>
                    <p className="text-text-primary whitespace-pre-wrap">{selectedRecord.mitigation_actions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Residual Risk */}
            {(selectedRecord.residual_likelihood && selectedRecord.residual_impact) && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3">Preostan rizik</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Preostana verjetnost</label>
                    <p className="text-text-primary">{selectedRecord.residual_likelihood}/5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Preostan vpliv</label>
                    <p className="text-text-primary">{selectedRecord.residual_impact}/5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Preostan rizik</label>
                    <p className="text-text-primary font-medium">{selectedRecord.residual_risk_score}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nivo preostanka</label>
                    <span className={getRiskLevelBadge(selectedRecord.residual_risk_level || '')}>
                      {getRiskLevelLabel(selectedRecord.residual_risk_level || '')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Časovnica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Datum identifikacije</label>
                  <p className="text-text-primary">{new Date(selectedRecord.identified_date).toLocaleDateString('sl-SI')}</p>
                </div>
                {selectedRecord.review_date && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Datum pregleda</label>
                    <p className={isReviewSoon(selectedRecord.review_date) ? 'text-yellow-400' : 'text-text-primary'}>
                      {new Date(selectedRecord.review_date).toLocaleDateString('sl-SI')}
                    </p>
                  </div>
                )}
                {selectedRecord.target_closure_date && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Ciljni datum zaključka</label>
                    <p className="text-text-primary">{new Date(selectedRecord.target_closure_date).toLocaleDateString('sl-SI')}</p>
                  </div>
                )}
                {selectedRecord.last_reviewed && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Zadnji pregled</label>
                    <p className="text-text-primary">{new Date(selectedRecord.last_reviewed).toLocaleDateString('sl-SI')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            {selectedRecord.comments && (
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-3">Komentarji</h4>
                <p className="text-text-primary whitespace-pre-wrap">{selectedRecord.comments}</p>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Metapodatki</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Ustvarjeno</label>
                  <p className="text-text-primary">{new Date(selectedRecord.created_at).toLocaleDateString('sl-SI')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Posodobljeno</label>
                  <p className="text-text-primary">{new Date(selectedRecord.updated_at).toLocaleDateString('sl-SI')}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editFormData && selectedRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Uredi tveganje"
        >
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Risk ID</label>
                <input
                  type="text"
                  name="risk_id"
                  value={editFormData.risk_id}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Kategorija</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                >
                  <option value="Operational">Operativno</option>
                  <option value="Technical">Tehnično</option>
                  <option value="Strategic">Strateško</option>
                  <option value="Compliance">Skladnost</option>
                  <option value="Financial">Finančno</option>
                  <option value="Reputational">Reputacijsko</option>
                  <option value="Supply Chain">Dobavna veriga</option>
                  <option value="Human Resources">Človeški viri</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">Naziv tveganja</label>
                <input
                  type="text"
                  name="risk_name"
                  value={editFormData.risk_name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">Opis tveganja</label>
                <textarea
                  name="risk_description"
                  value={editFormData.risk_description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Verjetnost (1-5)</label>
                <select
                  name="likelihood"
                  value={editFormData.likelihood}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                >
                  <option value={1}>1 - Zelo nizka</option>
                  <option value={2}>2 - Nizka</option>
                  <option value={3}>3 - Srednja</option>
                  <option value={4}>4 - Visoka</option>
                  <option value={5}>5 - Zelo visoka</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Vpliv (1-5)</label>
                <select
                  name="impact"
                  value={editFormData.impact}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                >
                  <option value={1}>1 - Zelo nizek</option>
                  <option value={2}>2 - Nizek</option>
                  <option value={3}>3 - Srednji</option>
                  <option value={4}>4 - Visok</option>
                  <option value={5}>5 - Zelo visok</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Lastnik tveganja</label>
                <input
                  type="text"
                  name="risk_owner"
                  value={editFormData.risk_owner}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Status obravnavanja</label>
                <select
                  name="treatment_status"
                  value={editFormData.treatment_status}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  required
                >
                  <option value="Open">Odprto</option>
                  <option value="In Progress">V delu</option>
                  <option value="Implemented">Implementirano</option>
                  <option value="Accepted">Sprejeto</option>
                  <option value="Closed">Zaprto</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Prekliči
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-accent-primary/50 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? 'Shranjujem...' : 'Shrani spremembe'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Izbriši tveganje"
        message={`Ali ste prepričani, da želite izbrisati tveganje "${selectedRecord?.risk_name || ''}"?`}
        isDeleting={deleting}
      />
    </div>
  )
}

export default RiskRegister