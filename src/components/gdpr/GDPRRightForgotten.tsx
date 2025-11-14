import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { 
  Trash2, Plus, FileText, Download, Search, Filter, 
  Calendar, AlertTriangle, CheckCircle, Clock, 
  ChevronLeft, ChevronRight, Eye, Edit, X
} from 'lucide-react'
import { GDPRRightForgottenAddModal } from '../modals'

export default function GDPRRightForgotten() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deadlineFilter, setDeadlineFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editRecord, setEditRecord] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)

  // Demo podatki za fallback
  const demoRecords = [
    {
      id: '1',
      request_id: 'ZVOP-2024-001',
      subject_name: 'Ana Novak',
      subject_email: 'ana.novak@email.com',
      subject_phone: '+386 41 123 456',
      subject_address: 'Dunajska cesta 15, 1000 Ljubljana',
      subject_type: 'individual',
      request_date: '2025-10-15T08:30:00Z',
      request_type: 'pravica do pozabe',
      status: 'received',
      response_deadline: '2025-11-14T23:59:59Z',
      legal_basis_17_a: true,
      legal_basis_17_b: false,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Zahteva za izbris osebnih podatkov zaradi preklica soglasja',
      data_categories: ['Kontaktni podatki', 'Demografski podatki'],
      data_description: 'Ime, priimek, elektronski naslov, telefonska številka',
      data_system_location: 'CRM sistem, e-poštna baza',
      data_processing_period_from: '2020-03-01',
      data_processing_period_to: '2025-10-15',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Osebna izkaznica',
      identity_document_number: 'SI1234567',
      file_name: 'zahteva_ana_novak.pdf',
      file_url: '/files/zahteva_ana_novak.pdf',
      organization_type: 'javni sektor',
      notes: 'Prosilka zahteva izbris vseh svojih podatkov iz naših evidenc'
    },
    {
      id: '2',
      request_id: 'ZVOP-2024-002',
      subject_name: 'Marko Kovač',
      subject_email: 'marko.kovac@podjetje.si',
      subject_phone: '+386 51 987 654',
      subject_address: 'Celovška cesta 200, 2000 Maribor',
      subject_type: 'individual',
      request_date: '2025-10-20T14:15:00Z',
      request_type: 'dostop do podatkov',
      status: 'processing',
      response_deadline: '2025-11-19T23:59:59Z',
      legal_basis_17_a: false,
      legal_basis_17_b: true,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Zahteva za dostop do osebnih podatkov po 15. členu GDPR',
      data_categories: ['Kadrovski podatki', 'Plačilni podatki'],
      data_description: 'Mesečne plače, boniteti, davčne informacije',
      data_system_location: 'HR sistem, računovodski sistem',
      data_processing_period_from: '2019-01-01',
      data_processing_period_to: '2025-10-20',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Osebna izkaznica',
      identity_document_number: 'SI9876543',
      file_name: 'zahteva_marko_kovac.pdf',
      file_url: '/files/zahteva_marko_kovac.pdf',
      organization_type: 'zasebni sektor',
      notes: 'Zaposleni zahteva vpogled v svoje osebne podatke'
    },
    {
      id: '3',
      request_id: 'ZVOP-2024-003',
      subject_name: 'Petra Horvat',
      subject_email: 'petra.horvat@gmail.com',
      subject_phone: '+386 40 555 777',
      subject_address: 'Koroška cesta 45, 3000 Celje',
      subject_type: 'individual',
      request_date: '2025-10-25T10:45:00Z',
      request_type: 'popravek podatkov',
      status: 'executed',
      response_deadline: '2025-11-24T23:59:59Z',
      legal_basis_17_a: false,
      legal_basis_17_b: false,
      legal_basis_17_c: true,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Poprava netočnih osebnih podatkov po 16. členu GDPR',
      data_categories: ['Kontaktni podatki', 'Naslovni podatki'],
      data_description: 'Naslov stalnega bivališča',
      data_system_location: 'Spletna trgovina - uporabniški račun',
      data_processing_period_from: '2022-06-15',
      data_processing_period_to: '2025-10-25',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Potni list',
      identity_document_number: 'SL1111111',
      file_name: 'zahteva_petra_horvat.pdf',
      file_url: '/files/zahteva_petra_horvat.pdf',
      organization_type: 'zasebni sektor',
      notes: 'Popravljen naslov stalnega bivališča v uporabniškem računu'
    },
    {
      id: '4',
      request_id: 'ZVOP-2024-004',
      subject_name: 'Tomaž Bergant',
      subject_email: 't.bergant@podjetje-doo.si',
      subject_phone: '+386 30 123 789',
      subject_address: 'Gosposka ulica 12, 9000 Murska Sobota',
      subject_type: 'individual',
      request_date: '2025-11-01T16:20:00Z',
      request_type: 'prenos podatkov',
      status: 'additional_info_required',
      response_deadline: '2025-12-01T23:59:59Z',
      legal_basis_17_a: false,
      legal_basis_17_b: false,
      legal_basis_17_c: false,
      legal_basis_17_d: true,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Prenos podatkov k drugemu upravljavcu po 20. členu GDPR',
      data_categories: ['Računovodski podatki', 'Projektni podatki'],
      data_description: 'Fakture, pogodbe, projekti',
      data_system_location: 'ERP sistem',
      data_processing_period_from: '2021-01-01',
      data_processing_period_to: '2025-11-01',
      identity_verification_status: 'v postopku',
      identity_document_type: 'Osebna izkaznica',
      identity_document_number: 'SI2222222',
      file_name: 'zahteva_tomaz_bergant.pdf',
      file_url: '/files/zahteva_tomaz_bergant.pdf',
      organization_type: 'zasebni sektor',
      notes: 'Zahtevan je prenos podatkov k novemu izvajalcu računovodskih storitev'
    },
    {
      id: '5',
      request_id: 'ZVOP-2024-005',
      subject_name: 'Marija Zorman',
      subject_email: 'marija.zorman@drustvo.org',
      subject_phone: '+386 70 333 444',
      subject_address: 'Trubarjeva cesta 78, 2000 Koper',
      subject_type: 'individual',
      request_date: '2025-11-05T09:10:00Z',
      request_type: 'pravica do pozabe',
      status: 'rejected',
      response_deadline: '2025-12-05T23:59:59Z',
      legal_basis_17_a: false,
      legal_basis_17_b: false,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: true,
      legal_basis_17_f: false,
      legal_basis_description: 'Odmik zahteve za izbris zaradi zakonske obveznosti hranjenja',
      data_categories: ['Pravni podatki', 'Dokumentacija'],
      data_description: 'Pogodbe, potrdila o izobraževanju',
      data_system_location: 'Arhiv društva',
      data_processing_period_from: '2018-09-01',
      data_processing_period_to: '2025-11-05',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Osebna izkaznica',
      identity_document_number: 'SI3333333',
      file_name: 'zahteva_marija_zorman.pdf',
      file_url: '/files/zahteva_marija_zorman.pdf',
      organization_type: 'nevladna organizacija',
      notes: 'Zahteva zavrnjena - podatki so potrebni za izpolnitev zakonskih obveznosti (5 let hranjenja)'
    },
    {
      id: '6',
      request_id: 'ZVOP-2024-006',
      subject_name: 'Janez Potočnik',
      subject_email: 'janez.potocnik@freelancer.com',
      subject_phone: '+386 41 666 888',
      subject_address: 'Ulica heroja Maribora 1, 2000 Maribor',
      subject_type: 'individual',
      request_date: '2025-11-08T13:30:00Z',
      request_type: 'dostop do podatkov',
      status: 'processing',
      response_deadline: '2025-12-08T23:59:59Z',
      legal_basis_17_a: false,
      legal_basis_17_b: true,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Pregled in dostop do osebnih podatkov po 15. členu GDPR',
      data_categories: ['Pogodbeni podatki', 'Kontaktni podatki', 'Projektni podatki'],
      data_description: 'Samostojni podjetnik, podatki o projektih in strankah',
      data_system_location: 'CRM sistem, upravljanje projektov',
      data_processing_period_from: '2023-03-01',
      data_processing_period_to: '2025-11-08',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Osebna izkaznica',
      identity_document_number: 'SI4444444',
      file_name: 'zahteva_janez_potocnik.pdf',
      file_url: '/files/zahteva_janez_potocnik.pdf',
      organization_type: 'samozaposlen',
      notes: 'Samostojni podjetnik zahteva vpogled v podatke, ki se obdelujejo v našem sistemu'
    },
    {
      id: '7',
      request_id: 'ZVOP-2024-007',
      subject_name: 'Nuša Kralj',
      subject_email: 'nusa.kralj@student.uni-lj.si',
      subject_phone: '+386 51 777 999',
      subject_address: 'Kardeljeva ploščad 1, 1000 Ljubljana',
      subject_type: 'individual',
      request_date: '2025-11-09T11:00:00Z',
      request_type: 'pravica do pozabe',
      status: 'received',
      response_deadline: '2025-12-09T23:59:59Z',
      legal_basis_17_a: true,
      legal_basis_17_b: false,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: 'Izbris podatkov študenta po zaključku študija',
      data_categories: ['Študentski podatki', 'Akademski podatki'],
      data_description: 'Vpisni listi, ocene, diplomirane naloge',
      data_system_location: 'Študentski informacijski sistem',
      data_processing_period_from: '2020-10-01',
      data_processing_period_to: '2025-11-09',
      identity_verification_status: 'verificirano',
      identity_document_type: 'Študentska izkaznica',
      identity_document_number: 'SI5555555',
      file_name: 'zahteva_nusa_kralj.pdf',
      file_url: '/files/zahteva_nusa_kralj.pdf',
      organization_type: 'izobraževalna ustanova',
      notes: 'Študentka zaključuje študij in zahteva izbris podatkov po izteku študijskih obveznosti'
    }
  ]

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_right_forgotten')
        .select('*')
        .order('request_date', { ascending: false })
      if (error) throw error
      
      // Če ni podatkov iz baze, uporabi demo podatke
      if (!data || data.length === 0) {
        setIsUsingDemoData(true)
        setRecords(demoRecords)
        setFilteredRecords(demoRecords)
      } else {
        setIsUsingDemoData(false)
        setRecords(data)
        setFilteredRecords(data)
      }
    } catch (error) {
      console.error('Error loading records from database:', error)
      // V primeru napake uporabi demo podatke
      setIsUsingDemoData(true)
      setRecords(demoRecords)
      setFilteredRecords(demoRecords)
    } finally {
      setLoading(false)
    }
  }

  // Filtriranje in iskanje
  useEffect(() => {
    let filtered = records

    // Iskanje po imenu, emailu ali ID-ju
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.request_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtriranje po statusu
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Filtriranje po rokovnikih
    if (deadlineFilter !== 'all') {
      const today = new Date()
      filtered = filtered.filter(record => {
        if (!record.response_deadline) return false
        const deadline = new Date(record.response_deadline)
        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24))
        
        switch (deadlineFilter) {
          case 'overdue': return diffDays < 0
          case 'urgent': return diffDays >= 0 && diffDays <= 3
          case 'normal': return diffDays > 3
          default: return true
        }
      })
    }

    setFilteredRecords(filtered)
    setCurrentPage(1)
  }, [records, searchTerm, statusFilter, deadlineFilter])

  // Paginacija
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  // Izračun dni do rokovnika
  const getDaysToDeadline = (deadlineStr: string) => {
    if (!deadlineStr) return null
    const deadline = new Date(deadlineStr)
    const today = new Date()
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24))
  }

  // Barva rokovnika
  const getDeadlineColor = (days: number | null) => {
    if (days === null) return 'text-text-secondary'
    if (days < 0) return 'text-status-error'
    if (days <= 3) return 'text-status-warning'
    return 'text-text-secondary'
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
  }

  const viewDetails = (record: any) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const editRecordHandler = (record: any) => {
    setEditRecord(record)
    setShowEditModal(true)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
  </div>

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': 
      case 'executed': return 'bg-status-success/10 text-status-success'
      case 'in_progress': 
      case 'processing': return 'bg-status-warning/10 text-status-warning'
      case 'pending':
      case 'received': return 'bg-blue-500/10 text-blue-400'
      case 'rejected': return 'bg-status-error/10 text-status-error'
      case 'additional_info_required': return 'bg-purple-500/10 text-purple-400'
      default: return 'bg-bg-surface text-text-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
      case 'executed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
      case 'processing': return <Clock className="w-4 h-4" />
      case 'rejected': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatLegalBasis = (record: any) => {
    const bases = []
    if (record.legal_basis_17_a) bases.push('a')
    if (record.legal_basis_17_b) bases.push('b')
    if (record.legal_basis_17_c) bases.push('c')
    if (record.legal_basis_17_d) bases.push('d')
    if (record.legal_basis_17_e) bases.push('e')
    if (record.legal_basis_17_f) bases.push('f')
    return bases.length > 0 ? `17(1)${bases.join(',')}` : '-'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Evidence zahtevkov - pravica do pozabe</h1>
            <p className="text-body-sm text-text-secondary">Upravljanje zahtevkov za izbris osebnih podatkov</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Nova zahteva</span>
        </button>
      </div>

      {/* Opozorilo o demo podatkih */}
      {isUsingDemoData && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-400">Prikazani so demo podatki</p>
              <p className="text-xs text-blue-300">Ker baza podatkov trenutno ne vsebuje zapisov ali je prišlo do napake pri povezavi, so prikazani testni podatki. Dodajte nove zahtevke z gumbom "Nova zahteva".</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistike */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Skupaj zahtevkov</p>
              <p className="text-2xl font-semibold text-text-primary">{records.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">V obdelavi</p>
              <p className="text-2xl font-semibold text-text-primary">
                {records.filter(r => ['received', 'processing'].includes(r.status)).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-status-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-status-warning" />
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Izvršeno</p>
              <p className="text-2xl font-semibold text-text-primary">
                {records.filter(r => ['completed', 'executed'].includes(r.status)).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-status-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-status-success" />
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Prekoračen rok</p>
              <p className="text-2xl font-semibold text-text-primary">
                {records.filter(r => r.response_deadline && getDaysToDeadline(r.response_deadline) < 0).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-status-error/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-status-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Iskanje in filtri */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Iskanje po imenu, emailu ali ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="all">Vsi statusi</option>
            <option value="received">Prejeto</option>
            <option value="processing">V obdelavi</option>
            <option value="additional_info_required">Potrebne dodatne info</option>
            <option value="executed">Izvršeno</option>
            <option value="rejected">Zavrnjeno</option>
          </select>
          
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="all">Vsi rokovniki</option>
            <option value="overdue">Prekoračen rok</option>
            <option value="urgent">Nujno (3 dni ali manj)</option>
            <option value="normal">Normalno (več kot 3 dni)</option>
          </select>
          
          <div className="flex items-center text-sm text-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Prikazano: {filteredRecords.length} od {records.length}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">ID Zahteve</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Ime</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Datum</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Pravna podlaga</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Rok</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Kategorije</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Dokumenti</th>
                <th className="text-left px-4 py-3 text-xs text-text-secondary uppercase tracking-wide">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {currentRecords.map((record) => {
                const daysToDeadline = getDaysToDeadline(record.response_deadline)
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-text-primary font-mono">
                      {record.request_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {record.subject_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {record.subject_email}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {new Date(record.request_date).toLocaleDateString('sl-SI')}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="capitalize">
                          {record.status === 'received' && 'Prejeto'}
                          {record.status === 'processing' && 'V obdelavi'}
                          {record.status === 'executed' && 'Izvršeno'}
                          {record.status === 'rejected' && 'Zavrnjeno'}
                          {record.status === 'additional_info_required' && 'Dodatne info'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatLegalBasis(record)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {record.response_deadline ? (
                        <div className={`flex items-center gap-1 ${getDeadlineColor(daysToDeadline)}`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {daysToDeadline !== null && daysToDeadline < 0 
                              ? `${Math.abs(daysToDeadline)} dni zamude`
                              : daysToDeadline !== null && daysToDeadline <= 3
                                ? `${daysToDeadline} dni`
                                : daysToDeadline !== null
                                  ? `${daysToDeadline} dni`
                                  : '-'
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      <div className="flex flex-wrap gap-1">
                        {record.data_categories?.slice(0, 2).map((category: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-bg-near-black rounded text-xs">
                            {category}
                          </span>
                        ))}
                        {record.data_categories?.length > 2 && (
                          <span className="text-xs text-text-muted">
                            +{record.data_categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {record.file_url ? (
                        <a
                          href={record.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent-primary hover:text-accent-primary-hover transition-colors"
                          title={record.file_name}
                        >
                          <FileText className="w-4 h-4" />
                          <Download className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-text-muted text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewDetails(record)}
                          className="p-1 text-text-secondary hover:text-accent-primary transition-colors"
                          title="Poglej podrobnosti"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editRecordHandler(record)}
                          className="p-1 text-text-secondary hover:text-accent-primary transition-colors"
                          title="Uredi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginacija */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
            <div className="text-sm text-text-secondary">
              Prikazano {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} od {filteredRecords.length} zahtevkov
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-accent-primary text-white'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-near-black'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modali */}
      <GDPRRightForgottenAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />

      {/* Edit Modal */}
      <GDPRRightForgottenAddModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          fetchRecords() // Ponovno naloži podatke
          setShowEditModal(false)
          setEditRecord(null)
        }}
        editMode={true}
        editRecord={editRecord}
      />

      {/* Detail modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">
                Podrobnosti zahtevka {selectedRecord.request_id}
              </h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-bg-near-black rounded transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Osnovne informacije */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Identifikacija</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Ime:</strong> {selectedRecord.subject_name}</div>
                    <div><strong>Email:</strong> {selectedRecord.subject_email}</div>
                    <div><strong>Telefon:</strong> {selectedRecord.subject_phone || '-'}</div>
                    <div><strong>Naslov:</strong> {selectedRecord.subject_address || '-'}</div>
                    <div><strong>Tip:</strong> {selectedRecord.subject_type === 'individual' ? 'Fizična oseba' : 'Predstavnik pravne osebe'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Status in rokovnik</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> {selectedRecord.status}</div>
                    <div><strong>Datum zahteve:</strong> {new Date(selectedRecord.request_date).toLocaleDateString('sl-SI')}</div>
                    <div><strong>Rok za odgovor:</strong> {selectedRecord.response_deadline ? new Date(selectedRecord.response_deadline).toLocaleDateString('sl-SI') : '-'}</div>
                    <div><strong>Tip organizacije:</strong> {selectedRecord.organization_type || '-'}</div>
                    <div><strong>Dni do roka:</strong> {getDaysToDeadline(selectedRecord.response_deadline) || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Pravna podlaga */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Pravna podlaga (GDPR člen 17)</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Podlaga:</strong> {formatLegalBasis(selectedRecord)}</div>
                  <div><strong>Opis:</strong> {selectedRecord.legal_basis_description || '-'}</div>
                </div>
              </div>

              {/* Podatki za izbris */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Podatki za izbris</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Kategorije:</strong> {selectedRecord.data_categories?.join(', ') || '-'}</div>
                  <div><strong>Opis:</strong> {selectedRecord.data_description || '-'}</div>
                  <div><strong>Sistem:</strong> {selectedRecord.data_system_location || '-'}</div>
                  <div><strong>Obdobje obdelave:</strong> 
                    {selectedRecord.data_processing_period_from || selectedRecord.data_processing_period_to 
                      ? `${selectedRecord.data_processing_period_from || '?'} - ${selectedRecord.data_processing_period_to || '?'}`
                      : '-'
                    }
                  </div>
                </div>
              </div>

              {/* Verifikacija identitete */}
              <div>
                <h4 className="font-medium text-text-primary mb-3">Verifikacija identitete</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Status verifikacije:</strong> {selectedRecord.identity_verification_status || '-'}</div>
                  <div><strong>Tip dokumenta:</strong> {selectedRecord.identity_document_type || '-'}</div>
                  <div><strong>Številka dokumenta:</strong> {selectedRecord.identity_document_number || '-'}</div>
                  {selectedRecord.file_url && (
                    <div><strong>Priloženi dokument:</strong> 
                      <a href={selectedRecord.file_url} target="_blank" rel="noopener noreferrer" 
                         className="ml-2 text-accent-primary hover:text-accent-primary-hover">
                        {selectedRecord.file_name || 'Prenesi'}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Opombe */}
              {selectedRecord.notes && (
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Dodatne opombe</h4>
                  <p className="text-sm text-text-secondary">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
