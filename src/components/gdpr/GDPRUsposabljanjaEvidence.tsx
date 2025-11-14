import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { 
  User, Plus, Edit, Trash2, Download, Search, Filter, 
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  BookOpen, Award, FileText, Eye
} from 'lucide-react'
import GDPRUsposabljanjaEvidenceAddModal from '../modals/GDPRUsposabljanjaEvidenceAddModal'

interface TrainingRecord {
  id: string
  participant_name: string
  participant_email?: string
  participant_department?: string
  training_date: string
  training_type: 'gdpr_basic' | 'gdpr_advanced' | 'zvop2' | 'security_awareness' | 'data_breach_response' | 'privacy_by_design' | 'other'
  training_title: string
  instructor_name?: string
  instructor_email?: string
  training_duration: number
  training_location?: string
  training_format?: 'online' | 'in_person' | 'hybrid' | 'self_study'
  training_provider?: string
  training_cost?: number
  completion_status: 'planned' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  completion_date?: string
  certificate_issued: boolean
  certificate_number?: string
  certificate_date?: string
  certificate_expiry_date?: string
  assessment_type?: 'none' | 'quiz' | 'practical' | 'exam' | 'project'
  assessment_score?: number
  passed?: boolean
  training_goals?: string
  key_topics_covered?: string
  practical_applications?: string
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_description?: string
  dpo_specific_training: boolean
  dpo_training_content?: string
  supervisory_authority_contact?: string
  compliance_category?: string
  legal_requirement?: string
  training_frequency?: string
  last_training_date?: string
  next_training_due?: string
  training_materials_url?: string
  attendance_sheet_url?: string
  certificate_url?: string
  additional_documents?: string
  status: 'active' | 'inactive' | 'expired' | 'superseded'
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_by?: string
  verification_date?: string
  notes?: string
  created_at: string
}

export default function GDPRUsposabljanjaEvidence() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trainingTypeFilter, setTrainingTypeFilter] = useState('all')
  const [completionStatusFilter, setCompletionStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editRecord, setEditRecord] = useState<TrainingRecord | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_training_evidence')
        .select('*')
        .order('training_date', { ascending: false })
      if (error) throw error
      setRecords(data || [])
      setFilteredRecords(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtriranje in iskanje
  useEffect(() => {
    let filtered = records

    // Iskanje po imenu, emailu ali naslovu
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.training_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtriranje po statusu
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Filtriranje po tipu usposabljanja
    if (trainingTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.training_type === trainingTypeFilter)
    }

    // Filtriranje po statusu dokončanja
    if (completionStatusFilter !== 'all') {
      filtered = filtered.filter(record => record.completion_status === completionStatusFilter)
    }

    setFilteredRecords(filtered)
    setCurrentPage(1)
  }, [records, searchTerm, statusFilter, trainingTypeFilter, completionStatusFilter])

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gdpr_training_evidence')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleEdit = (record: TrainingRecord) => {
    setEditRecord(record)
    setShowEditModal(true)
  }

  const handleViewDetails = (record: TrainingRecord) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditRecord(null)
    setShowEditModal(false)
    setSelectedRecord(null)
    setShowDetails(false)
  }

  const handleSave = () => {
    fetchRecords()
    handleCloseModal()
  }

  // Paginacija
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)

  const getCompletionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'planned':
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getCompletionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-bg-surface-elevated text-status-success border border-border-subtle'
      case 'in_progress':
        return 'bg-bg-surface-elevated text-status-warning border border-border-subtle'
      case 'failed':
        return 'bg-bg-surface-elevated text-status-error border border-border-subtle'
      case 'planned':
        return 'bg-bg-surface-elevated text-accent-primary border border-border-subtle'
      default:
        return 'bg-bg-surface-elevated text-text-secondary border border-border-subtle'
    }
  }

  const getTrainingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      gdpr_basic: 'GDPR Osnovno',
      gdpr_advanced: 'GDPR Napredno',
      zvop2: 'ZVOP-2',
      security_awareness: 'Varnostna ozaveščenost',
      data_breach_response: 'Odziv na kršitve',
      privacy_by_design: 'Varstvo podatkov po zasnovi',
      other: 'Drugo'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sl-SI')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t('gdpr.usposabljanja.title', 'Evidence usposabljanj')}
        </h1>
        <p className="text-text-secondary">
          {t('gdpr.usposabljanja.subtitle', 'GDPR in ZVOP-2 - Evidenca usposabljanj in certifikatov')}
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Iskanje */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder={t('gdpr.usposabljanja.searchPlaceholder', 'Išči po udeležencu, emailu ali naslovu...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-border-subtle bg-bg-surface-hover rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
            />
          </div>

          {/* Filtri */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border-subtle bg-bg-surface-hover rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
            >
              <option value="all">{t('common.all', 'Vsi')}</option>
              <option value="active">{t('common.active', 'Aktiven')}</option>
              <option value="inactive">{t('common.inactive', 'Neaktiven')}</option>
              <option value="expired">{t('common.expired', 'Poteklo')}</option>
            </select>

            <select
              value={trainingTypeFilter}
              onChange={(e) => setTrainingTypeFilter(e.target.value)}
              className="px-3 py-2 border border-border-subtle bg-bg-surface-hover rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
            >
              <option value="all">{t('gdpr.usposabljanja.allTrainingTypes', 'Vsi tipi usposabljanj')}</option>
              <option value="gdpr_basic">GDPR Osnovno</option>
              <option value="gdpr_advanced">GDPR Napredno</option>
              <option value="zvop2">ZVOP-2</option>
              <option value="security_awareness">Varnostna ozaveščenost</option>
              <option value="data_breach_response">Odziv na kršitve</option>
              <option value="privacy_by_design">Varstvo podatkov po zasnovi</option>
              <option value="other">Drugo</option>
            </select>

            <select
              value={completionStatusFilter}
              onChange={(e) => setCompletionStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border-subtle bg-bg-surface-hover rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
            >
              <option value="all">{t('gdpr.usposabljanja.allCompletionStatuses', 'Vsi statusi')}</option>
              <option value="planned">{t('gdpr.usposabljanja.planned', 'Načrtovano')}</option>
              <option value="in_progress">{t('gdpr.usposabljanja.inProgress', 'V teku')}</option>
              <option value="completed">{t('gdpr.usposabljanja.completed', 'Zaključeno')}</option>
              <option value="failed">{t('gdpr.usposabljanja.failed', 'Neuspešno')}</option>
              <option value="cancelled">{t('gdpr.usposabljanja.cancelled', 'Preklicano')}</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary-hover transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('gdpr.usposabljanja.addTraining', 'Dodaj usposabljanje')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle">
            <thead className="bg-bg-surface-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.participant', 'Udeleženec')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.trainingTitle', 'Naslov usposabljanja')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.trainingType', 'Tip usposabljanja')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.trainingDate', 'Datum usposabljanja')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.completionStatus', 'Status dokončanja')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('gdpr.usposabljanja.certificate', 'Certifikat')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('common.actions', 'Akcije')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-surface divide-y divide-border-subtle">
              {currentItems.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-text-muted mr-3" />
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {record.participant_name}
                        </div>
                        {record.participant_email && (
                          <div className="text-sm text-text-secondary">
                            {record.participant_email}
                          </div>
                        )}
                        {record.participant_department && (
                          <div className="text-xs text-text-muted">
                            {record.participant_department}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">{record.training_title}</div>
                    {record.instructor_name && (
                      <div className="text-sm text-text-secondary">
                        {t('gdpr.usposabljanja.instructor', 'Inštruktor')}: {record.instructor_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {getTrainingTypeLabel(record.training_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatDate(record.training_date)}
                    {record.training_duration && (
                      <div className="text-sm text-text-secondary">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {record.training_duration} min
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompletionStatusColor(record.completion_status)}`}>
                      {getCompletionStatusIcon(record.completion_status)}
                      <span className="ml-1">
                        {record.completion_status === 'planned' && t('gdpr.usposabljanja.planned', 'Načrtovano')}
                        {record.completion_status === 'in_progress' && t('gdpr.usposabljanja.inProgress', 'V teku')}
                        {record.completion_status === 'completed' && t('gdpr.usposabljanja.completed', 'Zaključeno')}
                        {record.completion_status === 'failed' && t('gdpr.usposabljanja.failed', 'Neuspešno')}
                        {record.completion_status === 'cancelled' && t('gdpr.usposabljanja.cancelled', 'Preklicano')}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.certificate_issued ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        {t('gdpr.usposabljanja.issued', 'Izdan')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t('gdpr.usposabljanja.notIssued', 'Ni izdan')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-900"
                        title={t('common.view', 'Poglej')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title={t('common.edit', 'Uredi')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('common.delete', 'Izbriši')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacija */}
        {totalPages > 1 && (
          <div className="bg-bg-surface px-4 py-3 flex items-center justify-between border-t border-border-subtle sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-border-subtle text-sm font-medium rounded-md text-text-primary bg-bg-surface hover:bg-bg-surface-hover disabled:opacity-50"
              >
                {t('common.previous', 'Prejšnja')}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.next', 'Naslednja')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  {t('common.showing', 'Prikazano')} <span className="font-medium text-text-primary">{indexOfFirstItem + 1}</span> {t('common.to', 'do')} <span className="font-medium text-text-primary">{Math.min(indexOfLastItem, filteredRecords.length)}</span> {t('common.of', 'od')} <span className="font-medium text-text-primary">{filteredRecords.length}</span> {t('common.results', 'rezultatov')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border-subtle bg-bg-surface text-sm font-medium text-text-secondary hover:bg-bg-surface-hover disabled:opacity-50"
                  >
                    <span className="sr-only">{t('common.previous', 'Prejšnja')}</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-accent-primary border-accent-primary text-white'
                          : 'bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-surface-hover'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border-subtle bg-bg-surface text-sm font-medium text-text-secondary hover:bg-bg-surface-hover disabled:opacity-50"
                  >
                    <span className="sr-only">{t('common.next', 'Naslednja')}</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistike */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-accent-primary" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-text-secondary">
                {t('gdpr.usposabljanja.totalParticipants', 'Skupaj udeležencev')}
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                {new Set(records.map(r => r.participant_name)).size}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-status-success" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-text-secondary">
                {t('gdpr.usposabljanja.completedTrainings', 'Zaključena usposabljanja')}
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                {records.filter(r => r.completion_status === 'completed').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-status-warning" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-text-secondary">
                {t('gdpr.usposabljanja.certificatesIssued', 'Izdanih certifikatov')}
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                {records.filter(r => r.certificate_issued).length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-subtle p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-status-error" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-text-secondary">
                {t('gdpr.usposabljanja.expiringCertificates', 'Kmalu potekli certifikati')}
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                {records.filter(r => {
                  if (!r.certificate_expiry_date) return false
                  const expiryDate = new Date(r.certificate_expiry_date)
                  const threeMonthsFromNow = new Date()
                  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
                  return expiryDate <= threeMonthsFromNow && expiryDate >= new Date()
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <GDPRUsposabljanjaEvidenceAddModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {showEditModal && editRecord && (
        <GDPRUsposabljanjaEvidenceAddModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          editMode={true}
          editRecord={editRecord}
        />
      )}

      {/* Detail Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-bg-surface border-border-subtle">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-text-primary">
                  {t('gdpr.usposabljanja.trainingDetails', 'Podrobnosti usposabljanja')}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-text-muted hover:text-text-secondary"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.participant', 'Udeleženec')}
                    </label>
                    <p className="mt-1 text-sm text-text-primary">{selectedRecord.participant_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.trainingTitle', 'Naslov usposabljanja')}
                    </label>
                    <p className="mt-1 text-sm text-text-primary">{selectedRecord.training_title}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.trainingType', 'Tip usposabljanja')}
                    </label>
                    <p className="mt-1 text-sm text-text-primary">
                      {getTrainingTypeLabel(selectedRecord.training_type)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.trainingDate', 'Datum usposabljanja')}
                    </label>
                    <p className="mt-1 text-sm text-text-primary">
                      {formatDate(selectedRecord.training_date)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.completionStatus', 'Status dokončanja')}
                    </label>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompletionStatusColor(selectedRecord.completion_status)}`}>
                      {getCompletionStatusIcon(selectedRecord.completion_status)}
                      <span className="ml-1">
                        {selectedRecord.completion_status === 'planned' && t('gdpr.usposabljanja.planned', 'Načrtovano')}
                        {selectedRecord.completion_status === 'in_progress' && t('gdpr.usposabljanja.inProgress', 'V teku')}
                        {selectedRecord.completion_status === 'completed' && t('gdpr.usposabljanja.completed', 'Zaključeno')}
                        {selectedRecord.completion_status === 'failed' && t('gdpr.usposabljanja.failed', 'Neuspešno')}
                        {selectedRecord.completion_status === 'cancelled' && t('gdpr.usposabljanja.cancelled', 'Preklicano')}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">
                      {t('gdpr.usposabljanja.certificateIssued', 'Certifikat izdan')}
                    </label>
                    <p className="mt-1 text-sm text-text-primary">
                      {selectedRecord.certificate_issued ? 
                        t('common.yes', 'Da') : 
                        t('common.no', 'Ne')}
                    </p>
                  </div>

                  {selectedRecord.certificate_number && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">
                        {t('gdpr.usposabljanja.certificateNumber', 'Številka certifikata')}
                      </label>
                      <p className="mt-1 text-sm text-text-primary">{selectedRecord.certificate_number}</p>
                    </div>
                  )}

                  {selectedRecord.training_duration && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">
                        {t('gdpr.usposabljanja.duration', 'Trajanje')}
                      </label>
                      <p className="mt-1 text-sm text-text-primary">
                        {selectedRecord.training_duration} {t('gdpr.usposabljanja.minutes', 'minut')}
                      </p>
                    </div>
                  )}

                  {selectedRecord.assessment_score && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">
                        {t('gdpr.usposabljanja.assessmentScore', 'Ocena ocenjevanja')}
                      </label>
                      <p className="mt-1 text-sm text-text-primary">{selectedRecord.assessment_score}%</p>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">
                        {t('common.notes', 'Opombe')}
                      </label>
                      <p className="mt-1 text-sm text-text-primary">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}