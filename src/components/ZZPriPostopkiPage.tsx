import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  FileCheck
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import ZZPriPostopkiAddModal from './modals/ZZPriPostopkiAddModal'

interface ZZPriPostopek {
  id: string
  postopek_id: string
  naziv_postopka: string
  tip_postopka: string
  faza_postopka: string
  opis_postopka?: string
  datum_vlozitve?: string
  datum_potrditve?: string
  rok_obravnave?: string
  datum_zakljucka?: string
  prijava_id?: string
  zaupnik_id?: string
  pobudnik?: string
  prijavitelj?: string
  prijavitelj_anonimen: boolean
  kontaktni_podatki?: string
  podrocje_krsitve?: string
  podroben_opis?: string
  zbrana_dokazila?: string
  pricanja?: string
  ugotovitve?: string
  priporoceni_ukrepi?: string
  sprejeti_ukrepi?: string
  odgovorna_oseba?: string
  sodelujoce_osebe?: string
  status: string
  prioriteta?: string
  zaupnost: string
  priloge?: string
  opombe?: string
  created_at: string
  updated_at: string
}

const demoPostopki: ZZPriPostopek[] = [
  {
    id: 'demo-1',
    postopek_id: 'POST-2025-001',
    naziv_postopka: 'Postopek obravnave prijave korupcije pri javnem naročanju',
    tip_postopka: 'Notranja obravnava',
    faza_postopka: 'Predhodno preverjanje',
    opis_postopka: 'Obravnava prijave suma korupcije pri dodeljevanju javnih naročil',
    datum_vlozitve: '2025-11-01T10:00:00Z',
    datum_potrditve: '2025-11-02T14:00:00Z',
    rok_obravnave: '2025-12-01T23:59:59Z',
    prijava_id: 'ZP-2025-001',
    zaupnik_id: 'zaupnik-1',
    pobudnik: 'Anonimni prijavitelj',
    prijavitelj: '',
    prijavitelj_anonimen: true,
    podrocje_krsitve: 'korupcija',
    podroben_opis: 'Prijavitelj navaja sum korupcije pri dodeljevanju javnega naročila za IT storitve',
    odgovorna_oseba: 'Marko Novak',
    status: 'v obravnavi',
    prioriteta: 'visoka',
    zaupnost: 'strogo zaupno',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-05T15:30:00Z'
  },
  {
    id: 'demo-2',
    postopek_id: 'POST-2025-002',
    naziv_postopka: 'Postopek obravnave prijave mobinga na delovnem mestu',
    tip_postopka: 'Notranja obravnava',
    faza_postopka: 'Zbiranje dokazov',
    opis_postopka: 'Sistemski mobing s strani neposredno nadrejenega',
    datum_vlozitve: '2025-11-05T09:00:00Z',
    datum_potrditve: '2025-11-06T10:00:00Z',
    rok_obravnave: '2025-12-05T23:59:59Z',
    prijava_id: 'ZP-2025-002',
    zaupnik_id: 'zaupnik-2',
    pobudnik: 'Anonimni prijavitelj',
    prijavitelj: '',
    prijavitelj_anonimen: true,
    podrocje_krsitve: 'mobing',
    podroben_opis: 'Psihično nadlegovanje, izolacija in ponižujoče obravnavanje s strani vodstva',
    zbrana_dokazila: 'E-poštna korespondenedca, pričevanja sodelavcev',
    odgovorna_oseba: 'Tanja Horvat',
    status: 'v obravnavi',
    prioriteta: 'visoka',
    zaupnost: 'zaupno',
    created_at: '2025-11-05T09:00:00Z',
    updated_at: '2025-11-08T16:45:00Z'
  },
  {
    id: 'demo-3',
    postopek_id: 'POST-2025-003',
    naziv_postopka: 'Postopek obravnave prekoračitve pooblastil pri zaposlovanju',
    tip_postopka: 'Notranja obravnava',
    faza_postopka: 'Zaključena preiskava',
    opis_postopka: 'Neupravičeno favorisiranje sorodnikov pri zaposlovanju',
    datum_vlozitve: '2025-10-15T11:00:00Z',
    datum_potrditve: '2025-10-16T12:00:00Z',
    rok_obravnave: '2025-11-15T23:59:59Z',
    datum_zakljucka: '2025-11-10T17:00:00Z',
    prijava_id: 'ZP-2025-003',
    zaupnik_id: 'zaupnik-1',
    pobudnik: 'Janez Kranjc',
    prijavitelj: 'Janez Kranjc',
    prijavitelj_anonimen: false,
    kontaktni_podatki: 'janez.kranjc@example.com, +386 40 123 456',
    podrocje_krsitve: 'prekoračitev pooblastil',
    podroben_opis: 'Ugotovljeno je bilo, da je vodja oddelka zaposloval družinske člane brez javnega razpisa',
    zbrana_dokazila: 'Kadrovska dokumentacija, email komunikacija, intervjuji',
    ugotovitve: 'Ugotovljena je bila kršitev pravilnika o zaposlovanju in postopkih zaposlovanja',
    priporoceni_ukrepi: 'Disciplinski ukrep za odgovornega vodjo, revizija vseh nedavnih zaposlitev',
    sprejeti_ukrepi: 'Začet disciplinski postopek, uvedena dodatna kontrola pri zaposlovanju',
    odgovorna_oseba: 'Marija Golob',
    status: 'zaključen',
    prioriteta: 'srednja',
    zaupnost: 'zaupno',
    created_at: '2025-10-15T11:00:00Z',
    updated_at: '2025-11-10T17:00:00Z'
  }
]

const statusConfig = {
  'v pripravi': { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'V pripravi' },
  'v obravnavi': { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'V obravnavi' },
  'zaključen': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Zaključen' },
  'ustavljen': { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Ustavljen' }
}

const prioritetaConfig = {
  'nizka': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'srednja': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'visoka': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'kritična': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
}

export default function ZZPriPostopkiPage() {
  const { t } = useTranslation()
  const [postopki, setPostopki] = useState<ZZPriPostopek[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('vse')
  const [filterPriorita, setFilterPrioritet] = useState<string>('vse')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPostopek, setSelectedPostopek] = useState<ZZPriPostopek | null>(null)

  useEffect(() => {
    loadPostopki()
  }, [])

  const loadPostopki = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('zzzpri_postopki')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // If database is empty, use demo data
      if (!data || data.length === 0) {
        setPostopki(demoPostopki)
      } else {
        setPostopki(data)
      }
    } catch (err) {
      console.error('Error loading postopki:', err)
      // On error, use demo data
      setPostopki(demoPostopki)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('sl-SI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['v pripravi']
  }

  const getPrioritetaColor = (prioriteta?: string) => {
    if (!prioriteta) return prioritetaConfig['nizka']
    return prioritetaConfig[prioriteta as keyof typeof prioritetaConfig] || prioritetaConfig['nizka']
  }

  // Filter postopki
  const filteredPostopki = postopki.filter(postopek => {
    const matchesSearch = 
      postopek.postopek_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postopek.naziv_postopka.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postopek.odgovorna_oseba?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'vse' || postopek.status === filterStatus
    const matchesPrioritet = filterPriorita === 'vse' || postopek.prioriteta === filterPriorita

    return matchesSearch && matchesStatus && matchesPrioritet
  })

  // Calculate statistics
  const stats = {
    total: postopki.length,
    vObravnavi: postopki.filter(p => p.status === 'v obravnavi').length,
    zakljuceni: postopki.filter(p => p.status === 'zaključen').length,
    kratekRok: postopki.filter(p => {
      const days = getDaysUntilDeadline(p.rok_obravnave)
      return days !== null && days >= 0 && days <= 7
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Postopki po ZZPri
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje in sledenje postopkom obravnave prijav po Zakonu o zaščiti prijaviteljev
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          Nov postopek
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Skupaj postopkov</p>
              <p className="text-heading-lg font-semibold text-text-primary">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">V obravnavi</p>
              <p className="text-heading-lg font-semibold text-text-primary">{stats.vObravnavi}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Zaključeni</p>
              <p className="text-heading-lg font-semibold text-text-primary">{stats.zakljuceni}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Kratki roki</p>
              <p className="text-heading-lg font-semibold text-red-400">{stats.kratekRok}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Išči po ID, nazivu, odgovorni osebi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="vse">Vsi statusi</option>
              <option value="v pripravi">V pripravi</option>
              <option value="v obravnavi">V obravnavi</option>
              <option value="zaključen">Zaključen</option>
              <option value="ustavljen">Ustavljen</option>
            </select>
          </div>

          <div>
            <select
              value={filterPriorita}
              onChange={(e) => setFilterPrioritet(e.target.value)}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="vse">Vse prioritete</option>
              <option value="nizka">Nizka</option>
              <option value="srednja">Srednja</option>
              <option value="visoka">Visoka</option>
              <option value="kritična">Kritična</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
            <span className="ml-3 text-body text-text-secondary">Nalaganje...</span>
          </div>
        ) : filteredPostopki.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileCheck className="w-16 h-16 text-text-tertiary mb-4" />
            <h3 className="text-heading-md font-medium text-text-primary mb-2">
              Ni postopkov
            </h3>
            <p className="text-body text-text-secondary mb-6">
              {searchTerm || filterStatus !== 'vse' || filterPriorita !== 'vse' 
                ? 'Ni postopkov, ki bi ustrezali izbranim filtrom' 
                : 'Dodajte prvi postopek obravnave prijave'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-near-black border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">ID postopka</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Naziv postopka</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Tip</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Faza</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Prioriteta</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Rok obravnave</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-secondary">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredPostopki.map((postopek) => {
                  const statusData = getStatusColor(postopek.status)
                  const prioritetaData = getPrioritetaColor(postopek.prioriteta)
                  const StatusIcon = statusData.icon
                  const daysUntilDeadline = getDaysUntilDeadline(postopek.rok_obravnave)
                  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 7

                  return (
                    <tr key={postopek.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className="font-mono text-body-sm text-text-primary">{postopek.postopek_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-body-sm text-text-primary line-clamp-2 max-w-md">{postopek.naziv_postopka}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-body-sm text-text-secondary">{postopek.tip_postopka}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-body-sm text-text-secondary">{postopek.faza_postopka}</span>
                      </td>
                      <td className="px-4 py-3">
                        {postopek.prioriteta && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-body-xs font-medium ${prioritetaData.bg} ${prioritetaData.border} ${prioritetaData.color} border capitalize`}>
                            {postopek.prioriteta}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-body-sm text-text-primary">{formatDate(postopek.rok_obravnave)}</div>
                          {isUrgent && daysUntilDeadline !== null && (
                            <div className="text-body-xs text-red-400 font-medium">
                              {daysUntilDeadline === 0 ? 'Danes!' : daysUntilDeadline === 1 ? 'Jutri' : `Še ${daysUntilDeadline} dni`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusData.bg} ${statusData.border} border`}>
                          <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                          <span className={`text-body-sm font-medium ${statusData.color}`}>{statusData.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedPostopek(postopek)}
                            className="p-2 text-text-secondary hover:text-accent-primary hover:bg-bg-surface-hover rounded-lg transition-colors duration-200"
                            title="Podrobnosti"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-text-secondary hover:text-accent-primary hover:bg-bg-surface-hover rounded-lg transition-colors duration-200"
                            title="Uredi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                            title="Izbriši"
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
        )}
      </div>

      {/* Add Modal */}
      <ZZPriPostopkiAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadPostopki}
      />

      {/* Detail Modal */}
      {selectedPostopek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-surface rounded-lg border border-border-subtle max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-bg-surface border-b border-border-subtle p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-heading-lg font-semibold text-text-primary">Podrobnosti postopka</h2>
                  <p className="text-body-sm text-text-secondary mt-1">{selectedPostopek.postopek_id}</p>
                </div>
                <button
                  onClick={() => setSelectedPostopek(null)}
                  className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors duration-200"
                >
                  <span className="text-2xl text-text-secondary">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Naziv postopka</p>
                  <p className="text-body text-text-primary font-medium">{selectedPostopek.naziv_postopka}</p>
                </div>
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Tip postopka</p>
                  <p className="text-body text-text-primary">{selectedPostopek.tip_postopka}</p>
                </div>
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Faza postopka</p>
                  <p className="text-body text-text-primary">{selectedPostopek.faza_postopka}</p>
                </div>
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getStatusColor(selectedPostopek.status).bg} ${getStatusColor(selectedPostopek.status).border} border`}>
                    <span className={`text-body-sm font-medium ${getStatusColor(selectedPostopek.status).color}`}>
                      {getStatusColor(selectedPostopek.status).label}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPostopek.opis_postopka && (
                <div>
                  <p className="text-body-sm text-text-tertiary mb-2">Opis postopka</p>
                  <p className="text-body text-text-primary">{selectedPostopek.opis_postopka}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Datum vložitve</p>
                  <p className="text-body text-text-primary">{formatDate(selectedPostopek.datum_vlozitve)}</p>
                </div>
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Datum potrditve</p>
                  <p className="text-body text-text-primary">{formatDate(selectedPostopek.datum_potrditve)}</p>
                </div>
                <div>
                  <p className="text-body-sm text-text-tertiary mb-1">Rok obravnave</p>
                  <p className="text-body text-text-primary">{formatDate(selectedPostopek.rok_obravnave)}</p>
                </div>
                {selectedPostopek.datum_zakljucka && (
                  <div>
                    <p className="text-body-sm text-text-tertiary mb-1">Datum zaključka</p>
                    <p className="text-body text-text-primary">{formatDate(selectedPostopek.datum_zakljucka)}</p>
                  </div>
                )}
              </div>

              {selectedPostopek.podroben_opis && (
                <div>
                  <p className="text-body-sm text-text-tertiary mb-2">Podroben opis</p>
                  <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.podroben_opis}</p>
                </div>
              )}

              {(selectedPostopek.zbrana_dokazila || selectedPostopek.ugotovitve) && (
                <div className="space-y-4">
                  {selectedPostopek.zbrana_dokazila && (
                    <div>
                      <p className="text-body-sm text-text-tertiary mb-2">Zbrana dokazila</p>
                      <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.zbrana_dokazila}</p>
                    </div>
                  )}
                  {selectedPostopek.ugotovitve && (
                    <div>
                      <p className="text-body-sm text-text-tertiary mb-2">Ugotovitve</p>
                      <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.ugotovitve}</p>
                    </div>
                  )}
                </div>
              )}

              {(selectedPostopek.priporoceni_ukrepi || selectedPostopek.sprejeti_ukrepi) && (
                <div className="space-y-4">
                  {selectedPostopek.priporoceni_ukrepi && (
                    <div>
                      <p className="text-body-sm text-text-tertiary mb-2">Priporočeni ukrepi</p>
                      <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.priporoceni_ukrepi}</p>
                    </div>
                  )}
                  {selectedPostopek.sprejeti_ukrepi && (
                    <div>
                      <p className="text-body-sm text-text-tertiary mb-2">Sprejeti ukrepi</p>
                      <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.sprejeti_ukrepi}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {selectedPostopek.odgovorna_oseba && (
                  <div>
                    <p className="text-body-sm text-text-tertiary mb-1">Odgovorna oseba</p>
                    <p className="text-body text-text-primary">{selectedPostopek.odgovorna_oseba}</p>
                  </div>
                )}
                {selectedPostopek.prioriteta && (
                  <div>
                    <p className="text-body-sm text-text-tertiary mb-1">Prioriteta</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-body-sm font-medium ${getPrioritetaColor(selectedPostopek.prioriteta).bg} ${getPrioritetaColor(selectedPostopek.prioriteta).border} ${getPrioritetaColor(selectedPostopek.prioriteta).color} border capitalize`}>
                      {selectedPostopek.prioriteta}
                    </span>
                  </div>
                )}
              </div>

              {selectedPostopek.opombe && (
                <div>
                  <p className="text-body-sm text-text-tertiary mb-2">Opombe</p>
                  <p className="text-body text-text-primary whitespace-pre-wrap">{selectedPostopek.opombe}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-bg-surface border-t border-border-subtle p-6">
              <button
                onClick={() => setSelectedPostopek(null)}
                className="w-full px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors duration-200"
              >
                Zapri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
