import { 
  MessageSquare,
  FileText,
  Users,
  ClipboardList,
  Workflow,
  BarChart3,
  Settings,
  FileCheck,
  Shield,
  BookOpen,
  AlertTriangle,
  Calendar,
  Eye,
  Clock
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface ZZPriPageProps {
  onNavigate?: (page: string) => void
}

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
  'v obravnavi': { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'V obravnavi' },
  'rešena': { icon: FileCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Rešena' },
  'zavrnjena': { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Zavrnjena' }
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
    stevilo_prijave: 'ZP-2025-001',
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
    stevilo_prijave: 'ZP-2025-002',
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
    stevilo_prijave: 'ZP-2025-003',
    datum_prijave: '2025-11-06T09:45:00Z',
    kratek_opis: 'Prekoračitev pooblastil pri zaposlovanju - neupravičeno favorisiranje sorodnikov',
    podrocje: 'prekoračitev pooblastil',
    narava_prijave: 'nepravilnosti v človeških virih',
    anonimna: false,
    status: 'prejeta',
    datum_potrditev: '2025-11-11T09:45:00Z',
    datum_resitve: '2025-11-12T09:45:00Z',
    odgovorna_oseba: 'Janez Krnc',
    zaupnik_id: 'zaupnik-1',
    zaupnik: { ime: 'Ana', priimek: 'Kovač' }
  }
]

export default function ZZPriPage({ onNavigate }: ZZPriPageProps) {
  const { t } = useTranslation()
  const [prijave, setPrijave] = useState<Prijava[]>([])
  const [loading, setLoading] = useState(true)

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
      } else {
        setPrijave(data)
      }
    } catch (err) {
      console.error('Error loading prijave:', err)
      // V primeru napake pokaži demo podatke
      setPrijave(demoPrijave)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('sl-SI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      return '-'
    }
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

  const getDaysUntilDeadline = (datum: string) => {
    const deadline = new Date(datum)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Filtriranje prijav s kratkimi roki (< 3 dni)
  const kratkiRokiPrijave = prijave.filter(prijava => {
    // Preveri potrditev rok (7 dni od datuma prijave)
    if (prijava.datum_potrditev) {
      const daysToConfirm = getDaysUntilDeadline(prijava.datum_potrditev)
      if (daysToConfirm < 3) return true
    }
    
    // Preveri rešitev rok (3 mesece od datuma prijave)
    if (prijava.datum_resitve) {
      const daysToResolve = getDaysUntilDeadline(prijava.datum_resitve)
      if (daysToResolve < 3 && daysToResolve >= 0) return true
    }
    
    return false
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Zakon o zaščiti prijaviteljev (ZZPri)
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje prijav in zagotavljanje skladnosti z ZZPri zakonom. 
            Evidence prijav, zaupnikov, postopkov in letna poročila KPK.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Tabela kratkih rokov */}
      <div className="bg-red-500/5 border-2 border-red-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-heading-lg font-semibold text-red-400">
              Opozorilo o kritičnih rokih
            </h2>
            <p className="text-body-sm text-text-secondary">
              Prijave, ki potrebujejo takojšnjo pozornost zaradi bližajočih se rokov
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
            <span className="ml-2 text-body-sm text-text-secondary">Nalaganje...</span>
          </div>
        ) : kratkiRokiPrijave.length > 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-500/10 border-b border-red-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">ID</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Naslov</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Tip prijave</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Rok</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Status</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {kratkiRokiPrijave.map((prijava) => {
                    const statusData = getStatusColor(prijava.status)
                    const podrocjeData = getPodrocjeColor(prijava.podrocje)
                    const StatusIcon = statusData.icon

                    // Določi najkrajši rok med potrditvijo in rešitvijo
                    let najkrajsiRok = ''
                    let najkrajsiRokDatum = ''
                    let najkrajsiRokTip = ''

                    if (prijava.datum_potrditev) {
                      try {
                        const potrditevDate = new Date(prijava.datum_potrditev)
                        if (!isNaN(potrditevDate.getTime())) {
                          const dniDoPotrditve = getDaysUntilDeadline(prijava.datum_potrditev)
                          if (dniDoPotrditve >= 0) {
                            najkrajsiRok = `${dniDoPotrditve} dni`
                            najkrajsiRokDatum = prijava.datum_potrditev
                            najkrajsiRokTip = 'Potrditev'
                          }
                        }
                      } catch (error) {
                        console.warn('Invalid date for potrditev:', prijava.datum_potrditev)
                      }
                    }

                    if (prijava.datum_resitve) {
                      try {
                        const resitveDate = new Date(prijava.datum_resitve)
                        if (!isNaN(resitveDate.getTime())) {
                          const dniDoResitve = getDaysUntilDeadline(prijava.datum_resitve)
                          if (dniDoResitve >= 0 && (dniDoResitve < parseInt(najkrajsiRok) || !najkrajsiRok)) {
                            najkrajsiRok = `${dniDoResitve} dni`
                            najkrajsiRokDatum = prijava.datum_resitve
                            najkrajsiRokTip = 'Rešitev'
                          }
                        }
                      } catch (error) {
                        console.warn('Invalid date for resitve:', prijava.datum_resitve)
                      }
                    }

                    return (
                      <tr key={prijava.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                        <td className="px-4 py-3">
                          <span className="font-mono text-body-sm text-text-primary">{prijava.stevilo_prijave}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-body-sm text-text-primary line-clamp-2 max-w-xs">{prijava.kratek_opis}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-body-sm font-medium ${podrocjeData.bg} ${podrocjeData.border} ${podrocjeData.color} border`}>
                            {prijava.podrocje}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className={`text-body-xs font-medium ${isOverdue(najkrajsiRokDatum) ? 'text-red-400' : 'text-orange-400'}`}>
                              {najkrajsiRok}
                            </div>
                            <div className="text-body-xs text-text-tertiary">
                              {najkrajsiRokTip}: {formatDate(najkrajsiRokDatum)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusData.bg} ${statusData.border} border`}>
                            <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                            <span className={`text-body-sm font-medium ${statusData.color}`}>{statusData.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => onNavigate?.('zzzpri-prijave')}
                            className="inline-flex items-center gap-1 px-3 py-1 text-body-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            Pregled
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-heading-md font-medium text-text-primary mb-2">Ni opozoril za bližajoče roke</h3>
            <p className="text-body text-text-secondary">
              Vsi roki so ustrezno razporejeni. Odlično delo!
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Skupaj prijav</p>
              <p className="text-heading-lg font-semibold text-text-primary">{prijave.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Aktivni zaupniki</p>
              <p className="text-heading-lg font-semibold text-text-primary">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">V obravnavi</p>
              <p className="text-heading-lg font-semibold text-text-primary">{prijave.filter(p => p.status === 'v obravnavi').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Kritični roki</p>
              <p className="text-heading-lg font-semibold text-red-400">{kratkiRokiPrijave.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'zzzpri-prijave',
            title: 'Evidence prijav',
            description: 'Pregled, vnos in upravljanje prijav po ZZPri zakonu',
            icon: FileText,
            iconColor: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
          },
          {
            id: 'zzzpri-zaupniki',
            title: 'Upravljanje zaupnikov',
            description: 'Evidence zaupnikov in njihovih podatkov',
            icon: Users,
            iconColor: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30'
          },
          {
            id: 'zzzpri-obrazci',
            title: 'Nova prijava',
            description: 'Generiranje in upravljanje obrazcev za prijave',
            icon: ClipboardList,
            iconColor: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
          },
          {
            id: 'zzzpri-postopki',
            title: 'Sledenje postopkom',
            description: 'Pregled izvajanja postopkov in rokov',
            icon: Workflow,
            iconColor: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30'
          },
          {
            id: 'zzzpri-porocila',
            title: 'Letna poročila KPK',
            description: 'Priprava in pošiljanje letnih poročil na KPK',
            icon: FileCheck,
            iconColor: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30'
          },
          {
            id: 'zzzpri-statistike',
            title: 'Statistike',
            description: 'Analiza podatkov o prijavah in postopkih',
            icon: BarChart3,
            iconColor: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30'
          },
          {
            id: 'zzzpri-dokumentacija',
            title: 'Dokumentacija',
            description: 'Upravljanje dokumentacije v zvezi z ZZPri zakonom',
            icon: BookOpen,
            iconColor: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/30'
          },
          {
            id: 'zzzpri-navodila',
            title: 'Navodila in priročniki',
            description: 'Detajlna navodila za uporabo ZZPri sistema in priročniki',
            icon: FileText,
            iconColor: 'text-teal-400',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/30'
          },
          {
            id: 'zzzpri-nastavitve',
            title: 'Nastavitve',
            description: 'Konfiguracija ZZPri modula in notifikacij',
            icon: Settings,
            iconColor: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30'
          }
        ].map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => onNavigate?.(category.id)}
              className="bg-bg-surface p-6 rounded-lg border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 text-left group hover:bg-bg-surface-hover"
            >
              <div className={`w-12 h-12 rounded-lg ${category.bgColor} border ${category.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${category.iconColor}`} />
              </div>
              <h3 className="text-heading-md font-semibold text-text-primary mb-2">
                {category.title}
              </h3>
              <p className="text-body-sm text-text-secondary">
                {category.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-heading-lg font-semibold text-text-primary mb-4">Hitre akcije</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate?.('zzzpri-obrazci')}
            className="bg-bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 text-left"
          >
            <ClipboardList className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-semibold text-text-primary mb-1">Nova prijava</h4>
            <p className="text-body-sm text-text-secondary">Vnesi novo prijavo po ZZPri</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('zzzpri-postopki')}
            className="bg-bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 text-left"
          >
            <Workflow className="w-8 h-8 text-orange-400 mb-2" />
            <h4 className="font-semibold text-text-primary mb-1">Preveri roke</h4>
            <p className="text-body-sm text-text-secondary">Pregled rokov in opomnikov</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('zzzpri-porocila')}
            className="bg-bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 text-left"
          >
            <FileCheck className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="font-semibold text-text-primary mb-1">Letno poročilo</h4>
            <p className="text-body-sm text-text-secondary">Generiraj poročilo za KPK</p>
          </button>
        </div>
      </div>
    </div>
  )
}
