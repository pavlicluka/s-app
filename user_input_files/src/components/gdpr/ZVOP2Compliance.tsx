import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '../../hooks/useOrganization'
import { 
  Shield, 
  Plus, 
  FileText, 
  Download, 
  AlertCircle, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Globe,
  Database,
  Lock,
  Eye,
  AlertTriangle,
  Scale,
  Building,
  BookOpen,
  BarChart3,
  TrendingUp,
  Bell,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface ZVOP2Requirement {
  id: string
  complianceArea: string
  requirementCategory: string
  requirementDescription: string
  legalBasis: string
  implementationStatus: 'implemented' | 'in_progress' | 'not_started' | 'non_compliant'
  responsiblePerson: string
  responsiblePersonEmail: string
  department: string
  deadline?: string
  lastReviewDate?: string
  nextReviewDate?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  impact: 'individual' | 'organization' | 'both'
  gdprAlignment: 'full' | 'partial' | 'none'
  zvokRequired: boolean
  documentationRequired: boolean
  trainingRequired: boolean
  fileUrl?: string
  fileName?: string
  complianceScore: number
  notes?: string
  digitalSystemRequired: boolean
  covid19Related: boolean
}

export default function ZVOP2Compliance() {
  const { t } = useTranslation()
  const { organizationId, loading: orgLoading, error: orgError } = useOrganization()
  const [requirements, setRequirements] = useState<ZVOP2Requirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [filterAlignment, setFilterAlignment] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<ZVOP2Requirement | null>(null)

  // Mock data reflecting actual ZVOP-2 requirements
  const mockZVOP2Requirements: ZVOP2Requirement[] = [
    {
      id: '1',
      complianceArea: 'Obdelava posebnih kategorij podatkov',
      requirementCategory: 'Člen 17 ZVOP-2',
      requirementDescription: 'Obdelava osebnih podatkov o verskem ali filozofskem prepričanju, političnem mnenju ali članstvu v sindikatu, genetskih podatkih, biometričnih podatkih, zdravstvenih podatkih ali podatkih o spolnem življenju ali spolni usmerjenosti',
      legalBasis: 'Člen 17 ZVOP-2',
      implementationStatus: 'implemented',
      responsiblePerson: 'Janez Novak',
      responsiblePersonEmail: 'janez.novak@company.com',
      department: 'IT & Varnost',
      deadline: '2024-12-15',
      lastReviewDate: '2024-11-01',
      nextReviewDate: '2025-11-01',
      riskLevel: 'critical',
      impact: 'individual',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      fileUrl: '/documents/special-categories-policy.pdf',
      fileName: 'special-categories-policy.pdf',
      complianceScore: 95,
      notes: 'Vsi procesi ustrezajo zahtevam, redno usposabljanje osebja',
      digitalSystemRequired: true,
      covid19Related: false
    },
    {
      id: '2',
      complianceArea: 'Obvestila o kršitvah varnosti',
      requirementCategory: 'Člen 32 ZVOP-2',
      requirementDescription: 'Obvezno obveščanje ZVOK in posameznikov o kršitvah varnosti osebnih podatkov v 72 urah',
      legalBasis: 'Člen 32 ZVOP-2',
      implementationStatus: 'in_progress',
      responsiblePerson: 'Maria Kovač',
      responsiblePersonEmail: 'maria.kovac@company.com',
      department: 'Pravna služba',
      deadline: '2024-12-20',
      lastReviewDate: '2024-10-15',
      nextReviewDate: '2025-01-15',
      riskLevel: 'high',
      impact: 'both',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      fileUrl: '/documents/breach-procedure.pdf',
      fileName: 'breach-procedure.pdf',
      complianceScore: 78,
      notes: 'Postopki definirani, potrebno testiranje sistema za samodejno obveščanje',
      digitalSystemRequired: true,
      covid19Related: false
    },
    {
      id: '3',
      complianceArea: 'Pravice posameznikov',
      requirementCategory: 'Člen 20 ZVOP-2',
      requirementDescription: 'Izvajanje pravic posameznikov: dostop do podatkov, popravek, izbris, prenos, ugovor',
      legalBasis: 'Člen 20 ZVOP-2',
      implementationStatus: 'implemented',
      responsiblePerson: 'Ana Popović',
      responsiblePersonEmail: 'ana.popovic@company.com',
      department: 'GDPR skrbniki',
      deadline: '2024-11-30',
      lastReviewDate: '2024-11-20',
      nextReviewDate: '2025-05-20',
      riskLevel: 'high',
      impact: 'individual',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      complianceScore: 92,
      notes: 'Vsi procesi za pravice posameznikov ustrezno implementirani',
      digitalSystemRequired: true,
      covid19Related: false
    },
    {
      id: '4',
      complianceArea: 'Skladnost za male organizacije',
      requirementCategory: 'Posebne določbe za MPS',
      requirementDescription: 'Prilagojene obveznosti za mikro, majhne in srednje organizacije skladno z velikostjo in obsegom obdelave',
      legalBasis: 'Člen 55 ZVOP-2',
      implementationStatus: 'not_started',
      responsiblePerson: 'Marko Stergar',
      responsiblePersonEmail: 'marko.stergar@company.com',
      department: 'Uprava',
      deadline: '2025-01-31',
      riskLevel: 'medium',
      impact: 'organization',
      gdprAlignment: 'partial',
      zvokRequired: false,
      documentationRequired: true,
      trainingRequired: false,
      complianceScore: 25,
      notes: 'Potrebna analiza velikosti organizacije in prilagoditev obveznosti',
      digitalSystemRequired: false,
      covid19Related: false
    },
    {
      id: '5',
      complianceArea: 'Digitalni sistem ZVOP-2',
      requirementCategory: 'Člen 48 ZVOP-2',
      requirementDescription: 'Uporaba digitalnega sistema za vodenje evidenc in obveznosti po ZVOP-2',
      legalBasis: 'Člen 48 ZVOP-2',
      implementationStatus: 'implemented',
      responsiblePerson: 'Peter Horvat',
      responsiblePersonEmail: 'peter.horvat@company.com',
      department: 'IT oddelek',
      deadline: '2024-12-10',
      lastReviewDate: '2024-11-25',
      nextReviewDate: '2025-06-25',
      riskLevel: 'medium',
      impact: 'both',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      fileUrl: '/documents/digital-system-guide.pdf',
      fileName: 'digital-system-guide.pdf',
      complianceScore: 88,
      notes: 'Digitalni sistem ustrezno implementiran in v uporabi',
      digitalSystemRequired: true,
      covid19Related: false
    },
    {
      id: '6',
      complianceArea: 'Podatki o zdravju',
      requirementCategory: 'Člen 18 ZVOP-2',
      requirementDescription: 'Posebne zahteve za obdelavo zdravstvenih podatkov in medicinskih evidenc',
      legalBasis: 'Člen 18 ZVOP-2',
      implementationStatus: 'implemented',
      responsiblePerson: 'Dr. Eva Žagar',
      responsiblePersonEmail: 'eva.zagar@company.com',
      department: 'Medicinski oddelek',
      deadline: '2024-11-20',
      lastReviewDate: '2024-11-10',
      nextReviewDate: '2025-02-10',
      riskLevel: 'critical',
      impact: 'individual',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      fileUrl: '/documents/health-data-procedure.pdf',
      fileName: 'health-data-procedure.pdf',
      complianceScore: 90,
      notes: 'Strogi ukrepi varovanja zdravstvenih podatkov',
      digitalSystemRequired: true,
      covid19Related: true
    },
    {
      id: '7',
      complianceArea: 'Kazenske določbe',
      requirementCategory: 'Člen 62 ZVOP-2',
      requirementDescription: 'Ozaveščanje o kazenskih določbah in upravnih ukrepih za neskladnost',
      legalBasis: 'Člen 62 ZVOP-2',
      implementationStatus: 'implemented',
      responsiblePerson: 'Aljaž Kavčič',
      responsiblePersonEmail: 'aljaz.kavcic@company.com',
      department: 'Pravna služba',
      deadline: '2024-12-01',
      lastReviewDate: '2024-11-15',
      nextReviewDate: '2025-03-15',
      riskLevel: 'high',
      impact: 'organization',
      gdprAlignment: 'partial',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      fileUrl: '/documents/legal-awareness.pdf',
      fileName: 'legal-awareness.pdf',
      complianceScore: 85,
      notes: 'Redno usposabljanje o kaznih in sankcijah',
      digitalSystemRequired: false,
      covid19Related: false
    },
    {
      id: '8',
      complianceArea: 'Prenos podatkov',
      requirementCategory: 'Člen 23 ZVOP-2',
      requirementDescription: 'Pravila za prenos osebnih podatkov v tretje države ali mednarodne organizacije',
      legalBasis: 'Člen 23 ZVOP-2',
      implementationStatus: 'in_progress',
      responsiblePerson: 'Nina Kralj',
      responsiblePersonEmail: 'nina.kralj@company.com',
      department: 'Mednarodni odnosi',
      deadline: '2025-01-15',
      lastReviewDate: '2024-10-30',
      nextReviewDate: '2025-04-30',
      riskLevel: 'high',
      impact: 'individual',
      gdprAlignment: 'full',
      zvokRequired: true,
      documentationRequired: true,
      trainingRequired: true,
      complianceScore: 70,
      notes: 'Potrebno posodobitev sporazumov s tretjimi državami',
      digitalSystemRequired: false,
      covid19Related: false
    }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRequirements(mockZVOP2Requirements)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.requirementDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.complianceArea.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || req.implementationStatus === filterStatus
    const matchesArea = !filterArea || req.complianceArea === filterArea
    const matchesRisk = !filterRisk || req.riskLevel === filterRisk
    const matchesAlignment = !filterAlignment || req.gdprAlignment === filterAlignment
    return matchesSearch && matchesStatus && matchesArea && matchesRisk && matchesAlignment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-500 bg-green-500/10'
      case 'in_progress': return 'text-yellow-500 bg-yellow-500/10'
      case 'not_started': return 'text-red-500 bg-red-500/10'
      case 'non_compliant': return 'text-red-600 bg-red-600/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'not_started': return <XCircle className="w-4 h-4" />
      case 'non_compliant': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'high': return 'text-orange-500 bg-orange-500/10'
      case 'critical': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'full': return 'text-green-500 bg-green-500/10'
      case 'partial': return 'text-yellow-500 bg-yellow-500/10'
      case 'none': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getComplianceAreaIcon = (area: string) => {
    if (area.includes('zdravje')) return <User className="w-4 h-4" />
    if (area.includes('digitalni')) return <Database className="w-4 h-4" />
    if (area.includes('kršitve')) return <AlertTriangle className="w-4 h-4" />
    if (area.includes('pravice')) return <Scale className="w-4 h-4" />
    if (area.includes('mal')) return <Building className="w-4 h-4" />
    if (area.includes('prenos')) return <Globe className="w-4 h-4" />
    if (area.includes('kazenske')) return <BookOpen className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  const getStats = () => {
    const total = requirements.length
    const implemented = requirements.filter(r => r.implementationStatus === 'implemented').length
    const inProgress = requirements.filter(r => r.implementationStatus === 'in_progress').length
    const notStarted = requirements.filter(r => r.implementationStatus === 'not_started').length
    const critical = requirements.filter(r => r.riskLevel === 'critical').length
    const gdprFull = requirements.filter(r => r.gdprAlignment === 'full').length
    const avgScore = requirements.reduce((acc, r) => acc + r.complianceScore, 0) / total

    return { total, implemented, inProgress, notStarted, critical, gdprFull, avgScore }
  }

  const stats = getStats()

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const isDueSoon = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0
  }

  const handleAddNew = () => {
    setShowAddModal(true)
  }

  const handleViewRequirement = (requirement: ZVOP2Requirement) => {
    setSelectedRequirement(requirement)
    setShowViewModal(true)
  }

  const handleEditRequirement = (requirement: ZVOP2Requirement) => {
    setSelectedRequirement(requirement)
    setShowAddModal(true)
  }

  const handleDeleteRequirement = (requirement: ZVOP2Requirement) => {
    if (window.confirm(`Ali ste prepričani, da želite izbrisati zahtevo "${requirement.complianceArea}"?`)) {
      setRequirements(prev => prev.filter(r => r.id !== requirement.id))
    }
  }

  const handleSave = () => {
    setShowAddModal(false)
    setShowViewModal(false)
    setSelectedRequirement(null)
    // Reload data if needed
  }

  if (orgLoading || loading) {
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Dostop zavrnjen</h2>
          <p className="text-body text-text-secondary">
            {orgError || 'Organizacija ni najdena'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">ZVOP-2 Skladnost</h1>
              <p className="text-text-secondary">
                Sledenje zahtevam Zakona o varstvu osebnih podatkov 2 (ZVOP-2) in digitalni sistem
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200">
              <Download className="w-4 h-4 inline-block mr-2" />
              Izvozi poročilo
            </button>
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              Nova zahteva
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-accent-primary" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
              <div className="text-sm text-text-secondary">Skupaj zahtev</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.implemented}</div>
              <div className="text-sm text-text-secondary">Implementirano</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{Math.round(stats.avgScore)}%</div>
              <div className="text-sm text-text-secondary">Povprečna ocena</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.critical}</div>
              <div className="text-sm text-text-secondary">Kritična tveganja</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Išči po opisu, odgovorni osebi ali področju..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsi statusi</option>
            <option value="implemented">Implementirano</option>
            <option value="in_progress">V teku</option>
            <option value="not_started">Ni začeto</option>
            <option value="non_compliant">Neskladno</option>
          </select>
          <select 
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsa področja</option>
            <option value="Obdelava posebnih kategorij podatkov">Posebne kategorije</option>
            <option value="Obvestila o kršitvah varnosti">Kršitve varnosti</option>
            <option value="Pravice posameznikov">Pravice posameznikov</option>
            <option value="Skladnost za male organizacije">Male organizacije</option>
            <option value="Digitalni sistem ZVOP-2">Digitalni sistem</option>
            <option value="Podatki o zdravju">Zdravstveni podatki</option>
            <option value="Kazenske določbe">Kazenske določbe</option>
            <option value="Prenos podatkov">Prenos podatkov</option>
          </select>
          <select 
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsa tveganja</option>
            <option value="low">Nizko</option>
            <option value="medium">Srednje</option>
            <option value="high">Visoko</option>
            <option value="critical">Kritično</option>
          </select>
          <select 
            value={filterAlignment}
            onChange={(e) => setFilterAlignment(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsi GDPR alignmenti</option>
            <option value="full">Polno usklajeno</option>
            <option value="partial">Delno usklajeno</option>
            <option value="none">Ni usklajeno</option>
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        {filteredRequirements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-pure-black border-b border-border-subtle">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Področje</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Zahteva</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Odgovorna oseba</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Rok</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Tveganje</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">GDPR</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Ocena</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Dokumenti</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredRequirements.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getComplianceAreaIcon(req.complianceArea)}
                        <div>
                          <div className="font-medium text-text-primary text-sm max-w-[200px]">
                            {req.complianceArea}
                          </div>
                          <div className="text-xs text-text-secondary">{req.requirementCategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-[300px]">
                        {req.requirementDescription}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {req.zvokRequired && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">ZVOK</span>
                        )}
                        {req.documentationRequired && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Dok.</span>
                        )}
                        {req.trainingRequired && (
                          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded">Uspos.</span>
                        )}
                        {req.digitalSystemRequired && (
                          <span className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded">Digital</span>
                        )}
                        {req.covid19Related && (
                          <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded">COVID-19</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.implementationStatus)}`}>
                        {getStatusIcon(req.implementationStatus)}
                        {req.implementationStatus === 'implemented' ? 'Implementirano' :
                         req.implementationStatus === 'in_progress' ? 'V teku' :
                         req.implementationStatus === 'not_started' ? 'Ni začeto' : 'Neskladno'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-secondary" />
                        <div>
                          <div className="text-sm text-text-primary">{req.responsiblePerson}</div>
                          <div className="text-xs text-text-secondary">{req.responsiblePersonEmail}</div>
                          <div className="text-xs text-text-tertiary">{req.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <div className={`text-sm ${isOverdue(req.deadline) ? 'text-red-500 font-medium' : isDueSoon(req.deadline) ? 'text-yellow-500 font-medium' : 'text-text-secondary'}`}>
                            {req.deadline ? new Date(req.deadline).toLocaleDateString('sl-SI') : '-'}
                          </div>
                          {isOverdue(req.deadline) && (
                            <div className="text-xs text-red-500">ZAMUJENO</div>
                          )}
                          {isDueSoon(req.deadline) && !isOverdue(req.deadline) && (
                            <div className="text-xs text-yellow-500">KMALU</div>
                          )}
                          {req.lastReviewDate && (
                            <div className="text-xs text-text-tertiary">
                              Zadnji pregled: {new Date(req.lastReviewDate).toLocaleDateString('sl-SI')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(req.riskLevel)}`}>
                        {req.riskLevel === 'low' ? 'Nizko' :
                         req.riskLevel === 'medium' ? 'Srednje' :
                         req.riskLevel === 'high' ? 'Visoko' : 'Kritično'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlignmentColor(req.gdprAlignment)}`}>
                        {req.gdprAlignment === 'full' ? 'Polno' :
                         req.gdprAlignment === 'partial' ? 'Delno' : 'Ni'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-medium ${req.complianceScore >= 80 ? 'text-green-500' : req.complianceScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {req.complianceScore}%
                        </div>
                        <div className="w-16 bg-bg-near-black rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              req.complianceScore >= 80 ? 'bg-green-500' : 
                              req.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${req.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.fileUrl ? (
                        <a
                          href={req.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent-primary hover:text-accent-primary-hover transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm truncate max-w-[100px]">
                            {req.fileName || 'Dokument'}
                          </span>
                          <Download className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-text-muted text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleViewRequirement(req)}
                          className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                          title="Pregledaj"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditRequirement(req)}
                          className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                          title="Uredi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRequirement(req)}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Izbriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || filterStatus || filterArea || filterRisk || filterAlignment ? 'Ni rezultatov iskanja' : 'Ni zahtev ZVOP-2'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterStatus || filterArea || filterRisk || filterAlignment
                ? 'Poskusite z drugimi iskalnimi pogoji'
                : 'Začnite s sledenjem zahtevam ZVOP-2'
              }
            </p>
            {!searchTerm && !filterStatus && !filterArea && !filterRisk && !filterAlignment && (
              <button 
                onClick={handleAddNew}
                className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                Dodaj prvo zahtevo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Compliance Summary */}
      {filteredRequirements.length > 0 && (
        <div className="bg-bg-surface rounded-lg border border-border-subtle">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="text-lg font-semibold text-text-primary">Povzetek ZVOP-2 skladnosti</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Implementation Progress */}
              <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent-primary" />
                  Napredek implementacije
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Implementirano:</span>
                    <span className="text-green-500 font-medium">{stats.implemented}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-bg-surface rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.implemented / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">V teku:</span>
                    <span className="text-yellow-500 font-medium">{stats.inProgress}/{stats.total}</span>
                  </div>
                </div>
              </div>

              {/* GDPR Alignment */}
              <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-500" />
                  GDPR uskladitev
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Polno usklajeno:</span>
                    <span className="text-blue-500 font-medium">{stats.gdprFull}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-bg-surface rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.gdprFull / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {requirements.filter(r => r.riskLevel === 'critical').length > 0 && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Kritična tveganja
                </h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  {requirements
                    .filter(r => r.riskLevel === 'critical')
                    .slice(0, 3)
                    .map((req, index) => (
                      <div key={index}>
                        • {req.complianceArea} - {req.requirementCategory}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            {requirements.filter(r => r.deadline && isDueSoon(r.deadline)).length > 0 && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Bližnji roki
                </h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  {requirements
                    .filter(r => r.deadline && isDueSoon(r.deadline))
                    .slice(0, 3)
                    .map((req, index) => (
                      <div key={index}>
                        • {req.complianceArea} - Rok: {new Date(req.deadline!).toLocaleDateString('sl-SI')}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}