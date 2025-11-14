// Opozorila Page Component
import { AlertCircle, AlertTriangle, FileText, Eye, Shield, Clock, Trash2, Key, Copy, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Incident } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Badge from './Badge'
import IncidentDetailModal from './modals/IncidentDetailModal'
import { useActiveAlerts } from '../hooks/useActiveAlerts'

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

interface GDPRZahtevek {
  id: string
  request_id: string
  subject_name: string
  subject_email: string
  request_date: string
  request_type: string
  status: string
  response_deadline: string
  legal_basis_description: string
  data_categories: string[]
  data_description: string
}

interface LicenseRecord {
  id: string
  license_key: string
  software_name: string
  license_type: 'perpetual' | 'subscription' | 'trial'
  seats: number
  seats_used: number
  assigned_to?: string
  purchase_date?: string
  expiry_date?: string
  renewal_cost?: number
  status: 'active' | 'expired' | 'suspended'
  notes?: string
  created_at: string
  updated_at: string
  organization_id: string
}

interface AlertsPageProps {
  onNavigate?: (page: string) => void
}

// Demo podatki za GDPR zahtevke
const demoGdprZahtevki: GDPRZahtevek[] = [
  {
    id: 'gdpr-1',
    request_id: 'ZVOP-2025-001',
    subject_name: 'Ana Novak',
    subject_email: 'ana.novak@email.com',
    request_date: '2025-10-15T08:30:00Z',
    request_type: 'pravica do pozabe',
    status: 'processing',
    response_deadline: '2025-11-08T23:59:59Z',
    legal_basis_description: 'Zahteva za izbris osebnih podatkov zaradi preklica soglasja',
    data_categories: ['Kontaktni podatki', 'Demografski podatki'],
    data_description: 'Ime, priimek, elektronski naslov, telefonska številka'
  },
  {
    id: 'gdpr-2',
    request_id: 'ZVOP-2025-002',
    subject_name: 'Marko Kovač',
    subject_email: 'marko.kovac@podjetje.si',
    request_date: '2025-10-20T14:15:00Z',
    request_type: 'dostop do podatkov',
    status: 'received',
    response_deadline: '2025-11-09T23:59:59Z',
    legal_basis_description: 'Zahteva za dostop do osebnih podatkov po 15. členu GDPR',
    data_categories: ['Kadrovski podatki', 'Plačilni podatki'],
    data_description: 'Mesečne plače, boniteti, davčne informacije'
  },
  {
    id: 'gdpr-3',
    request_id: 'ZVOP-2025-003',
    subject_name: 'Petra Horvat',
    subject_email: 'petra.horvat@gmail.com',
    request_date: '2025-10-25T10:45:00Z',
    request_type: 'pravica do pozabe',
    status: 'additional_info_required',
    response_deadline: '2025-11-07T23:59:59Z',
    legal_basis_description: 'Izbris podatkov po zaključku sodelovanja',
    data_categories: ['Kontaktni podatki', 'Naslovni podatki'],
    data_description: 'Naslov stalnega bivališča, kontaktni podatki'
  }
]

// Demo podatki za prijave
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
    datum_potrditev: '2025-11-10T10:30:00Z',
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
    datum_resitve: '2025-11-13T14:15:00Z',
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
    datum_resitve: '2025-11-15T09:45:00Z',
    odgovorna_oseba: 'Janez Kranjc',
    zaupnik_id: 'zaupnik-3',
    zaupnik: { ime: 'Luka', priimek: 'Bergant' }
  }
]

export default function AlertsPage({ onNavigate }: AlertsPageProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [prijave, setPrijave] = useState<Prijava[]>([])
  const [gdprZahtevki, setGdprZahtevki] = useState<GDPRZahtevek[]>([])
  const [licenses, setLicenses] = useState<LicenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Modal states
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadIncidents()
      loadPrijave()
      loadGdprZahtevki()
      loadLicenses()

      // Setup real-time subscription for incidents
      const incidentsChannel = supabase
        .channel('incidents-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'incidents' }, 
          () => {
            loadIncidents()
          }
        )
        .subscribe()

      // Setup real-time subscription for prijave
      const prijaveChannel = supabase
        .channel('prijave-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'prijave' }, 
          () => {
            loadPrijave()
          }
        )
        .subscribe()

      const gdprChannel = supabase
        .channel('gdpr-zahtevki-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'gdpr_right_forgotten' }, 
          () => {
            loadGdprZahtevki()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(incidentsChannel)
        supabase.removeChannel(prijaveChannel)
        supabase.removeChannel(gdprChannel)
      }
    }
  }, [userProfile])

  async function loadIncidents() {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      setIncidents(data || [])
    } catch (error) {
      console.error('Error loading incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPrijave() {
    if (!userProfile?.organization_id) {
      // Če ni organization_id, uporabi demo podatke
      setPrijave(demoPrijave)
      return
    }

    try {
      const { data, error } = await supabase
        .from('prijave')
        .select(`
          *,
          zaupnik:zaupniki(ime, priimek)
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        // V primeru napake pokaži demo podatke
        setPrijave(demoPrijave)
      } else if (!data || data.length === 0) {
        // Če ni podatkov v bazi, uporabi demo podatke
        setPrijave(demoPrijave)
      } else {
        setPrijave(data)
      }
    } catch (error) {
      console.error('Error loading prijave:', error)
      // V primeru napake pokaži demo podatke
      setPrijave(demoPrijave)
    }
  }

  async function loadLicenses() {
    if (!userProfile?.organization_id) {
      setLicenses([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('inventory_licenses')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('expiry_date', { ascending: true })
      
      if (error) {
        console.error('Supabase error:', error)
        setLicenses([])
      } else {
        console.log('Loaded licenses:', data)
        setLicenses(data || [])
      }
    } catch (error) {
      console.error('Error loading licenses:', error)
      setLicenses([])
    }
  }

  const maskLicenseKey = (key: string) => {
    if (!key) return '-'
    if (key.length <= 4) return key
    return `${'*'.repeat(key.length - 4)}${key.slice(-4)}`
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const getLicenseTypeBadge = (licenseType: string) => {
    const badges: Record<string, string> = {
      'perpetual': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'subscription': 'bg-green-500/20 text-green-400 border-green-500/30',
      'trial': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return badges[licenseType] || badges['subscription']
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    return expiry < now
  }

  // Filtriranje licenc z bližajočim potekom (< 30 dni)
  const blizajociPotičekLicenc = licenses.filter(license => {
    return isExpiringSoon(license.expiry_date) && license.status === 'active'
  })

  // Filtriranje poteklih licenc
  const potekleLicence = licenses.filter(license => {
    return isExpired(license.expiry_date) && license.status === 'active'
  })

  // Filtriranje licenc z visoko uporabo sedežev (> 90%)
  const polneLicence = licenses.filter(license => {
    if (!license.seats || license.seats === 0) return false
    const usagePercent = (license.seats_used / license.seats) * 100
    return usagePercent >= 90 && license.status === 'active'
  })

  async function loadGdprZahtevki() {
    if (!userProfile?.organization_id) {
      // Če ni organization_id, uporabi demo podatke
      setGdprZahtevki(demoGdprZahtevki)
      return
    }

    try {
      const { data, error } = await supabase
        .from('gdpr_right_forgotten')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('request_date', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        // V primeru napake pokaži demo podatke
        setGdprZahtevki(demoGdprZahtevki)
      } else if (!data || data.length === 0) {
        // Če ni podatkov v bazi, uporabi demo podatke
        setGdprZahtevki(demoGdprZahtevki)
      } else {
        setGdprZahtevki(data)
      }
    } catch (error) {
      console.error('Error loading GDPR zahtevki:', error)
      // V primeru napake pokaži demo podatke
      setGdprZahtevki(demoGdprZahtevki)
    }
  }

  // Funkcija za preverjanje, koliko dni je minilo od zaznave incidenta
  const getDaysSinceDetection = (detectedAt: string) => {
    const detected = new Date(detectedAt)
    const now = new Date()
    const diffTime = now.getTime() - detected.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Funkcija za preverjanje, koliko dni je do roka
  const getDaysUntilDeadline = (datum: string) => {
    const deadline = new Date(datum)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Filtriranje incidentov starejših od 1 dneva (razen rešenih)
  const stariIncidenti = incidents.filter(incident => {
    const dniOdZaznave = getDaysSinceDetection(incident.detected_at)
    // Izključi incidente s statusom 'resolved'
    return dniOdZaznave > 1 && incident.status !== 'resolved'
  })

  // Filtriranje prijav s kratkimi roki (< 3 dni) (razen rešenih)
  const kratkiRokiPrijave = prijave.filter(prijava => {
    // Izključi prijave s statusom 'rešena'
    if (prijava.status === 'rešena') return false
    
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

  // Filtriranje GDPR zahtevkov s poteklimi roki (razen izvršenih)
  const potekliGdprZahtevki = gdprZahtevki.filter(zahtevek => {
    // Izključi zahtevke s statusom 'executed' (Izvršeno)
    if (zahtevek.status === 'executed') return false
    
    // Preveri, ali je rok potekel
    if (zahtevek.response_deadline) {
      const daysToDeadline = getDaysUntilDeadline(zahtevek.response_deadline)
      if (daysToDeadline < 0) return true // Potekel rok
    }
    
    return false
  })

  // Status konfiguracija za prijave
  const getStatusColor = (status: string) => {
    const statusData = {
      'prejeta': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Prejeta' },
      'v obravnavi': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'V obravnavi' },
      'rešena': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Rešena' },
      'zavrnjena': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Zavrnjena' }
    }
    return statusData[status as keyof typeof statusData] || statusData['prejeta']
  }

  // Handler functions for View actions
  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident)
    setShowIncidentModal(true)
    console.log('Opening incident modal for:', incident)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!userProfile?.organization_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-3">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {t('common.organizationRequired')}
          </h3>
          <p className="text-gray-400">
            {t('common.organizationRequiredDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Opozorila
          </h1>
          <p className="text-body text-text-secondary">
            Pregled vseh opozoril in kritičnih situacij, ki zahtevajo takojšnjo pozornost
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Skupaj opozoril</div>
          <div className="text-display-lg font-bold text-text-primary">{stariIncidenti.length + kratkiRokiPrijave.length + potekliGdprZahtevki.length + blizajociPotičekLicenc.length + potekleLicence.length + polneLicence.length}</div>
        </div>
        <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
          <div className="text-caption text-red-400 mb-2">NIS 2 in ZInfV-1</div>
          <div className="text-display-lg font-bold text-red-400">{stariIncidenti.length}</div>
        </div>
        <div className="bg-orange-500/10 p-6 rounded-lg border border-orange-500/30">
          <div className="text-caption text-orange-400 mb-2">ZZPri</div>
          <div className="text-display-lg font-bold text-orange-400">{kratkiRokiPrijave.length}</div>
        </div>
        <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/30">
          <div className="text-caption text-purple-400 mb-2">GDPR in ZVOP-2</div>
          <div className="text-display-lg font-bold text-purple-400">{potekliGdprZahtevki.length}</div>
        </div>
        <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/30">
          <div className="text-caption text-purple-400 mb-2">Potek licenc</div>
          <div className="text-display-lg font-bold text-purple-400">{blizajociPotičekLicenc.length + potekleLicence.length}</div>
        </div>
      </div>

      {/* Opozorilo za stare incidente */}
      {stariIncidenti.length > 0 && (
        <div className="bg-red-500/5 border-2 border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-heading-lg font-semibold text-red-400">
                Opozorila za poročanje po NIS 2 in ZInfV-1
              </h2>
              <p className="text-body-sm text-text-secondary">
                Incidenti, ki so bili zaznani pred več kot 1 dnem in zahtevajo takojšnjo pozornost
              </p>
            </div>
          </div>

          {/* Naslov področja */}
          <div className="mb-3">
            <h3 className="text-body-lg font-semibold text-text-primary">NIS 2 in ZInfV-1</h3>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-500/10 border-b border-red-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">ID incidenta</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Tip incidenta</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Datum zaznave</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Dni od zaznave</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Status</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {stariIncidenti.map((incident) => {
                    const dniOdZaznave = getDaysSinceDetection(incident.detected_at)
                    return (
                      <tr key={incident.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                        <td className="px-4 py-3">
                          <span className="font-mono text-body-sm text-text-primary">{incident.incident_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-primary">{incident.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-primary">
                            {new Date(incident.detected_at).toLocaleDateString('sl-SI')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm font-medium text-red-400">
                            {dniOdZaznave} dni
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge type="status" value={incident.status} />
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleViewIncident(incident)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-body-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
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
        </div>
      )}

      {/* Opozorilo za potekle GDPR zahtevke */}
      {potekliGdprZahtevki.length > 0 && (
        <div className="bg-red-500/5 border-2 border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-heading-lg font-semibold text-red-400">
                Opozorila o preteku zahtevkov za izbris
              </h2>
              <p className="text-body-sm text-text-secondary">
                Zahtevki, kjer je potekel rok odgovora in zahtevajo takojšnjo pozornost
              </p>
            </div>
          </div>

          {/* Naslov področja */}
          <div className="mb-3">
            <h3 className="text-body-lg font-semibold text-text-primary">GDPR in ZVOP-2</h3>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-500/10 border-b border-red-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">ID zahtevka</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Ime</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Email</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Tip</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Rok</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Status</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-red-400">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {potekliGdprZahtevki.map((zahtevek) => {
                    const dniZamude = Math.abs(getDaysUntilDeadline(zahtevek.response_deadline))
                    const statusData = {
                      'received': { color: 'text-blue-400', label: 'Prejeto' },
                      'processing': { color: 'text-orange-400', label: 'V obdelavi' },
                      'executed': { color: 'text-green-400', label: 'Izvršeno' },
                      'rejected': { color: 'text-red-400', label: 'Zavrnjeno' },
                      'additional_info_required': { color: 'text-purple-400', label: 'Dodatne info' }
                    }
                    const data = statusData[zahtevek.status as keyof typeof statusData] || statusData['received']
                    
                    return (
                      <tr key={zahtevek.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                        <td className="px-4 py-3">
                          <span className="font-mono text-body-sm text-text-primary">{zahtevek.request_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-primary">{zahtevek.subject_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-secondary">{zahtevek.subject_email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-primary capitalize">{zahtevek.request_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-red-400">
                              {dniZamude} dni zamude
                            </span>
                            <span className="text-body-xs text-text-secondary">
                              Rok: {new Date(zahtevek.response_deadline).toLocaleDateString('sl-SI')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${data.color}`} />
                            <span className="text-body-sm text-text-primary">{data.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-body-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
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
        </div>
      )}

      {/* Če ni starih incidentov */}
      {stariIncidenti.length === 0 && (
        <div className="bg-green-500/5 border-2 border-green-500/30 rounded-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-heading-md font-medium text-text-primary mb-2">Ni opozoril</h3>
          <p className="text-body text-text-secondary">
            Vsi incidenti so ustrezno obravnavani. Odlično delo!
          </p>
        </div>
      )}

      {/* Opozorilo za kratke roke ZZPri */}
      {kratkiRokiPrijave.length > 0 && (
        <div className="bg-red-500/5 border-2 border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-heading-lg font-semibold text-red-400">
                Opozorila o kritičnih rokih za ZZPri
              </h2>
              <p className="text-body-sm text-text-secondary">
                Prijave, ki potrebujejo takojšnjo pozornost zaradi bližajočih se rokov
              </p>
            </div>
          </div>

          {/* Naslov področja */}
          <div className="mb-3">
            <h3 className="text-body-lg font-semibold text-text-primary">ZZPri</h3>
          </div>

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
                    const StatusIcon = AlertTriangle

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
                          <span className="text-body-sm text-text-primary capitalize">{prijava.podrocje}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-red-400">
                              {najkrajsiRok}
                            </span>
                            <span className="text-body-xs text-text-secondary">
                              {najkrajsiRokTip}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusData.color}`} />
                            <span className="text-body-sm text-text-primary">{statusData.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-body-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
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
        </div>
      )}

      {/* Tabela licenc - prikaže se vedno, če so licencča v bazi */}
      {licenses.length > 0 && (
        <div className="bg-red-500/5 border-2 border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Key className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-heading-lg font-semibold text-text-primary">
                Veljavnost programske opreme in licenc
              </h2>
              <p className="text-body-sm text-text-secondary">
                Pregled vseh licenc in programske opreme v organizaciji
              </p>
            </div>
          </div>

          {/* Naslov področja */}
          <div className="mb-3">
            <h3 className="text-body-lg font-semibold text-text-primary">Veljavnost programske opreme in licenc</h3>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface-hover border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Licenčni ključ</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Program</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Tip</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Uporaba sedežev</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Dodeljeno</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Poteče</th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold text-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {licenses.map((license) => {
                    const usagePercent = license.seats ? Math.round((license.seats_used / license.seats) * 100) : 0
                    const daysToExpiry = license.expiry_date ? Math.floor((new Date(license.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
                    const isExpiring = isExpiringSoon(license.expiry_date)
                    const expired = isExpired(license.expiry_date)
                    const overUsed = usagePercent >= 90
                    
                    return (
                      <tr key={license.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-body-sm text-text-primary font-mono">{maskLicenseKey(license.license_key)}</span>
                            <button
                              onClick={() => copyToClipboard(license.license_key, license.id)}
                              className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                              title="Kopiraj celoten ključ"
                            >
                              {copiedKey === license.id ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-primary font-medium">{license.software_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getLicenseTypeBadge(license.license_type)}`}>
                            {license.license_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-body-sm ${overUsed ? 'text-red-400' : 'text-text-secondary'}`}>
                              {license.seats_used || 0}/{license.seats || 0}
                            </span>
                            {license.seats && (
                              <span className={`text-caption font-medium ${overUsed ? 'text-red-400' : 'text-blue-400'}`}>
                                ({usagePercent}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-body-sm text-text-secondary">{license.assigned_to || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-body-sm ${isExpiring ? 'text-yellow-400' : expired ? 'text-red-400' : 'text-text-primary'}`}>
                            {license.expiry_date ? new Date(license.expiry_date).toLocaleDateString('sl-SI') : '-'}
                            {isExpiring && license.expiry_date && ` (${daysToExpiry} dni)`}
                            {expired && license.expiry_date && ` (potekla)`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-body-sm ${getStatusColor(license.status).color}`}>
                            {getStatusColor(license.status).label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      <IncidentDetailModal
        isOpen={showIncidentModal}
        onClose={() => {
          setShowIncidentModal(false)
          setSelectedIncident(null)
        }}
        incident={selectedIncident}
      />
    </div>
  )
}
