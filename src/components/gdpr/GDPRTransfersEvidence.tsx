import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { 
  Shield, Plus, FileText, Download, Filter, Search, 
  Grid, List, BarChart3, Eye, Clock, Globe, Users, Zap,
  ChevronDown, Calendar, TrendingUp, AlertCircle, CheckCircle,
  Filter as FilterIcon, ArrowUpDown, MapPin, Lock,
  Building, FileCheck, Scale, UserCheck
} from 'lucide-react'
import GDPRTransfersEvidenceAddModal from '../modals/GDPRTransfersEvidenceAddModal'

type ViewType = 'full' | 'basic' | 'catalog' | 'statistics'

interface GDPRTransfer {
  id: string
  transfer_id: string
  transfer_name: string
  transfer_type: string
  source_country: string
  destination_country: string
  start_datetime: string
  end_datetime?: string
  controller_processor_flag: string
  data_volume_estimate?: number
  purpose_of_transfer: string
  recipient_type: string
  recipient_name?: string
  data_categories: any
  data_subjects: string[]
  lawful_basis_transfer: string
  mechanism_details_ref: string
  status: string
  tia_required: boolean
  tia_status?: string
  tia_outcome?: string
  created_at: string
  organization_id: string
}

export default function GDPRTransfersEvidence() {
  const { t } = useTranslation()
  const { organizationId, userProfile, loading: orgLoading, error: orgError } = useOrganization()
  const [records, setRecords] = useState<GDPRTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('full')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLegalBasis, setSelectedLegalBasis] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<GDPRTransfer | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get user profile with organization context
  useEffect(() => {
    // Profile loading is now handled by useOrganization hook
  }, [])

  const fetchRecords = async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('gdpr_transfers_third_countries')
        .select('*')
        .eq('organization_id', organizationId)
        .order('start_datetime', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchRecords()
    }
  }, [organizationId])

  // Filtered and sorted records - MUST be called unconditionally
  const filteredAndSortedRecords = useMemo(() => {
    const filtered = records.filter(record => {
      const matchesSearch = !searchTerm || 
        record.transfer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transfer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.destination_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.recipient_name && record.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLegalBasis = selectedLegalBasis === 'all' || record.lawful_basis_transfer === selectedLegalBasis
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
      const matchesCountry = selectedCountry === 'all' || record.destination_country === selectedCountry

      let matchesDateRange = true
      if (selectedDateRange !== 'all') {
        const transferDate = new Date(record.start_datetime)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (selectedDateRange) {
          case '7days':
            matchesDateRange = daysDiff <= 7
            break
          case '30days':
            matchesDateRange = daysDiff <= 30
            break
          case '90days':
            matchesDateRange = daysDiff <= 90
            break
          case '1year':
            matchesDateRange = daysDiff <= 365
            break
        }
      }

      return matchesSearch && matchesLegalBasis && matchesStatus && matchesCountry && matchesDateRange
    })

    // Apply sorting
    if (sortConfig) {
      const sorted = [...filtered]
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof GDPRTransfer]
        let bValue = b[sortConfig.key as keyof GDPRTransfer]

        // Handle dates
        if (sortConfig.key.includes('date')) {
          aValue = new Date(aValue as string)
          bValue = new Date(bValue as string)
        }

        // Handle arrays
        if (Array.isArray(aValue)) {
          aValue = aValue.length
        }
        if (Array.isArray(bValue)) {
          bValue = bValue.length
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
      return sorted
    }

    return filtered
  }, [records, searchTerm, selectedLegalBasis, selectedStatus, selectedCountry, selectedDateRange, sortConfig])

  // Statistics for dashboard - MUST be called unconditionally
  const statistics = useMemo(() => {
    const total = filteredAndSortedRecords.length
    const activeTransfers = filteredAndSortedRecords.filter(r => r.status === 'active').length
    const underReview = filteredAndSortedRecords.filter(r => r.status === 'under_review').length
    
    const adequacyDecisions = filteredAndSortedRecords.filter(r => r.lawful_basis_transfer === 'adequacy').length
    const sccTransfers = filteredAndSortedRecords.filter(r => r.lawful_basis_transfer === 'SCC').length
    const bcrTransfers = filteredAndSortedRecords.filter(r => r.lawful_basis_transfer === 'BCR').length
    const art49Transfers = filteredAndSortedRecords.filter(r => r.lawful_basis_transfer === 'Art49').length
    
    const requiresTIA = filteredAndSortedRecords.filter(r => r.tia_required).length
    const completedTIA = filteredAndSortedRecords.filter(r => r.tia_status === 'completed').length
    
    const uniqueCountries = new Set(filteredAndSortedRecords.map(r => r.destination_country)).size

    return { 
      total, activeTransfers, underReview, adequacyDecisions, sccTransfers, 
      bcrTransfers, art49Transfers, requiresTIA, completedTIA, uniqueCountries
    }
  }, [filteredAndSortedRecords])

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const getLegalBasisStyle = (basis: string) => {
    switch(basis?.toLowerCase()) {
      case 'adequacy': return 'bg-status-success/20 text-status-success border-status-success/30'
      case 'scc': return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
      case 'bcr': return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30'
      case 'art49': return 'bg-status-warning/20 text-status-warning border-status-warning/30'
      default: return 'bg-text-muted/20 text-text-muted border-text-muted/30'
    }
  }

  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-status-success/10 text-status-success border-status-success/20'
      case 'under_review': return 'bg-status-warning/10 text-status-warning border-status-warning/20'
      case 'suspended': return 'bg-risk-high/10 text-risk-high border-risk-high/20'
      default: return 'bg-text-muted/10 text-text-muted border-text-muted/20'
    }
  }

  const getTransferTypeIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'single': return <FileText className="w-4 h-4" />
      case 'batch': return <Users className="w-4 h-4" />
      case 'stream': return <Zap className="w-4 h-4" />
      case 'recurring': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleTransferClick = (record: GDPRTransfer) => {
    setSelectedTransfer(record)
    setIsDetailModalOpen(true)
  }

  const getCountryFlag = (countryCode: string) => {
    // Simple country code to flag emoji conversion
    return countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(127397 + char.charCodeAt(0))
    )
  }

  // Early return after all hooks are called
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
            {orgError || t('gdpr.transfers.noOrganization')}
          </p>
        </div>
      </div>
    )
  }

  // VIEW RENDERING
  const renderViewSwitcher = () => (
    <div className="flex items-center gap-1 bg-bg-near-black rounded-sm p-1">
      <button
        onClick={() => setCurrentView('full')}
        className={`flex items-center gap-2 px-3 py-2 rounded text-body-sm transition-colors ${
          currentView === 'full' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Polna evidenca"
      >
        <Grid className="w-4 h-4" />
        <span className="hidden md:inline">Polna</span>
      </button>
      <button
        onClick={() => setCurrentView('basic')}
        className={`flex items-center gap-2 px-3 py-2 rounded text-body-sm transition-colors ${
          currentView === 'basic' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Osnovni pregled"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden md:inline">Pregled</span>
      </button>
      <button
        onClick={() => setCurrentView('catalog')}
        className={`flex items-center gap-2 px-3 py-2 rounded text-body-sm transition-colors ${
          currentView === 'catalog' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Kazalo"
      >
        <List className="w-4 h-4" />
        <span className="hidden md:inline">Kazalo</span>
      </button>
      <button
        onClick={() => setCurrentView('statistics')}
        className={`flex items-center gap-2 px-3 py-2 rounded text-body-sm transition-colors ${
          currentView === 'statistics' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Statistike"
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden md:inline">Statistike</span>
      </button>
    </div>
  )

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Išči po nazivu, ID-ju prenosa, državi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
        />
      </div>

      {/* Legal Basis Filter */}
      <select
        value={selectedLegalBasis}
        onChange={(e) => setSelectedLegalBasis(e.target.value)}
        className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
      >
        <option value="all">Vse pravne podlage</option>
        <option value="adequacy">Odločba o ustreznosti</option>
        <option value="SCC">Standardne pogodbene klavzule</option>
        <option value="BCR">Zavezujoča pravila organizacije</option>
        <option value="certification">Certifikacija</option>
        <option value="Art49">Člen 49 (izjeme)</option>
      </select>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
      >
        <option value="all">Vsi statusi</option>
        <option value="active">Aktivni</option>
        <option value="under_review">V pregledu</option>
        <option value="suspended">Začasno ustavljeni</option>
        <option value="inactive">Neaktivni</option>
      </select>

      {/* Country Filter */}
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
      >
        <option value="all">Vse države</option>
        <option value="US">ZDA</option>
        <option value="UK">Združeno kraljestvo</option>
        <option value="CH">Švica</option>
        <option value="CA">Kanada</option>
        <option value="JP">Japonska</option>
        <option value="KR">Južna Koreja</option>
        <option value="AU">Avstralija</option>
        <option value="NZ">Nova Zelandija</option>
      </select>

      {/* Date Range Filter */}
      <select
        value={selectedDateRange}
        onChange={(e) => setSelectedDateRange(e.target.value)}
        className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
      >
        <option value="all">Vse obdobje</option>
        <option value="7days">Zadnjih 7 dni</option>
        <option value="30days">Zadnjih 30 dni</option>
        <option value="90days">Zadnjih 90 dni</option>
        <option value="1year">Zadnje leto</option>
      </select>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Evidence prenosov v tretje države
          </h1>
          <p className="text-body-base text-text-secondary">
            Evidenca prenosov osebnih podatkov v tretje države skladno z GDPR členi 44-49 in ZVOP-2
          </p>
        </div>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Dodaj prenos
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {renderViewSwitcher()}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Izvozi</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
        {renderFilters()}
      </div>

      {/* Statistics Dashboard */}
      {currentView === 'statistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Skupaj prenosov</p>
                <p className="text-heading-3 font-bold text-text-primary">{statistics.total}</p>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-lg">
                <Globe className="w-6 h-6 text-accent-primary" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Aktivni prenosi</p>
                <p className="text-heading-3 font-bold text-status-success">{statistics.activeTransfers}</p>
              </div>
              <div className="p-3 bg-status-success/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">V pregledu</p>
                <p className="text-heading-3 font-bold text-status-warning">{statistics.underReview}</p>
              </div>
              <div className="p-3 bg-status-warning/20 rounded-lg">
                <Clock className="w-6 h-6 text-status-warning" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Tretje države</p>
                <p className="text-heading-3 font-bold text-text-primary">{statistics.uniqueCountries}</p>
              </div>
              <div className="p-3 bg-accent-secondary/20 rounded-lg">
                <MapPin className="w-6 h-6 text-accent-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Odločbe o ustreznosti</p>
                <p className="text-heading-3 font-bold text-status-success">{statistics.adequacyDecisions}</p>
              </div>
              <div className="p-3 bg-status-success/20 rounded-lg">
                <Shield className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">SCC prenosi</p>
                <p className="text-heading-3 font-bold text-accent-primary">{statistics.sccTransfers}</p>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-lg">
                <FileCheck className="w-6 h-6 text-accent-primary" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Potrebne TIA ocene</p>
                <p className="text-heading-3 font-bold text-status-warning">{statistics.requiresTIA}</p>
              </div>
              <div className="p-3 bg-status-warning/20 rounded-lg">
                <Scale className="w-6 h-6 text-status-warning" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-body-sm">Dokončane TIA ocene</p>
                <p className="text-heading-3 font-bold text-status-success">{statistics.completedTIA}</p>
              </div>
              <div className="p-3 bg-status-success/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {currentView !== 'statistics' && (
        <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-near-black">
                <tr>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    <button
                      onClick={() => handleSort('transfer_name')}
                      className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                      Naziv prenosa
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    <button
                      onClick={() => handleSort('destination_country')}
                      className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                      Ciljna država
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    <button
                      onClick={() => handleSort('lawful_basis_transfer')}
                      className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                      Pravna podlaga
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    <button
                      onClick={() => handleSort('start_datetime')}
                      className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                      Datum začetka
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-body-sm font-medium text-text-secondary">
                    TIA ocena
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredAndSortedRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => handleTransferClick(record)}
                    className="hover:bg-bg-surface-hover cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getTransferTypeIcon(record.transfer_type)}
                        <div>
                          <div className="font-medium text-text-primary">
                            {record.transfer_name}
                          </div>
                          <div className="text-body-sm text-text-secondary">
                            {record.transfer_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(record.destination_country)}</span>
                        <span className="text-text-primary">{record.destination_country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-body-xs font-medium border ${getLegalBasisStyle(record.lawful_basis_transfer)}`}>
                        {record.lawful_basis_transfer}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-body-xs font-medium border ${getStatusStyle(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(record.start_datetime).toLocaleDateString('sl-SI')}
                    </td>
                    <td className="px-6 py-4">
                      {record.tia_required ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-body-xs font-medium border ${
                          record.tia_status === 'completed' 
                            ? 'bg-status-success/20 text-status-success border-status-success/30'
                            : 'bg-status-warning/20 text-status-warning border-status-warning/30'
                        }`}>
                          {record.tia_status || 'Potrebna'}
                        </span>
                      ) : (
                        <span className="text-text-muted text-body-sm">Ni potrebna</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedRecords.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-heading-4 font-medium text-text-primary mb-2">
                Ni najdenih prenosov
              </h3>
              <p className="text-text-secondary">
                Trenutno ni prenosov, ki bi ustrezali vašim kriterijem iskanja.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <GDPRTransfersEvidenceAddModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedTransfer(null)
        }}
        onSuccess={fetchRecords}
        editData={selectedTransfer}
      />
    </div>
  )
}
