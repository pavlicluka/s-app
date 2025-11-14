import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { 
  AlertTriangle, Plus, FileText, Download, Filter, Search, 
  Grid, List, BarChart3, Eye, Clock, Shield, Users, Zap,
  ChevronDown, Calendar, TrendingUp, AlertCircle, CheckCircle,
  Filter as FilterIcon, ArrowUpDown, Download as DownloadIcon
} from 'lucide-react'
import GDPRIncidentFormModal from '../modals/GDPRIncidentFormModal'
import GDPRIncidentDetailModal from '../modals/GDPRIncidentDetailModal'

type ViewType = 'full' | 'basic' | 'catalog' | 'statistics'

export default function GDPRIncidentEvidence() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('full')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gdpr_data_breach_log')
        .select('*')
        .order('breach_date', { ascending: false })

      if (error) throw error
      
      // Demo podatki kot fallback, če je baza prazna
      if (!data || data.length === 0) {
        const demoData = [
          {
            id: 1,
            breach_id: 'INC-2024-001',
            breach_type: 'Ransomware napad na datotečni strežnik',
            breach_date: '2024-11-01T10:30:00Z',
            severity: 'critical',
            status: 'resolved',
            dpo_name: 'Marko Novak',
            data_controller: 'Standario d.o.o.',
            description: 'Ransomware napad na glavni datotečni strežnik je prizadel kritične poslovne podatke. Strežnik je bil izoliran in obnovljen iz varnostnih kopij.',
            affected_records: 15000,
            ip_notification_sent: true,
            ip_notification_date: '2024-11-02T14:00:00Z',
            data_subjects_notified: true,
            subjects_notification_date: '2024-11-03T09:00:00Z',
            file_url: null,
            created_at: '2024-11-01T10:30:00Z',
            updated_at: '2024-11-05T16:00:00Z'
          },
          {
            id: 2,
            breach_id: 'INC-2024-002',
            breach_type: 'Napačno pošiljanje osebnih podatkov',
            breach_date: '2024-10-28T14:20:00Z',
            severity: 'high',
            status: 'investigating',
            dpo_name: 'Ana Kovačič',
            data_controller: 'Standario d.o.o.',
            description: 'E-poštno sporočilo z osebnimi podatki strank je bilo napačno naslovljeno in poslano nepooblaščeni osebi. Preklic sporočila ni bil mogoč.',
            affected_records: 45,
            ip_notification_sent: true,
            ip_notification_date: '2024-10-29T10:00:00Z',
            data_subjects_notified: true,
            subjects_notification_date: '2024-10-30T12:00:00Z',
            file_url: null,
            created_at: '2024-10-28T14:20:00Z',
            updated_at: '2024-11-07T11:30:00Z'
          },
          {
            id: 3,
            breach_id: 'INC-2024-003',
            breach_type: 'Neavtoriziran dostop do sistema',
            breach_date: '2024-10-25T08:15:00Z',
            severity: 'high',
            status: 'resolved',
            dpo_name: 'Marko Novak',
            data_controller: 'Standario d.o.o.',
            description: 'Bivši zaposleni je še vedno imel veljaven dostop do sistema po prenehanju delovnega razmerja. Dostop je takoj preklican in izvedena varnostna preiskava.',
            affected_records: 2300,
            ip_notification_sent: false,
            ip_notification_date: null,
            data_subjects_notified: false,
            subjects_notification_date: null,
            file_url: null,
            created_at: '2024-10-25T08:15:00Z',
            updated_at: '2024-11-01T17:45:00Z'
          },
          {
            id: 4,
            breach_id: 'INC-2024-004',
            breach_type: 'Kompromitacija gesla',
            breach_date: '2024-10-20T16:45:00Z',
            severity: 'medium',
            status: 'contained',
            dpo_name: 'Ana Kovačič',
            data_controller: 'Standario d.o.o.',
            description: 'Administratorjev račun je bil kompromitiran zaradi slabega gesla. Geslo je bilo spremenjeno in izvedena dvofaktorska avtentikacija.',
            affected_records: 0,
            ip_notification_sent: false,
            ip_notification_date: null,
            data_subjects_notified: false,
            subjects_notification_date: null,
            file_url: null,
            created_at: '2024-10-20T16:45:00Z',
            updated_at: '2024-10-21T10:00:00Z'
          },
          {
            id: 5,
            breach_id: 'INC-2024-005',
            breach_type: 'Izguba prenosne naprave',
            breach_date: '2024-10-15T12:00:00Z',
            severity: 'medium',
            status: 'resolved',
            dpo_name: 'Peter Pavlin',
            data_controller: 'Standario d.o.o.',
            description: 'Prenosni računalnik z nešifriranimi podatki strank je bil izgubljen na javnem prevozu. Naprava je bila takoj oddaljeno onemogočena.',
            affected_records: 1200,
            ip_notification_sent: true,
            ip_notification_date: '2024-10-16T14:30:00Z',
            data_subjects_notified: true,
            subjects_notification_date: '2024-10-17T11:00:00Z',
            file_url: null,
            created_at: '2024-10-15T12:00:00Z',
            updated_at: '2024-10-25T09:15:00Z'
          },
          {
            id: 6,
            breach_id: 'INC-2024-006',
            breach_type: 'SQL injection napad',
            breach_date: '2024-10-10T09:30:00Z',
            severity: 'critical',
            status: 'resolved',
            dpo_name: 'Marko Novak',
            data_controller: 'Standario d.o.o.',
            description: 'Web aplikacija je bila tarča SQL injection napada. Napadalec je pridobil dostop do delovne baze podatkov. Sistem je bil popravljen in zaščiten.',
            affected_records: 5000,
            ip_notification_sent: true,
            ip_notification_date: '2024-10-11T08:00:00Z',
            data_subjects_notified: true,
            subjects_notification_date: '2024-10-12T14:00:00Z',
            file_url: null,
            created_at: '2024-10-10T09:30:00Z',
            updated_at: '2024-10-30T16:20:00Z'
          },
          {
            id: 7,
            breach_id: 'INC-2024-007',
            breach_type: 'Nepooblaščen dostop do e-pošte',
            breach_date: '2024-10-05T11:20:00Z',
            severity: 'high',
            status: 'investigating',
            dpo_name: 'Ana Kovačič',
            data_controller: 'Standario d.o.o.',
            description: 'E-poštni račun zaposlenega je bil dostopen prek ukradenih prijavnih podatkov. Preiskava še poteka, preverja se obseg dostopa.',
            affected_records: 500,
            ip_notification_sent: false,
            ip_notification_date: null,
            data_subjects_notified: false,
            subjects_notification_date: null,
            file_url: null,
            created_at: '2024-10-05T11:20:00Z',
            updated_at: '2024-11-08T14:45:00Z'
          }
        ]
        setRecords(demoData)
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error:', error)
      // V primeru napake pri povezavi z bazo, uporabi demo podatke
      const fallbackData = [
        {
          id: 1,
          breach_id: 'INC-2024-001',
          breach_type: 'Ransomware napad na datotečni strežnik',
          breach_date: '2024-11-01T10:30:00Z',
          severity: 'critical',
          status: 'resolved',
          dpo_name: 'Marko Novak',
          data_controller: 'Standario d.o.o.',
          description: 'Ransomware napad na glavni datotečni strežnik je prizadel kritične poslovne podatke. Strežnik je bil izoliran in obnovljen iz varnostnih kopij.',
          affected_records: 15000,
          ip_notification_sent: true,
          ip_notification_date: '2024-11-02T14:00:00Z',
          data_subjects_notified: true,
          subjects_notification_date: '2024-11-03T09:00:00Z',
          file_url: null,
          created_at: '2024-11-01T10:30:00Z',
          updated_at: '2024-11-05T16:00:00Z'
        },
        {
          id: 2,
          breach_id: 'INC-2024-002',
          breach_type: 'Napačno pošiljanje osebnih podatkov',
          breach_date: '2024-10-28T14:20:00Z',
          severity: 'high',
          status: 'investigating',
          dpo_name: 'Ana Kovačič',
          data_controller: 'Standario d.o.o.',
          description: 'E-poštno sporočilo z osebnimi podatki strank je bilo napačno naslovljeno in poslano nepooblaščeni osebi. Preklic sporočila ni bil mogoč.',
          affected_records: 45,
          ip_notification_sent: true,
          ip_notification_date: '2024-10-29T10:00:00Z',
          data_subjects_notified: true,
          subjects_notification_date: '2024-10-30T12:00:00Z',
          file_url: null,
          created_at: '2024-10-28T14:20:00Z',
          updated_at: '2024-11-07T11:30:00Z'
        },
        {
          id: 3,
          breach_id: 'INC-2024-003',
          breach_type: 'Neavtoriziran dostop do sistema',
          breach_date: '2024-10-25T08:15:00Z',
          severity: 'high',
          status: 'resolved',
          dpo_name: 'Marko Novak',
          data_controller: 'Standario d.o.o.',
          description: 'Bivši zaposleni je še vedno imel veljaven dostop do sistema po prenehanju delovnega razmerja. Dostop je takoj preklican in izvedena varnostna preiskava.',
          affected_records: 2300,
          ip_notification_sent: false,
          ip_notification_date: null,
          data_subjects_notified: false,
          subjects_notification_date: null,
          file_url: null,
          created_at: '2024-10-25T08:15:00Z',
          updated_at: '2024-11-01T17:45:00Z'
        },
        {
          id: 4,
          breach_id: 'INC-2024-004',
          breach_type: 'Kompromitacija gesla',
          breach_date: '2024-10-20T16:45:00Z',
          severity: 'medium',
          status: 'contained',
          dpo_name: 'Ana Kovačič',
          data_controller: 'Standario d.o.o.',
          description: 'Administratorjev račun je bil kompromitiran zaradi slabega gesla. Geslo je bilo spremenjeno in izvedena dvofaktorska avtentikacija.',
          affected_records: 0,
          ip_notification_sent: false,
          ip_notification_date: null,
          data_subjects_notified: false,
          subjects_notification_date: null,
          file_url: null,
          created_at: '2024-10-20T16:45:00Z',
          updated_at: '2024-10-21T10:00:00Z'
        },
        {
          id: 5,
          breach_id: 'INC-2024-005',
          breach_type: 'Izguba prenosne naprave',
          breach_date: '2024-10-15T12:00:00Z',
          severity: 'medium',
          status: 'resolved',
          dpo_name: 'Peter Pavlin',
          data_controller: 'Standario d.o.o.',
          description: 'Prenosni računalnik z nešifriranimi podatki strank je bil izgubljen na javnem prevozu. Naprava je bila takoj oddaljeno onemogočena.',
          affected_records: 1200,
          ip_notification_sent: true,
          ip_notification_date: '2024-10-16T14:30:00Z',
          data_subjects_notified: true,
          subjects_notification_date: '2024-10-17T11:00:00Z',
          file_url: null,
          created_at: '2024-10-15T12:00:00Z',
          updated_at: '2024-10-25T09:15:00Z'
        },
        {
          id: 6,
          breach_id: 'INC-2024-006',
          breach_type: 'SQL injection napad',
          breach_date: '2024-10-10T09:30:00Z',
          severity: 'critical',
          status: 'resolved',
          dpo_name: 'Marko Novak',
          data_controller: 'Standario d.o.o.',
          description: 'Web aplikacija je bila tarča SQL injection napada. Napadalec je pridobil dostop do delovne baze podatkov. Sistem je bil popravljen in zaščiten.',
          affected_records: 5000,
          ip_notification_sent: true,
          ip_notification_date: '2024-10-11T08:00:00Z',
          data_subjects_notified: true,
          subjects_notification_date: '2024-10-12T14:00:00Z',
          file_url: null,
          created_at: '2024-10-10T09:30:00Z',
          updated_at: '2024-10-30T16:20:00Z'
        },
        {
          id: 7,
          breach_id: 'INC-2024-007',
          breach_type: 'Nepooblaščen dostop do e-pošte',
          breach_date: '2024-10-05T11:20:00Z',
          severity: 'high',
          status: 'investigating',
          dpo_name: 'Ana Kovačič',
          data_controller: 'Standario d.o.o.',
          description: 'E-poštni račun zaposlenega je bil dostopen prek ukradenih prijavnih podatkov. Preiskava še poteka, preverja se obseg dostopa.',
          affected_records: 500,
          ip_notification_sent: false,
          ip_notification_date: null,
          data_subjects_notified: false,
          subjects_notification_date: null,
          file_url: null,
          created_at: '2024-10-05T11:20:00Z',
          updated_at: '2024-11-08T14:45:00Z'
        }
      ]
      setRecords(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // Filtered and sorted records
  const filteredAndSortedRecords = useMemo(() => {
    const filtered = records.filter(record => {
      const matchesSearch = !searchTerm || 
        record.breach_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.breach_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.dpo_name && record.dpo_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSeverity = selectedSeverity === 'all' || record.severity === selectedSeverity
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus

      let matchesDateRange = true
      if (selectedDateRange !== 'all') {
        const breachDate = new Date(record.breach_date)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - breachDate.getTime()) / (1000 * 60 * 60 * 24))
        
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

      return matchesSearch && matchesSeverity && matchesStatus && matchesDateRange
    })

    // Apply sorting
    if (sortConfig) {
      const sorted = [...filtered]
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle dates
        if (sortConfig.key.includes('date')) {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
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
  }, [records, searchTerm, selectedSeverity, selectedStatus, selectedDateRange, sortConfig])

  // Statistics for dashboard
  const statistics = useMemo(() => {
    const total = filteredAndSortedRecords.length
    const critical = filteredAndSortedRecords.filter(r => r.severity === 'critical').length
    const high = filteredAndSortedRecords.filter(r => r.severity === 'high').length
    const medium = filteredAndSortedRecords.filter(r => r.severity === 'medium').length
    const low = filteredAndSortedRecords.filter(r => r.severity === 'low').length
    
    const active = filteredAndSortedRecords.filter(r => r.status === 'investigating' || r.status === 'contained').length
    const resolved = filteredAndSortedRecords.filter(r => r.status === 'resolved').length
    
    const reportedToAuthority = filteredAndSortedRecords.filter(r => r.ip_notification_sent).length
    const notifiedIndividuals = filteredAndSortedRecords.filter(r => r.data_subjects_notified).length

    return { total, critical, high, medium, low, active, resolved, reportedToAuthority, notifiedIndividuals }
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

  const getSeverityStyle = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-risk-critical/20 text-risk-critical border-risk-critical/30'
      case 'high': return 'bg-risk-high/20 text-risk-high border-risk-high/30'
      case 'medium': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30'
      default: return 'bg-risk-low/20 text-risk-low border-risk-low/30'
    }
  }

  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 'bg-status-success/10 text-status-success border-status-success/20'
      case 'contained': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
      case 'investigating': return 'bg-status-warning/10 text-status-warning border-status-warning/20'
      default: return 'bg-text-muted/10 text-text-muted border-text-muted/20'
    }
  }

  const getTimeSinceBreach = (breachDate: string) => {
    const breach = new Date(breachDate)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - breach.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Pravkar'
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} dni`
  }

  const handleIncidentClick = (record: any) => {
    setSelectedIncident(record)
    setIsDetailModalOpen(true)
  }

  const handleGenerateReport = async (record: any) => {
    try {
      // Import PDF generator with digital signature support
      const { generateSignedIPRSReport, downloadSignedPDF } = await import('../../utils/pdfGenerator')
      
      // Generate signed IPRS report
      const signedReport = await generateSignedIPRSReport(record)
      
      // Download signed PDF
      const result = await downloadSignedPDF(signedReport, `incident-${record.breach_id}-iprs-report-signed.pdf`)
      
      // Show success message
      alert(result.message)
    } catch (error) {
      console.error('Error generating signed PDF:', error)
      alert('Napaka pri generiranju podpisanega PDF poročila')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
    </div>
  )

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

  const renderFullView = () => (
    <div className="space-y-6">
      {/* Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-accent-primary" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Skupno</p>
              <p className="text-h4 text-text-primary">{statistics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-risk-critical/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-risk-critical" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Kritični</p>
              <p className="text-h4 text-text-primary">{statistics.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-status-warning/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-status-warning" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Aktivni</p>
              <p className="text-h4 text-text-primary">{statistics.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent-primary" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">IP prijavljeno</p>
              <p className="text-h4 text-text-primary">{statistics.reportedToAuthority}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-status-success/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-status-success" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Obveščeni</p>
              <p className="text-h4 text-text-primary">{statistics.notifiedIndividuals}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-status-success/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-status-success" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Rešeni</p>
              <p className="text-h4 text-text-primary">{statistics.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                <button onClick={() => handleSort('breach_id')} className="flex items-center gap-1 hover:text-text-primary">
                  ID
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Tip kršitve
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Datum
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Resnost
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                IP prijava
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Posamezniki
              </th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredAndSortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">
                  <button 
                    onClick={() => handleIncidentClick(record)}
                    className="hover:text-accent-primary transition-colors"
                  >
                    {record.breach_id}
                  </button>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.breach_type}</td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  <div>
                    <div>{new Date(record.breach_date).toLocaleDateString('sl-SI')}</div>
                    <div className="text-xs text-text-muted">PRED {getTimeSinceBreach(record.breach_date)}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getSeverityStyle(record.severity)}`}>
                    {t(`gdpr.breach.severityOptions.${record.severity?.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusStyle(record.status)}`}>
                    {t(`gdpr.breach.statusOptions.${record.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.ip_notification_sent ? (
                    <CheckCircle className="w-4 h-4 text-status-success" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-text-muted rounded-full" />
                  )}
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.data_subjects_notified ? (
                    <CheckCircle className="w-4 h-4 text-status-success" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-text-muted rounded-full" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncidentClick(record)}
                      className="p-1 hover:bg-bg-near-black rounded transition-colors"
                      title="Podrobnosti"
                    >
                      <Eye className="w-4 h-4 text-accent-primary" />
                    </button>
                    <button
                      onClick={() => handleGenerateReport(record)}
                      className="p-1 hover:bg-bg-near-black rounded transition-colors"
                      title="PDF poročilo"
                    >
                      <FileText className="w-4 h-4 text-accent-primary" />
                    </button>
                    {record.file_url && (
                      <a
                        href={record.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-bg-near-black rounded transition-colors"
                        title="Prenos priloge"
                      >
                        <Download className="w-4 h-4 text-accent-primary" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderBasicView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedRecords.map((record) => (
          <div key={record.id} className="bg-bg-surface rounded-sm border border-border-subtle p-4 hover:bg-bg-surface-hover transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  record.severity === 'critical' ? 'bg-risk-critical' :
                  record.severity === 'high' ? 'bg-risk-high' :
                  record.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
                }`} />
                <span className="text-body-sm font-mono text-text-primary">{record.breach_id}</span>
              </div>
              <button onClick={() => handleIncidentClick(record)} className="text-accent-primary hover:text-accent-primary-hover">
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">{record.breach_type}</span>
                <span className="text-body-xs text-text-muted">{getTimeSinceBreach(record.breach_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-caption ${getSeverityStyle(record.severity)}`}>
                  {record.severity}
                </span>
                <span className={`px-2 py-1 rounded text-caption ${getStatusStyle(record.status)}`}>
                  {record.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-body-xs text-text-muted">
                <div className="flex items-center gap-1">
                  {record.ip_notification_sent ? <CheckCircle className="w-3 h-3 text-status-success" /> : <div className="w-3 h-3 border border-text-muted rounded-full" />}
                  IP
                </div>
                <div className="flex items-center gap-1">
                  {record.data_subjects_notified ? <CheckCircle className="w-3 h-3 text-status-success" /> : <div className="w-3 h-3 border border-text-muted rounded-full" />}
                  Posamezniki
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCatalogView = () => {
    const grouped = filteredAndSortedRecords.reduce((acc, record) => {
      const type = record.breach_type || 'Neznan'
      if (!acc[type]) acc[type] = []
      acc[type].push(record)
      return acc
    }, {} as Record<string, any[]>)

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([type, records]) => {
          const severityCounts = (records as any[]).reduce((acc, r) => {
            acc[r.severity] = (acc[r.severity] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const averageResolution = (records as any[]).filter(r => r.status === 'resolved').length / (records as any[]).length * 100

          return (
            <div key={type} className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
              <div className="px-6 py-4 bg-bg-near-black border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <h3 className="text-h5 text-text-primary capitalize">{type}</h3>
                  <div className="flex items-center gap-4 text-body-sm text-text-secondary">
                    <span>{(records as any[]).length} primerov</span>
                    <span>{Math.round(averageResolution)}% rešenih</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-h5 text-risk-critical">{severityCounts.critical || 0}</p>
                    <p className="text-body-xs text-text-muted">Kritični</p>
                  </div>
                  <div className="text-center">
                    <p className="text-h5 text-risk-high">{severityCounts.high || 0}</p>
                    <p className="text-body-xs text-text-muted">Visoki</p>
                  </div>
                  <div className="text-center">
                    <p className="text-h5 text-risk-medium">{severityCounts.medium || 0}</p>
                    <p className="text-body-xs text-text-muted">Srednji</p>
                  </div>
                  <div className="text-center">
                    <p className="text-h5 text-risk-low">{severityCounts.low || 0}</p>
                    <p className="text-body-xs text-text-muted">Nizki</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(records as any[]).slice(0, 6).map(record => (
                    <div key={record.id} className="bg-bg-near-black rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-mono text-text-primary">{record.breach_id}</span>
                        <span className={`px-1 py-0.5 rounded text-caption ${getSeverityStyle(record.severity)}`}>
                          {record.severity}
                        </span>
                      </div>
                      <p className="text-body-xs text-text-secondary mb-2">{new Date(record.breach_date).toLocaleDateString('sl-SI')}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleIncidentClick(record)} className="text-accent-primary hover:text-accent-primary-hover">
                          <Eye className="w-3 h-3" />
                        </button>
                        <span className={`px-1 py-0.5 rounded text-caption ${getStatusStyle(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderStatisticsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <h3 className="text-h5 text-text-primary mb-4">Porazdelitev po resnosti</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Kritični</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-risk-critical rounded" style={{width: `${(statistics.critical / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.critical}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Visoki</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-risk-high rounded" style={{width: `${(statistics.high / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Srednji</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-risk-medium rounded" style={{width: `${(statistics.medium / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.medium}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Nizki</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-risk-low rounded" style={{width: `${(statistics.low / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.low}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <h3 className="text-h5 text-text-primary mb-4">Status incidentov</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Aktivni</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-status-warning rounded" style={{width: `${(statistics.active / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.active}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Rešeni</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-bg-near-black rounded">
                  <div className="w-full h-full bg-status-success rounded" style={{width: `${(statistics.resolved / statistics.total) * 100}%`}} />
                </div>
                <span className="text-body-sm text-text-primary w-8 text-right">{statistics.resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <h3 className="text-h5 text-text-primary mb-4">Poročanja</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Prijava IP</span>
              <span className="text-body-sm text-text-primary">{statistics.reportedToAuthority}/{statistics.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-secondary">Obveščanje posameznikov</span>
              <span className="text-body-sm text-text-primary">{statistics.notifiedIndividuals}/{statistics.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
          <h3 className="text-h5 text-text-primary mb-4">Hitrost odziva</h3>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-h3 text-accent-primary">{Math.round((statistics.reportedToAuthority / statistics.total) * 100)}%</p>
              <p className="text-body-sm text-text-secondary">Prijavljeno IP</p>
            </div>
            <div className="text-center">
              <p className="text-h3 text-status-success">{Math.round((statistics.resolved / statistics.total) * 100)}%</p>
              <p className="text-body-sm text-text-secondary">Uspešno rešeno</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-critical/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-risk-critical" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Evidenca incidentov in kršitev</h1>
            <p className="text-body-sm text-text-secondary">Sledenje incidentov po GDPR in ZVOP-2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderViewSwitcher()}
          <button 
            onClick={() => setIsFormModalOpen(true)} 
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">Nov incident</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Iskanje
            </label>
            <input
              type="text"
              placeholder="ID, tip, DPO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Resnost</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">Vse</option>
              <option value="critical">Kritični</option>
              <option value="high">Visoki</option>
              <option value="medium">Srednji</option>
              <option value="low">Nizki</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">Vsi</option>
              <option value="investigating">V preiskavi</option>
              <option value="contained">Zajezen</option>
              <option value="resolved">Rešen</option>
              <option value="escalated">Eskaliran</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Časovni razpon</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">Vsi</option>
              <option value="7days">Zadnjih 7 dni</option>
              <option value="30days">Zadnjih 30 dni</option>
              <option value="90days">Zadnjih 90 dni</option>
              <option value="1year">Zadnjih 1 leto</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSeverity('all')
                setSelectedStatus('all')
                setSelectedDateRange('all')
              }}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary hover:bg-bg-surface transition-colors"
            >
              Počisti
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {currentView === 'full' && renderFullView()}
      {currentView === 'basic' && renderBasicView()}
      {currentView === 'catalog' && renderCatalogView()}
      {currentView === 'statistics' && renderStatisticsView()}

      {/* Modals */}
      <GDPRIncidentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={fetchRecords}
      />

      {selectedIncident && (
        <>
          <GDPRIncidentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setSelectedIncident(null)
            }}
            incident={selectedIncident}
            onSave={fetchRecords}
          />
        </>
      )}
    </div>
  )
}
