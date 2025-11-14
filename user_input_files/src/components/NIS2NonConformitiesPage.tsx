import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface NonConformity {
  id: string
  identification_code: string
  title: string
  description: string
  severity: 'nizka' | 'srednja' | 'visoka' | 'kriticna'
  status: 'odprto' | 'v-obdelavi' | 'reseno' | 'zaprto' | 'zavrnjeno'
  reported_by?: string
  assigned_to?: string
  detection_date: string
  due_date?: string
  resolution_date?: string
  root_cause?: string
  corrective_action?: string
  preventive_action?: string
  verification_status: 'neprevereno' | 'prevereno' | 'odobreno' | 'zavrnjeno'
  verified_by?: string
  nis2_requirement?: string
  impact_assessment?: string
  business_impact?: string
  compliance_notes?: string
  created_at: string
  updated_at: string
}

interface NIS2NonConformitiesPageProps {
  setCurrentPage: (page: string) => void
}

const supabase = createClient(
  'https://ckxlbiiirfdogobccmjs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGxiaWlpcmZkb2dvYmNjbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjI5NjIsImV4cCI6MjA3NzQzODk2Mn0.Y8T0bCsL5t_9u71z-yHYxrdyl4rqPN3fUMBg9k-p_TA'
)

export default function NIS2NonConformitiesPage({ setCurrentPage }: NIS2NonConformitiesPageProps) {
  const { t } = useTranslation()
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<NonConformity | null>(null)

  // Test data (demo examples)
  const demoData: NonConformity[] = [
    {
      id: '1',
      identification_code: 'NC-2024-001',
      title: 'Neavtoriziran dostop do strežniške sobe',
      description: 'Med varnostnim pregledom je bilo ugotovljeno, da strežniška soba nima ustreznih fizičnih kontrol dostopa. Vrata niso bila zaklenjena, dostop pa je omogočen vsem zaposlenim.',
      severity: 'visoka',
      status: 'v-obdelavi',
      reported_by: 'Janez Novak',
      assigned_to: 'Marko Kovač',
      detection_date: '2025-10-25',
      due_date: '2025-11-08',
      root_cause: 'Sistem za nadzor dostopa je zaradi tehnične napake prenehal delovati',
      corrective_action: 'Zamenjava ključavnice in popravilo sistema za nadzor dostopa',
      preventive_action: 'Implementacija rednega mesečnega pregleda sistemov dostopa',
      nis2_requirement: 'Člen 21 - Fizična varnost',
      impact_assessment: 'Visok rizik za varnost IT infrastrukture',
      business_impact: 'Možnost neavtoriziranega dostopa do kritičnih sistemov',
      compliance_notes: 'Kršitev zahtev za fizično varnost po NIS 2 direktivi',
      verification_status: 'prevereno',
      verified_by: 'Ana Plans',
      created_at: '2024-11-01T08:00:00Z',
      updated_at: '2024-11-02T10:30:00Z'
    },
    {
      id: '2',
      identification_code: 'NC-2024-002',
      title: 'Manjkajoči varnostni posodobitve na Windows strežniku',
      description: 'Windows strežnik (SRV-APP-01) nima nameščenih varnostnih posodobitev za zadnjih 6 mesecev. Odkritih je bilo 23 kritičnih ranljivosti.',
      severity: 'kriticna',
      status: 'odprto',
      reported_by: 'Sistem za spremljanje',
      assigned_to: 'Tomaž Vesel',
      detection_date: '2025-10-15',
      due_date: '2025-11-12',
      root_cause: 'Avtomatsko nameščanje posodobitev je bilo onemogočeno',
      corrective_action: 'Namestitev vseh kritičnih varnostnih posodobitev',
      preventive_action: 'Aktiviranje avtomatskega nameščanja varnostnih posodobitev',
      nis2_requirement: 'Člen 21 - Varnost v kibernetskem prostoru',
      impact_assessment: 'Kritična ranljivost za kibernetske napade',
      business_impact: 'Visok rizik za podatke in sisteme, možna okvara storitev',
      compliance_notes: 'Kršitev zahtev za upravljanje ranljivosti',
      verification_status: 'neprevereno',
      created_at: '2024-10-28T14:20:00Z',
      updated_at: '2024-10-28T14:20:00Z'
    },
    {
      id: '3',
      identification_code: 'NC-2024-003',
      title: 'Neustrezno varovanje osebnih podatkov strank',
      description: 'Med internim pregledom je bilo ugotovljeno, da so osebni podatki strank shranjeni v neencriptirani bazi podatkov, ki ni ustrezno zaščitena.',
      severity: 'visoka',
      status: 'reseno',
      reported_by: 'Petra Mlakar',
      assigned_to: 'Milan Krek',
      detection_date: '2025-10-20',
      due_date: '2025-11-05',
      resolution_date: '2024-10-30',
      root_cause: 'Pri implementaciji novega sistema baze podatkov ni bilo vključeno šifriranje',
      corrective_action: 'Implementacija šifriranja baze podatkov in sprememba varnostnih politik',
      preventive_action: 'Vključitev varnostnih zahtev v proces razvoja',
      nis2_requirement: 'Člen 28 - Varstvo podatkov',
      impact_assessment: 'Visok rizik za osebne podatke strank',
      business_impact: 'Kršitev GDPR, možne kazni in škoda ugleda',
      compliance_notes: 'Implementirana ustrezna varnostna zaščita',
      verification_status: 'odobreno',
      verified_by: 'Urška Gorišek',
      created_at: '2024-10-15T09:15:00Z',
      updated_at: '2024-10-30T16:45:00Z'
    },
    {
      id: '4',
      identification_code: 'NC-2024-004',
      title: 'Nedostopne varnostne kopije več kot 24 ur',
      description: 'Sistem za varnostne kopije ne deluje že 36 ur. Ni mogoče ugotoviti, kdaj so bile nazadnje uspešno narejene varnostne kopije ključnih sistemov.',
      severity: 'srednja',
      status: 'zaprto',
      reported_by: 'Peter Bergant',
      assigned_to: 'Luka Potočnik',
      detection_date: '2025-10-28',
      due_date: '2025-11-10',
      resolution_date: '2024-10-22',
      root_cause: 'Napaka v mrežni povezavi med primarnim sistemom in strežnikom za varnostne kopije',
      corrective_action: 'Popravilo mrežne povezave in izdelava zamujenih varnostnih kopij',
      preventive_action: 'Implementacija spremljanja povezav in avtomatskih opozoril',
      nis2_requirement: 'Člen 21 - Varnost podatkov',
      impact_assessment: 'Srednji rizik zaradi nedostopnih varnostnih kopij',
      business_impact: 'Povečan rizik v primeru izpada glavnih sistemov',
      compliance_notes: 'Rešeno, varnostne kopije so ponovno na voljo',
      verification_status: 'odobreno',
      verified_by: 'Barbara Zorman',
      created_at: '2024-10-20T11:30:00Z',
      updated_at: '2024-10-22T14:20:00Z'
    },
    {
      id: '5',
      identification_code: 'NC-2024-005',
      title: 'Potreba po posodobitvi varnostne politike',
      description: 'Varnostna politika za uporabo mobilnih naprav ni bila posodobljena že 2 leti. Potrebna je posodobitev glede novejših groženj in tehnologij.',
      severity: 'nizka',
      status: 'v-obdelavi',
      reported_by: 'Katja Horvat',
      assigned_to: 'Aleš Markič',
      detection_date: '2025-11-01',
      due_date: '2025-11-15',
      root_cause: 'Ni bila dodeljena odgovornost za redno posodabljanje politik',
      corrective_action: 'Ažuriranje varnostne politike za mobilne naprave',
      preventive_action: 'Dodelitev odgovornosti za redno letno posodabljanje politik',
      nis2_requirement: 'Člen 21 - Varnostna politika',
      impact_assessment: 'Nizek rizik, vendar potrebno zaradi sprememb v tehnologiji',
      business_impact: 'Manjša pomanjkanja v urejenosti varnostnih postopkov',
      compliance_notes: 'V postopku posodobitve',
      verification_status: 'neprevereno',
      created_at: '2024-11-05T13:45:00Z',
      updated_at: '2024-11-06T08:15:00Z'
    }
  ]

  // Form state
  const [formData, setFormData] = useState<{
    identification_code: string
    title: string
    description: string
    severity: 'nizka' | 'srednja' | 'visoka' | 'kriticna'
    status: 'odprto' | 'v-obdelavi' | 'reseno' | 'zaprto' | 'zavrnjeno'
    reported_by: string
    assigned_to: string
    detection_date: string
    due_date: string
    root_cause: string
    corrective_action: string
    preventive_action: string
    nis2_requirement: string
    impact_assessment: string
    business_impact: string
    compliance_notes: string
  }>({
    identification_code: '',
    title: '',
    description: '',
    severity: 'srednja',
    status: 'odprto',
    reported_by: '',
    assigned_to: '',
    detection_date: '',
    due_date: '',
    root_cause: '',
    corrective_action: '',
    preventive_action: '',
    nis2_requirement: '',
    impact_assessment: '',
    business_impact: '',
    compliance_notes: ''
  })

  // Load non-conformities
  const loadNonConformities = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('non_conformities')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,identification_code.ilike.%${searchTerm}%`)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }
      if (severityFilter) {
        query = query.eq('severity', severityFilter)
      }

      const { data, error } = await query

      if (error) throw error
      
      // If no data in database, use demo data
      if (!data || data.length === 0) {
        setNonConformities(demoData)
      } else {
        setNonConformities(data)
      }
    } catch (error) {
      console.error('Error loading non-conformities:', error)
      // On error, use demo data as fallback
      setNonConformities(demoData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNonConformities()
  }, [searchTerm, statusFilter, severityFilter])

  // Reset form
  const resetForm = () => {
    setFormData({
      identification_code: '',
      title: '',
      description: '',
      severity: 'srednja',
      status: 'odprto',
      reported_by: '',
      assigned_to: '',
      detection_date: '',
      due_date: '',
      root_cause: '',
      corrective_action: '',
      preventive_action: '',
      nis2_requirement: '',
      impact_assessment: '',
      business_impact: '',
      compliance_notes: ''
    } as any)
    setEditingItem(null)
  }

  // Open modal for adding/editing
  const openModal = (item?: NonConformity) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        identification_code: item.identification_code,
        title: item.title,
        description: item.description,
        severity: item.severity,
        status: item.status,
        reported_by: item.reported_by || '',
        assigned_to: item.assigned_to || '',
        detection_date: item.detection_date,
        due_date: item.due_date || '',
        root_cause: item.root_cause || '',
        corrective_action: item.corrective_action || '',
        preventive_action: item.preventive_action || '',
        nis2_requirement: item.nis2_requirement || '',
        impact_assessment: item.impact_assessment || '',
        business_impact: item.business_impact || '',
        compliance_notes: item.compliance_notes || ''
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Save non-conformity
  const saveNonConformity = async () => {
    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from('non_conformities')
          .update(formData)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        // Insert new - generate identification code
        const { data: codeData } = await supabase.rpc('generate_nc_code')
        const identification_code = codeData || `NC-${new Date().getFullYear()}-${String(nonConformities.length + 1).padStart(3, '0')}`

        const { error } = await supabase
          .from('non_conformities')
          .insert([{
            ...formData,
            identification_code
          }])

        if (error) throw error
      }

      closeModal()
      loadNonConformities()
    } catch (error) {
      console.error('Error saving non-conformity:', error)
      alert('Napaka pri shranjevanju neskladnosti')
    }
  }

  // Delete non-conformity
  const deleteNonConformity = async (id: string) => {
    if (confirm('Ali ste prepričani, da želite izbrisati to neskladnost?')) {
      try {
        const { error } = await supabase
          .from('non_conformities')
          .delete()
          .eq('id', id)

        if (error) throw error
        loadNonConformities()
      } catch (error) {
        console.error('Error deleting non-conformity:', error)
        alert('Napaka pri brisanju neskladnosti')
      }
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'odprto': return 'text-red-500 bg-red-500/10'
      case 'v-obdelavi': return 'text-yellow-500 bg-yellow-500/10'
      case 'reseno': return 'text-green-500 bg-green-500/10'
      case 'zaprto': return 'text-gray-500 bg-gray-500/10'
      case 'zavrnjeno': return 'text-purple-500 bg-purple-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  // Get severity badge color
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'nizka': return 'text-green-500 bg-green-500/10'
      case 'srednja': return 'text-yellow-500 bg-yellow-500/10'
      case 'visoka': return 'text-red-500 bg-red-500/10'
      case 'kriticna': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'odprto': return <AlertTriangle className="w-4 h-4" />
      case 'v-obdelavi': return <Clock className="w-4 h-4" />
      case 'reseno': return <CheckCircle className="w-4 h-4" />
      case 'zaprto': return <CheckCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidenca neskladnosti</h1>
          <p className="text-text-tertiary mt-1">
            Upravljanje neskladnosti in korektivnih ukrepov po NIS 2 direktivi
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj neskladnost
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
              placeholder="Iskanje po naslovu ali kodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="">Vsi statusi</option>
            <option value="odprto">Odprto</option>
            <option value="v-obdelavi">V obdelavi</option>
            <option value="reseno">Rešeno</option>
            <option value="zaprto">Zaprto</option>
            <option value="zavrnjeno">Zavrnjeno</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="">Vse resnosti</option>
            <option value="nizka">Nizka</option>
            <option value="srednja">Srednja</option>
            <option value="visoka">Visoka</option>
            <option value="kriticna">Kritična</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setSeverityFilter('')
            }}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
          >
            Počisti filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-subtle">
              <tr>
                <th className="text-left p-4 text-text-secondary font-medium">Koda</th>
                <th className="text-left p-4 text-text-secondary font-medium">Naslov</th>
                <th className="text-left p-4 text-text-secondary font-medium">Resnost</th>
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-left p-4 text-text-secondary font-medium">Dodeljeno</th>
                <th className="text-left p-4 text-text-secondary font-medium">Rok</th>
                <th className="text-left p-4 text-text-secondary font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-tertiary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                  </td>
                </tr>
              ) : nonConformities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-tertiary">
                    Ni najdenih neskladnosti
                  </td>
                </tr>
              ) : (
                nonConformities.map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle hover:bg-bg-near-black transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{item.identification_code}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-text-primary font-medium">{item.title}</div>
                      <div className="text-text-tertiary text-sm mt-1">{item.description.substring(0, 100)}...</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeColor(item.severity)}`}>
                        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('-', ' ').charAt(0).toUpperCase() + item.status.replace('-', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">{item.assigned_to || 'Nedodeljeno'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary">{item.due_date || 'Brez roka'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNonConformity(item.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
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

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-primary">
                {editingItem ? 'Uredi neskladnost' : 'Dodaj novo neskladnost'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Identifikacijska koda</label>
                  <input
                    type="text"
                    value={formData.identification_code}
                    onChange={(e) => setFormData({ ...formData, identification_code: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Samodejno generirano"
                    disabled={!!editingItem}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Naslov *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Naslov neskladnosti"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Opis *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  placeholder="Podroben opis neskladnosti"
                  required
                />
              </div>

              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Resnost *</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  >
                    <option value="nizka">Nizka</option>
                    <option value="srednja">Srednja</option>
                    <option value="visoka">Visoka</option>
                    <option value="kriticna">Kritična</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  >
                    <option value="odprto">Odprto</option>
                    <option value="v-obdelavi">V obdelavi</option>
                    <option value="reseno">Rešeno</option>
                    <option value="zaprto">Zaprto</option>
                    <option value="zavrnjeno">Zavrnjeno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">NIS 2 zahteva</label>
                  <input
                    type="text"
                    value={formData.nis2_requirement}
                    onChange={(e) => setFormData({ ...formData, nis2_requirement: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="npr. Člen 21"
                  />
                </div>
              </div>

              {/* Personnel and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Prijavil</label>
                  <input
                    type="text"
                    value={formData.reported_by}
                    onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Ime in priimek"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Dodeljeno</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Ime in priimek"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Datum odkritja *</label>
                  <input
                    type="date"
                    value={formData.detection_date}
                    onChange={(e) => setFormData({ ...formData, detection_date: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Rok za rešitev</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Vzrok neskladnosti</label>
                <textarea
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  placeholder="Opis vzroka, ki je privedel do neskladnosti"
                />
              </div>

              {/* Corrective Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Korektivni ukrep</label>
                  <textarea
                    value={formData.corrective_action}
                    onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Ukrep za odpravo trenutne neskladnosti"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Preventivni ukrep</label>
                  <textarea
                    value={formData.preventive_action}
                    onChange={(e) => setFormData({ ...formData, preventive_action: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Ukrep za preprečitev ponovitve"
                  />
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Ocena vpliva</label>
                  <textarea
                    value={formData.impact_assessment}
                    onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Ocena vpliva neskladnosti na varnost"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Vpliv na poslovanje</label>
                  <textarea
                    value={formData.business_impact}
                    onChange={(e) => setFormData({ ...formData, business_impact: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                    placeholder="Vpliv na poslovne procese in dejavnosti"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Opombe o skladnosti</label>
                <textarea
                  value={formData.compliance_notes}
                  onChange={(e) => setFormData({ ...formData, compliance_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                  placeholder="Dodatne opombe o skladnosti z NIS 2 direktivo"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
              >
                Prekliči
              </button>
              <button
                onClick={saveNonConformity}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg transition-colors"
              >
                {editingItem ? 'Shrani spremembe' : 'Dodaj neskladnost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}