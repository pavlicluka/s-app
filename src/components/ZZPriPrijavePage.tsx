import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Calendar,
  User,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Prijava {
  id: string
  stevilo_prijave: string
  datum_prijave: string
  kratek_opis: string
  podrocje: string
  narava_prijave: string
  anonimna: boolean
  status: string
  datum_potrditev: string
  datum_resitve: string
  odgovorna_oseba: string
  zaupnik_id: string
  zaupnik?: {
    ime: string
    priimek: string
  }
}

const statusConfig = {
  'prejeta': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Prejeta' },
  'v obravnavi': { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'V obravnavi' },
  'rešena': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Rešena' },
  'zavrnjena': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Zavrnjena' }
}

const podrocjeConfig = {
  'korupcija': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  'goljufija': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'prekoračitev pooblastil': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'diskriminacija': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'mobing': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  'drugo': { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
}

// Demo podatki za prikaz, ko je baza prazna
const demoPrijave: Prijava[] = [
  {
    id: 'demo-1',
    stevilo_prijave: 'ZZPRI-2025-001',
    datum_prijave: '2025-11-01T10:30:00Z',
    kratek_opis: 'Sum korupcije pri dodeljevanju javnih naročil - neupravičeno favorisiranje določenega ponudnika',
    podrocje: 'korupcija',
    narava_prijave: 'anomalija v postopku javnega naročanja',
    anonimna: false,
    status: 'v obravnavi',
    datum_potrditev: '2025-11-11T10:30:00Z',
    datum_resitve: '2025-11-12T10:30:00Z',
    odgovorna_oseba: 'Marko Novak',
    zaupnik_id: 'zaupnik-1',
    zaupnik: { ime: 'Ana', priimek: 'Kovač' }
  },
  {
    id: 'demo-2',
    stevilo_prijave: 'ZZPRI-2025-002',
    datum_prijave: '2025-11-05T14:15:00Z',
    kratek_opis: 'Sistemski mobing s strani neposredno nadrejenega - psihično nadlegovanje in izolacija',
    podrocje: 'mobing',
    narava_prijave: 'nesprejemljivo vedenje na delovnem mestu',
    anonimna: true,
    status: 'prejeta',
    datum_potrditev: '2025-11-11T14:15:00Z',
    datum_resitve: '2025-11-12T14:15:00Z',
    odgovorna_oseba: 'Tanja Horvat',
    zaupnik_id: 'zaupnik-2',
    zaupnik: { ime: 'Petra', priimek: 'Potočnik' }
  },
  {
    id: 'demo-3',
    stevilo_prijave: 'ZZPRI-2025-003',
    datum_prijave: '2025-11-06T09:45:00Z',
    kratek_opis: 'Prekoračitev pooblastil pri zaposlovanju - neupravičeno favorisiranje sorodnikov',
    podrocje: 'prekoračitev pooblastil',
    narava_prijave: 'nepravilnosti v človeških virih',
    anonimna: false,
    status: 'rešena',
    datum_potrditev: '2025-11-11T09:45:00Z',
    datum_resitve: '2025-11-12T09:45:00Z',
    odgovorna_oseba: 'Janez Krnc',
    zaupnik_id: 'zaupnik-1',
    zaupnik: { ime: 'Ana', priimek: 'Kovač' }
  },
  {
    id: 'demo-4',
    stevilo_prijave: 'ZZPRI-2025-004',
    datum_prijave: '2025-11-07T16:20:00Z',
    kratek_opis: 'Diskriminacija pri napredovanju - spolna diskriminacija in neenako obravnavanje',
    podrocje: 'diskriminacija',
    narava_prijave: 'kršitev načela enakosti',
    anonimna: true,
    status: 'v obravnavi',
    datum_potrditev: '2025-11-11T16:20:00Z',
    datum_resitve: '2025-11-12T16:20:00Z',
    odgovorna_oseba: 'Maja Kralj',
    zaupnik_id: 'zaupnik-3',
    zaupnik: { ime: 'Luka', priimek: 'Štrak' }
  },
  {
    id: 'demo-5',
    stevilo_prijave: 'ZZPRI-2025-005',
    datum_prijave: '2025-11-08T11:00:00Z',
    kratek_opis: 'Sum goljufije pri obračunu stroškov - neupravičeno zaračunavanje storitev',
    podrocje: 'goljufija',
    narava_prijave: 'finančne nepravilnosti',
    anonimna: false,
    status: 'zavrnjena',
    datum_potrditev: '2025-11-11T11:00:00Z',
    datum_resitve: '2025-11-12T11:00:00Z',
    odgovorna_oseba: 'Alenka Kranjc',
    zaupnik_id: 'zaupnik-2',
    zaupnik: { ime: 'Petra', priimek: 'Potočnik' }
  },
  {
    id: 'demo-6',
    stevilo_prijave: 'ZZPRI-2025-006',
    datum_prijave: '2025-11-09T13:30:00Z',
    kratek_opis: 'Odkrivanje zaupnih podatkov nepooblaščenim osebam - kršitev varnostnih ukrepov',
    podrocje: 'drugo',
    narava_prijave: 'kršitev varnostnih protokolov',
    anonimna: false,
    status: 'v obravnavi',
    datum_potrditev: '2025-11-11T13:30:00Z',
    datum_resitve: '2025-11-12T13:30:00Z',
    odgovorna_oseba: 'Peter Pavlin',
    zaupnik_id: 'zaupnik-1',
    zaupnik: { ime: 'Ana', priimek: 'Kovač' }
  }
]

export default function ZZPriPrijavePage() {
  const [prijave, setPrijave] = useState<Prijava[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [podrocjeFilter, setPodrocjeFilter] = useState('all')
  const [selectedPrijava, setSelectedPrijava] = useState<Prijava | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prijavaToDelete, setPrijavaToDelete] = useState<Prijava | null>(null)

  useEffect(() => {
    loadPrijave()
  }, [])

  const loadPrijave = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('zzzpri_prijave')
        .select(`
          *,
          zaupnik:zzzpri_zaupniki(ime, priimek)
        `)
        .order('datum_prijave', { ascending: false })

      if (error) throw error
      
      // Če je baza prazna, uporabi demo podatke
      if (!data || data.length === 0) {
        setPrijave(demoPrijave)
        setError(null)
      } else {
        setPrijave(data)
      }
    } catch (err) {
      console.error('Error loading prijave:', err)
      setError('Napaka pri nalaganju prijav - prikazujemo demo podatke')
      // V primeru napake pokaži demo podatke
      setPrijave(demoPrijave)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sl-SI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['prejeta']
  }

  const getPodrocjeColor = (podrocje: string) => {
    return podrocjeConfig[podrocje as keyof typeof podrocjeConfig] || podrocjeConfig['drugo']
  }

  const isDeadlineNear = (datum: string, days: number) => {
    const deadline = new Date(datum)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= days && diffDays >= 0
  }

  const isOverdue = (datum: string) => {
    const deadline = new Date(datum)
    const now = new Date()
    return deadline < now
  }

  const filteredPrijave = prijave.filter(prijava => {
    const matchesSearch = prijava.stevilo_prijave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prijava.kratek_opis.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || prijava.status === statusFilter
    const matchesPodrocje = podrocjeFilter === 'all' || prijava.podrocje === podrocjeFilter

    return matchesSearch && matchesStatus && matchesPodrocje
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Evidence prijav ZZPri
          </h1>
          <p className="text-body text-text-secondary">
            Pregled vseh prijav po Zakonu o zaščiti prijaviteljev
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Nova prijava
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Išči po številki ali opisu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
          >
            <option value="all">Vsi statusi</option>
            <option value="prejeta">Prejeta</option>
            <option value="v obravnavi">V obravnavi</option>
            <option value="rešena">Rešena</option>
            <option value="zavrnjena">Zavrnjena</option>
          </select>

          {/* Podrocje Filter */}
          <select
            value={podrocjeFilter}
            onChange={(e) => setPodrocjeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
          >
            <option value="all">Vsa področja</option>
            <option value="korupcija">Korupcija</option>
            <option value="goljufija">Goljufija</option>
            <option value="prekoračitev pooblastil">Prekoračitev pooblastil</option>
            <option value="diskriminacija">Diskriminacija</option>
            <option value="mobing">Mobing</option>
            <option value="drugo">Drugo</option>
          </select>

          {/* Export Button */}
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-surface-active transition-colors duration-200 text-text-secondary">
            <Download className="w-4 h-4" />
            Izvozi
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-body-sm text-text-secondary">
        Prikazano {filteredPrijave.length} od {prijave.length} prijav
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover border-b border-border-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Številka</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Datum</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Opis</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Področje</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Zaupnik</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Roki</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredPrijave.map((prijava) => {
                const statusData = getStatusColor(prijava.status)
                const podrocjeData = getPodrocjeColor(prijava.podrocje)
                const StatusIcon = statusData.icon

                return (
                  <tr key={prijava.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body-sm text-text-primary">{prijava.stevilo_prijave}</span>
                        {prijava.anonimna && (
                          <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-purple-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-text-tertiary" />
                        <span className="text-body-sm text-text-secondary">{formatDate(prijava.datum_prijave)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-sm text-text-primary line-clamp-2">{prijava.kratek_opis}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-body-xs font-medium ${podrocjeData.bg} ${podrocjeData.border} ${podrocjeData.color} border`}>
                        {prijava.podrocje}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusData.bg} ${statusData.border} border`}>
                        <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                        <span className={`text-body-sm font-medium ${statusData.color}`}>{statusData.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {prijava.zaupnik && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-text-tertiary" />
                          <span className="text-body-sm text-text-secondary">
                            {prijava.zaupnik.ime} {prijava.zaupnik.priimek}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {/* Confirmation deadline */}
                        {prijava.datum_potrditev && (
                          <div className={`text-body-xs ${isOverdue(prijava.datum_potrditev) ? 'text-red-400' : isDeadlineNear(prijava.datum_potrditev, 3) ? 'text-orange-400' : 'text-text-tertiary'}`}>
                            Potrditev: {formatDate(prijava.datum_potrditev)}
                          </div>
                        )}
                        {/* Resolution deadline */}
                        {prijava.datum_resitve && (
                          <div className={`text-body-xs ${isOverdue(prijava.datum_resitve) ? 'text-red-400' : isDeadlineNear(prijava.datum_resitve, 14) ? 'text-orange-400' : 'text-text-tertiary'}`}>
                            Rešitev: {formatDate(prijava.datum_resitve)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPrijava(prijava)
                            setShowModal(true)
                          }}
                          className="p-2 text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPrijava(prijava)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-text-tertiary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setPrijavaToDelete(prijava)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
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
      </div>

      {filteredPrijave.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-heading-md font-medium text-text-primary mb-2">Ni prijav</h3>
          <p className="text-body text-text-secondary mb-6">
            {searchTerm || statusFilter !== 'all' || podrocjeFilter !== 'all' 
              ? 'Ni prijav, ki bi ustrezale filtrom.'
              : 'Še ni bilo vnesenih prijav.'
            }
          </p>
        </div>
      )}

      {/* Modal for viewing details */}
      {showModal && selectedPrijava && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  Podrobnosti prijave
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Številka prijave</label>
                  <p className="text-body text-text-primary font-mono">{selectedPrijava.stevilo_prijave}</p>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Kratek opis</label>
                  <p className="text-body text-text-primary">{selectedPrijava.kratek_opis}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Področje</label>
                    <p className="text-body text-text-primary">{selectedPrijava.podrocje}</p>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Narava</label>
                    <p className="text-body text-text-primary">{selectedPrijava.narava_prijave}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Status</label>
                  <p className="text-body text-text-primary">{selectedPrijava.status}</p>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Anonimna prijava</label>
                  <p className="text-body text-text-primary">{selectedPrijava.anonimna ? 'Da' : 'Ne'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding new prijava */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  Nova prijava
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Kratek opis *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    placeholder="Vnesite kratek opis prijave"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Področje *</label>
                    <select className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary">
                      <option value="">Izberite področje</option>
                      <option value="korupcija">Korupcija</option>
                      <option value="goljufija">Goljufija</option>
                      <option value="prekoračitev pooblastil">Prekoračitev pooblastil</option>
                      <option value="diskriminacija">Diskriminacija</option>
                      <option value="mobing">Mobing</option>
                      <option value="drugo">Drugo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Status</label>
                    <select className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary">
                      <option value="prejeta">Prejeta</option>
                      <option value="v obravnavi">V obravnavi</option>
                      <option value="rešena">Rešena</option>
                      <option value="zavrnjena">Zavrnjena</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Narava prijave</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    placeholder="Podrobnejši opis narave prijave"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-accent-primary bg-bg-surface border-border-subtle rounded focus:ring-accent-primary/50"
                  />
                  <label className="text-body-sm text-text-secondary">Anonimna prijava</label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum potrditve</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum rešitve</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Odgovorna oseba</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    placeholder="Ime in priimek odgovorne osebe"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border-subtle">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Prekliči
                </button>
                <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                  Shrani
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing prijava */}
      {showEditModal && selectedPrijava && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  Uredi prijavo
                </h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Številka prijave</label>
                  <input
                    type="text"
                    value={selectedPrijava.stevilo_prijave}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Kratek opis *</label>
                  <input
                    type="text"
                    defaultValue={selectedPrijava.kratek_opis}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Področje *</label>
                    <select defaultValue={selectedPrijava.podrocje} className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary">
                      <option value="korupcija">Korupcija</option>
                      <option value="goljufija">Goljufija</option>
                      <option value="prekoračitev pooblastil">Prekoračitev pooblastil</option>
                      <option value="diskriminacija">Diskriminacija</option>
                      <option value="mobing">Mobing</option>
                      <option value="drugo">Drugo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Status</label>
                    <select defaultValue={selectedPrijava.status} className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary">
                      <option value="prejeta">Prejeta</option>
                      <option value="v obravnavi">V obravnavi</option>
                      <option value="rešena">Rešena</option>
                      <option value="zavrnjena">Zavrnjena</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Narava prijave</label>
                  <textarea
                    rows={3}
                    defaultValue={selectedPrijava.narava_prijave}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum potrditve</label>
                    <input
                      type="date"
                      defaultValue={selectedPrijava.datum_potrditev ? selectedPrijava.datum_potrditev.split('T')[0] : ''}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum rešitve</label>
                    <input
                      type="date"
                      defaultValue={selectedPrijava.datum_resitve ? selectedPrijava.datum_resitve.split('T')[0] : ''}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Odgovorna oseba</label>
                  <input
                    type="text"
                    defaultValue={selectedPrijava.odgovorna_oseba}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border-subtle">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Prekliči
                </button>
                <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                  Shrani spremembe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for deleting prijava */}
      {showDeleteModal && prijavaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-heading-lg font-semibold text-text-primary">
                  Izbriši prijavo
                </h2>
              </div>
              
              <p className="text-body text-text-secondary mb-6">
                Ali ste prepričani, da želite izbrisati prijavo <strong>{prijavaToDelete.stevilo_prijave}</strong>? 
                Ta dejanja ni mogoče razveljaviti.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setPrijavaToDelete(null)
                  }}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Prekliči
                </button>
                <button 
                  onClick={async () => {
                    if (!prijavaToDelete?.id) return
                    
                    try {
                      const { error } = await supabase
                        .from('zvop2_prijave')
                        .delete()
                        .eq('id', prijavaToDelete.id)
                      
                      if (error) throw error
                      
                      toast.success('Prijava je bila uspešno izbrisana')
                      setShowDeleteModal(false)
                      setPrijavaToDelete(null)
                      // Ponovno naloži podatke
                      loadPrijave()
                    } catch (error: any) {
                      console.error('Error deleting prijava:', error)
                      toast.error(error.message || 'Napaka pri brisanju prijave')
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500/90 transition-colors duration-200"
                >
                  Izbriši
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}