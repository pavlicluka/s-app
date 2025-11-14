import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { ClipboardCheck, Plus, FileText, Download, Search, Filter, Download as ExportIcon, Eye, AlertTriangle, Edit, Printer } from 'lucide-react'
import { GDPRDPIAAdvancedModal } from '../modals'
import DetailModal from '../common/DetailModal'

interface DPIARecord {
  id: string
  assessment_id: string
  project_name: string
  project_description?: string
  lawful_basis?: string
  assessment_date?: string
  completion_date?: string
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected'
  approval_authority?: string
  approval_date?: string
  privacy_by_design?: boolean
  ip_consultation_required?: boolean
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  
  // Extended fields for full DPIA data
  data_types?: string[]
  data_subjects?: string[]
  technical_measures?: string[]
  organizational_measures?: string[]
  risk_scenarios?: string[]
  special_categories?: boolean
  zvop2_research_purposes?: boolean
  zvop2_video_surveillance?: boolean
  third_country_transfers?: boolean
  
  // Legacy compatibility
  necessity_assessment?: string
  data_processing_description?: string
  risks_identified?: string
  mitigation_measures?: string
  approved_by?: string
  approval_date_legacy?: string
  file_url?: string
  file_name?: string
  file_size?: number
}

// Demo DPIA podatki za prikaz, če je baza prazna
const demoDPiaRecords: DPIARecord[] = [
  {
    id: '1',
    assessment_id: 'DPIA-2024-001',
    project_name: 'DPIA - Implementacija CRM sistema',
    project_description: 'Implementacija novega CRM sistema za upravljanje odnosov s strankami, ki vključuje zbiranje, obdelavo in analizo osebnih podatkov strank.',
    lawful_basis: 'Pogodba (člen 6(1)(b)) - izvajanje pogodbe s strankami',
    assessment_date: '2024-01-15',
    completion_date: '2024-02-01',
    status: 'approved',
    approval_authority: 'Janez Novak',
    approval_date: '2024-02-05',
    privacy_by_design: true,
    risk_level: 'medium',
    data_types: ['Osebni identifikatorji', 'Kontaktni podatki', 'Zgodovina nakupov'],
    data_subjects: ['Stranke', 'Potencialne stranke'],
    technical_measures: ['Šifriranje podatkov', 'Dostopna kontrola', 'Varnostno kopiranje'],
    organizational_measures: ['Politika varstva podatkov', 'Usposabljanje zaposlenih', 'Dodelitev vlog'],
    risk_scenarios: ['Neavtoriziran dostop', 'Izguba podatkov'],
    data_processing_description: 'Sistem bo obdeloval osnovne kontaktne podatke in zgodovino strank za namen izboljšanja storitev.',
    necessity_assessment: 'CRM sistem je nujen za učinkovito upravljanje strank in izvajanje pogodbenih obveznosti.',
    risks_identified: 'Možnost neavtoriziranega dostopa do osebnih podatkov strank.',
    mitigation_measures: 'Implementacija močnih tehničnih in organizacijskih ukrepov za varstvo podatkov.',
    approved_by: 'Janez Novak',
    file_name: 'DPIA_CRM_2024.pdf',
    file_size: 2048000
  },
  {
    id: '2',
    assessment_id: 'DPIA-2024-002',
    project_name: 'DPIA - Uporaba video nadzora',
    project_description: 'Postavitev video nadzornega sistema v poslovnih prostorih za zagotavljanje varnosti in preprečevanje kaznivih dejanj.',
    lawful_basis: 'Zakoniti interes (člen 6(1)(f)) - varovanje premoženja in varnost',
    assessment_date: '2024-02-10',
    completion_date: '2024-02-25',
    status: 'approved',
    approval_authority: 'Marija Kovač',
    approval_date: '2024-03-01',
    privacy_by_design: true,
    risk_level: 'high',
    zvop2_video_surveillance: true,
    data_types: ['Video posnetki', 'Biometrični podatki'],
    data_subjects: ['Zaposleni', 'Obiskovalci', 'Dostavljavci'],
    technical_measures: ['Varnostno shranjevanje', 'Dostopna kontrola', 'Samodejno brisanje'],
    organizational_measures: ['Politika video nadzora', 'Obveščanje posameznikov', 'Pravilnik o hrambi'],
    risk_scenarios: ['Zloraba video posnetkov', 'Neupravičen dostop', 'Prekoračitev namena'],
    data_processing_description: 'Video nadzor za zagotavljanje varnosti v poslovnih prostorih 24/7.',
    necessity_assessment: 'Video nadzor je potreben za zaščito premoženja in zagotavljanje varnosti zaposlenih.',
    risks_identified: 'Visoko tveganje zaradi občutljivih biometričnih podatkov in potencialne zlorabe.',
    mitigation_measures: 'Strogi dostopni ukrepi, časovno omejena hramba, redne kontrole dostopa.',
    approved_by: 'Marija Kovač',
    file_name: 'DPIA_Video_2024.pdf',
    file_size: 1536000
  },
  {
    id: '3',
    assessment_id: 'DPIA-2024-003',
    project_name: 'DPIA - Analiza podatkov strank',
    project_description: 'Izvedba napredne analize podatkov strank za razumevanje vedenjskih vzorcev in izboljšanje storitev.',
    lawful_basis: 'Zakoniti interes (člen 6(1)(f)) - izboljšanje storitev',
    assessment_date: '2024-03-05',
    completion_date: '2024-03-20',
    status: 'approved',
    risk_level: 'medium',
    data_types: ['Osebni identifikatorji', 'Podatki o vedenju', 'Podatki o preferencah'],
    data_subjects: ['Stranke', 'Uporabniki spletne strani'],
    technical_measures: ['Pseudonimizacija', 'Šifriranje', 'Varnostna analiza'],
    organizational_measures: ['Smernice za analitiko', 'Usposabljanje analitikov', 'Redne kontrole'],
    risk_scenarios: ['Reidentifikacija', 'Diskriminacija', 'Napačne odločitve'],
    data_processing_description: 'Analiza podatkov za razumevanje potreb strank in prilagoditev storitev.',
    necessity_assessment: 'Analitika je ključna za razumevanje potreb strank in prilagoditev ponudbe.',
    risks_identified: 'Tveganje reidentifikacije in potencialne diskriminacije pri odločanju.',
    mitigation_measures: 'Uporaba pseudonimizacije in etičnih smernic pri analizi.',
    approved_by: 'Peter Horvat',
    file_name: null,
    file_size: null
  },
  {
    id: '4',
    assessment_id: 'DPIA-2024-004',
    project_name: 'DPIA - Avtomatizirano odločanje',
    project_description: 'Implementacija sistema za avtomatizirano odločanje pri odobritvi kreditov in drugih finančnih storitev.',
    lawful_basis: 'Pogodba (člen 6(1)(b)) - izvajanje finančne pogodbe',
    assessment_date: '2024-04-10',
    completion_date: '2024-04-30',
    status: 'in_progress',
    risk_level: 'high',
    data_types: ['Finančni podatki', 'Kreditna zgodovina', 'Osebni identifikatorji'],
    data_subjects: ['Prosilci za kredite', 'Kreditojemalci'],
    technical_measures: ['Algoritemske kontrole', 'Transparentnost', 'Varnostno testiranje'],
    organizational_measures: ['Politika avtomatiziranega odločanja', 'Usposabljanje', 'Redne presoje'],
    risk_scenarios: ['Diskriminacija', 'Napačne odločitve', 'Pravne posledice'],
    data_processing_description: 'Avtomatizirano odločanje na podlagi algoritma za oceno kreditne sposobnosti.',
    necessity_assessment: 'Avtomatizacija je potrebna za hitro in učinkovito obdelavo velikega števila zahtevkov.',
    risks_identified: 'Visoko tveganje diskriminacije in napačnih odločitev, ki lahko vplivajo na človekove pravice.',
    mitigation_measures: 'Transparentni algoritmi, možnost človekovega posredovanja, redne presoje.',
    approved_by: null,
    file_name: 'DPIA_Avtomatizirano_2024.pdf',
    file_size: 2560000
  },
  {
    id: '5',
    assessment_id: 'DPIA-2024-005',
    project_name: 'DPIA - Profiliranje uporabnikov',
    project_description: 'Sistem za profiliranje uporabnikov spletne trgovine za prikaz prilagojenih ponudb in priporočil.',
    lawful_basis: 'Privolitev (člen 6(1)(a)) - jasna privolitev uporabnika',
    assessment_date: '2024-05-15',
    completion_date: '2024-06-01',
    status: 'approved',
    approval_authority: 'Ana Smolik',
    approval_date: '2024-06-05',
    privacy_by_design: true,
    risk_level: 'low',
    data_types: ['Podatki o vedenju', 'Preference', 'Zgodovina nakupov'],
    data_subjects: ['Uporabniki spletne trgovine'],
    technical_measures: ['Anonimizacija', 'Opt-out možnosti', 'Varnostno shranjevanje'],
    organizational_measures: ['Politika profiliranja', 'Obveščanje uporabnikov', 'Kontrola dostopa'],
    risk_scenarios: ['Zloraba podatkov', 'Nadzor nad uporabniki'],
    data_processing_description: 'Profiliranje za prikaz prilagojenih ponudb in izboljšanje nakupovalne izkušnje.',
    necessity_assessment: 'Profiliranje izboljša uporabniško izkušnjo in poveča zadovoljstvo strank.',
    risks_identified: 'Nizko tveganje zaradi anonimizacije in možnosti opt-out.',
    mitigation_measures: 'Jasno obveščanje, možnost zavrnitve, redne kontrole sistema',
    approved_by: 'Ana Smolik',
    file_name: 'DPIA_Profiliranje_2024.pdf',
    file_size: 1200000
  }
]

export default function GDPRDPIA() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<DPIARecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DPIARecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_dpia_assessments')
        .select('*')
        .order('assessment_date', { ascending: false })
      
      if (error) throw error
      
      // If no records in database, use demo data
      if (!data || data.length === 0) {
        const processedDemoData = demoDPiaRecords.map(record => ({
          ...record,
          risk_level: calculateRiskLevel(record)
        }))
        setRecords(processedDemoData)
      } else {
        // Calculate risk level based on record content
        const processedData = data.map(record => ({
          ...record,
          risk_level: calculateRiskLevel(record)
        }))
        setRecords(processedData)
      }
    } catch (error) {
      console.error('Error:', error)
      // Fallback to demo data on error
      const processedDemoData = demoDPiaRecords.map(record => ({
        ...record,
        risk_level: calculateRiskLevel(record)
      }))
      setRecords(processedDemoData)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskLevel = (record: DPIARecord): 'low' | 'medium' | 'high' | 'critical' => {
    // First check if there's a calculated risk level
    if (record.risk_level) return record.risk_level
    
    // Check for high-risk indicators in data
    const hasHighRiskData = 
      record.data_types?.includes('Zdravstveni podatki') ||
      record.data_types?.includes('Biometrični podatki') ||
      record.data_types?.includes('Genetski podatki') ||
      record.special_categories ||
      record.third_country_transfers ||
      record.ip_consultation_required
    
    if (hasHighRiskData) return 'high'
    
    // Check for medium-risk indicators
    const hasMediumRiskData = 
      record.data_types?.includes('Finančni podatki') ||
      record.data_types?.includes('Osebni identifikatorji') ||
      record.zvop2_video_surveillance ||
      record.data_subjects?.includes('Otroci (mlajši od 16 let)')
    
    if (hasMediumRiskData) return 'medium'
    
    return 'low'
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
  }

  const handleViewDetails = (record: DPIARecord) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  const handleEditRecord = (record: DPIARecord) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const exportRecordToPDF = (record: DPIARecord) => {
    try {
      // Create a simple PDF content for single record
      const printContent = `
        <html>
          <head>
            <title>DPIA ${record.assessment_id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #333; }
              .value { margin-bottom: 10px; }
              .risk-high { color: #ef4444; }
              .risk-medium { color: #f59e0b; }
              .risk-low { color: #22c55e; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="text-2xl font-bold">DPIA Poročilo</h1>
              <p>${record.assessment_id}</p>
              <p>Generirano: ${new Date().toLocaleDateString('sl-SI')}</p>
            </div>
            
            <div class="section">
              <h2>Osnovne informacije</h2>
              <p class="label">Ime projekta:</p>
              <p class="value">${record.project_name}</p>
              
              <p class="label">Datum ocene:</p>
              <p class="value">${new Date(record.assessment_date).toLocaleDateString('sl-SI')}</p>
              
              <p class="label">Status:</p>
              <p class="value">${getStatusText(record.status)}</p>
              
              <p class="label">Tveganje:</p>
              <p class="value risk-${record.risk_level || 'medium'}">${getRiskLevelText(record.risk_level || 'medium')}</p>
            </div>
            
            <div class="section">
              <h2>Opis projekta</h2>
              <p class="value">${record.project_description || record.data_processing_description || '-'}</p>
            </div>
            
            <div class="section">
              <h2>Pravna podlaga</h2>
              <p class="value">${record.lawful_basis || '-'}</p>
            </div>
            
            ${record.necessity_assessment ? `
            <div class="section">
              <h2>Ocena potrebnosti</h2>
              <p class="value">${record.necessity_assessment}</p>
            </div>
            ` : ''}
            
            ${record.risks_identified ? `
            <div class="section">
              <h2>Prepoznana tveganja</h2>
              <p class="value">${record.risks_identified}</p>
            </div>
            ` : ''}
            
            ${record.mitigation_measures ? `
            <div class="section">
              <h2>Ukrei za zmanjšanje tveganja</h2>
              <p class="value">${record.mitigation_measures}</p>
            </div>
            ` : ''}
          </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Napaka pri generiranju PDF.')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Assessment ID',
      'Project Name', 
      'Assessment Date',
      'Status',
      'Risk Level',
      'Approved By',
      'Approval Date',
      'Data Processing Description',
      'Necessity Assessment',
      'Risks Identified',
      'Mitigation Measures'
    ]
    
    const csvData = filteredRecords.map(record => [
      record.assessment_id,
      record.project_name,
      new Date(record.assessment_date).toLocaleDateString('sl-SI'),
      getStatusText(record.status),
      getRiskLevelText(record.risk_level || 'medium'),
      record.approved_by || '',
      record.approval_date ? new Date(record.approval_date).toLocaleDateString('sl-SI') : '',
      record.data_processing_description || '',
      record.necessity_assessment || '',
      record.risks_identified || '',
      record.mitigation_measures || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `gdpr_dpia_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async () => {
    try {
      // Simple PDF generation using window.print()
      const printContent = `
        <html>
          <head>
            <title>DPIA Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .risk-high { color: #ef4444; }
              .risk-medium { color: #f59e0b; }
              .risk-low { color: #22c55e; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 className="text-2xl font-bold text-text-primary">GDPR DPIA Poročilo</h1>
              <p>Generirano: ${new Date().toLocaleDateString('sl-SI')}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Assessment ID</th>
                  <th>Project Name</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Tveganje</th>
                  <th>Odobril</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map(record => `
                  <tr>
                    <td>${record.assessment_id}</td>
                    <td>${record.project_name}</td>
                    <td>${new Date(record.assessment_date).toLocaleDateString('sl-SI')}</td>
                    <td>${getStatusText(record.status)}</td>
                    <td class="risk-${record.risk_level || 'medium'}">${getRiskLevelText(record.risk_level || 'medium')}</td>
                    <td>${record.approved_by || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Napaka pri generiranju PDF.')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      'in_progress': 'V izdelavi',
      'completed': 'Dokončano',
      'approved': 'Odobreno',
      'rejected': 'Zavrnjeno'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getRiskLevelText = (riskLevel: string) => {
    const riskMap = {
      'low': 'Nizko',
      'medium': 'Srednje', 
      'high': 'Visoko',
      'critical': 'Kritično'
    }
    return riskMap[riskLevel as keyof typeof riskMap] || 'Srednje'
  }

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap = {
      'low': 'bg-risk-low/10 text-risk-low border-risk-low/20',
      'medium': 'bg-risk-medium/10 text-risk-medium border-risk-medium/20', 
      'high': 'bg-risk-high/10 text-risk-high border-risk-high/20',
      'critical': 'bg-red-100 text-red-800 border-red-200'
    }
    return colorMap[riskLevel as keyof typeof colorMap] || colorMap.medium
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      'in_progress': 'bg-status-warning/10 text-status-warning border-status-warning/20',
      'completed': 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
      'approved': 'bg-status-success/10 text-status-success border-status-success/20',
      'rejected': 'bg-status-error/10 text-status-error border-status-error/20'
    }
    return colorMap[status as keyof typeof colorMap] || colorMap.in_progress
  }

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.assessment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.data_processing_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.necessity_assessment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.risks_identified?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesRisk = riskFilter === 'all' || record.risk_level === riskFilter
      
      return matchesSearch && matchesStatus && matchesRisk
    })
  }, [records, searchTerm, statusFilter, riskFilter])

  useEffect(() => {
    fetchRecords()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('gdpr.dpia.title')}</h1>
            <p className="text-body-sm text-text-secondary">
              Ocena vpliva na varstvo podatkov - GDPR člen 35 ({filteredRecords.length} zapisov)
            </p>
            <p className="text-caption text-text-muted">
              Prikazujejo se demonstracijski podatki
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="h-10 px-4 bg-bg-surface border border-border-subtle hover:bg-bg-surface-hover text-text-primary rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <ExportIcon className="w-4 h-4" />
            <span className="text-body-sm font-medium hidden sm:inline">CSV</span>
          </button>
          <button 
            onClick={exportToPDF}
            className="h-10 px-4 bg-bg-surface border border-border-subtle hover:bg-bg-surface-hover text-text-primary rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <ExportIcon className="w-4 h-4" />
            <span className="text-body-sm font-medium hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('gdpr.dpia.addDpia')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Išči po ID, projektu, opisu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:border-accent-primary focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">Vsi statusi</option>
              <option value="in_progress">V izdelavi</option>
              <option value="completed">Dokončano</option>
              <option value="approved">Odobreno</option>
              <option value="rejected">Zavrnjeno</option>
            </select>
          </div>
          
          {/* Risk Filter */}
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-text-primary focus:border-accent-primary focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">Vsa tveganja</option>
              <option value="low">Nizko</option>
              <option value="medium">Srednje</option>
              <option value="high">Visoko</option>
              <option value="critical">Kritično</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[120px]">
                  {t('gdpr.dpia.assessmentId')}
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[180px]">
                  {t('gdpr.dpia.projectName')}
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[150px] hidden md:table-cell">
                  Pravna podlaga
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[100px]">
                  Status
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[100px]">
                  Tveganje
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[100px] hidden lg:table-cell">
                  Odobril
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[80px] hidden lg:table-cell">
                  Datoteka
                </th>
                <th className="text-left px-4 lg:px-6 py-4 text-caption text-text-secondary uppercase tracking-wide min-w-[80px]">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-4 lg:px-6 py-4 text-body text-text-primary font-mono">
                    {record.assessment_id}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-body text-text-primary font-medium max-w-[200px] truncate" title={record.project_name}>
                    {record.project_name}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-body text-text-secondary hidden md:table-cell">
                    <div className="max-w-[140px] truncate" title={record.lawful_basis}>
                      {record.lawful_basis ? record.lawful_basis.split('(')[0].trim() : '-'}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium border flex items-center gap-1 w-fit ${getRiskLevelColor(record.risk_level || 'medium')}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {getRiskLevelText(record.risk_level || 'medium')}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-body text-text-secondary hidden lg:table-cell">
                    {record.approval_authority || record.approved_by || '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                    {record.file_url ? (
                      <a
                        href={record.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-accent-primary hover:text-accent-primary-hover transition-colors"
                        title={record.file_name}
                      >
                        <FileText className="w-4 h-4" />
                        <Download className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-text-muted text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                        title="Poglej podrobnosti"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-2 text-status-warning hover:bg-status-warning/10 rounded transition-colors"
                        title="Uredi zapis"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportRecordToPDF(record)}
                        className="p-2 text-accent-secondary hover:bg-accent-secondary/10 rounded transition-colors"
                        title="Izvozi v PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-body">
              {searchTerm || statusFilter !== 'all' || riskFilter !== 'all' 
                ? 'Ni zapisov, ki ustrezajo filtrom.' 
                : 'Nobenih DPIA zapisov ni bilo najdenih.'
              }
            </p>
            <p className="text-caption text-text-muted mt-2">
              Prikazujejo se demonstracijski podatki
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`DPIA Podrobnosti - ${selectedRecord?.project_name}`}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Osnovne informacije</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-caption text-text-secondary">Assessment ID:</span>
                    <p className="text-body text-text-primary font-mono">{selectedRecord.assessment_id}</p>
                  </div>
                  <div>
                    <span className="text-caption text-text-secondary">Ime projekta:</span>
                    <p className="text-body text-text-primary">{selectedRecord.project_name}</p>
                  </div>
                  <div>
                    <span className="text-caption text-text-secondary">Datum ocene:</span>
                    <p className="text-body text-text-primary">{new Date(selectedRecord.assessment_date).toLocaleDateString('sl-SI')}</p>
                  </div>
                  <div>
                    <span className="text-caption text-text-secondary">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-caption font-medium border ${getStatusColor(selectedRecord.status)}`}>
                      {getStatusText(selectedRecord.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Tveganje in odobritev</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-caption text-text-secondary">Nivo tveganja:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-caption font-medium border flex items-center gap-1 w-fit ${getRiskLevelColor(selectedRecord.risk_level || 'medium')}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {getRiskLevelText(selectedRecord.risk_level || 'medium')}
                    </span>
                  </div>
                  <div>
                    <span className="text-caption text-text-secondary">Odobril:</span>
                    <p className="text-body text-text-primary">{selectedRecord.approval_authority || selectedRecord.approved_by || '-'}</p>
                  </div>
                  <div>
                    <span className="text-caption text-text-secondary">Datum odobritve:</span>
                    <p className="text-body text-text-primary">
                      {selectedRecord.approval_date ? new Date(selectedRecord.approval_date).toLocaleDateString('sl-SI') : 
                       selectedRecord.approval_date_legacy ? new Date(selectedRecord.approval_date_legacy).toLocaleDateString('sl-SI') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assessment Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Opis projekta</h4>
                <p className="text-body text-text-secondary p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.project_description || selectedRecord.data_processing_description || '-'}
                </p>
              </div>
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Pravna podlaga</h4>
                <p className="text-body text-text-secondary p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.lawful_basis || '-'}
                </p>
              </div>
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Vrste podatkov</h4>
                <div className="flex flex-wrap gap-2 p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.data_types?.length ? (
                    selectedRecord.data_types.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-caption">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-body text-text-secondary">-</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Kategorije posameznikov</h4>
                <div className="flex flex-wrap gap-2 p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.data_subjects?.length ? (
                    selectedRecord.data_subjects.map((subject, index) => (
                      <span key={index} className="px-2 py-1 bg-status-success/10 text-status-success rounded-full text-caption">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <span className="text-body text-text-secondary">-</span>
                  )}
                </div>
              </div>
              
              {selectedRecord.necessity_assessment && (
                <div>
                  <h4 className="text-body-sm font-medium text-text-primary mb-2">Ocena potrebnosti</h4>
                  <p className="text-body text-text-secondary p-3 bg-bg-near-black rounded border border-border-subtle">
                    {selectedRecord.necessity_assessment}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Tehnični ukrepi</h4>
                <div className="flex flex-wrap gap-2 p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.technical_measures?.length ? (
                    selectedRecord.technical_measures.map((measure, index) => (
                      <span key={index} className="px-2 py-1 bg-status-warning/10 text-status-warning rounded-full text-caption">
                        {measure}
                      </span>
                    ))
                  ) : (
                    <span className="text-body text-text-secondary">-</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Organizacijski ukrepi</h4>
                <div className="flex flex-wrap gap-2 p-3 bg-bg-near-black rounded border border-border-subtle">
                  {selectedRecord.organizational_measures?.length ? (
                    selectedRecord.organizational_measures.map((measure, index) => (
                      <span key={index} className="px-2 py-1 bg-status-error/10 text-status-error rounded-full text-caption">
                        {measure}
                      </span>
                    ))
                  ) : (
                    <span className="text-body text-text-secondary">-</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* File Attachment */}
            {selectedRecord.file_url && (
              <div>
                <h4 className="text-body-sm font-medium text-text-primary mb-2">Priložena datoteka</h4>
                <a
                  href={selectedRecord.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-bg-near-black border border-border-subtle rounded hover:border-accent-primary transition-colors"
                >
                  <FileText className="w-5 h-5 text-accent-primary" />
                  <div>
                    <p className="text-body text-text-primary">{selectedRecord.file_name || 'Datoteka'}</p>
                    {selectedRecord.file_size && (
                      <p className="text-caption text-text-secondary">
                        {Math.round(selectedRecord.file_size / 1024)} KB
                      </p>
                    )}
                  </div>
                  <Download className="w-4 h-4 text-accent-primary ml-auto" />
                </a>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      {/* Add/Edit Modal */}
      <GDPRDPIAAdvancedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRecord(null)
        }}
        onSuccess={handleModalSuccess}
        editData={selectedRecord}
      />
    </div>
  )
}
