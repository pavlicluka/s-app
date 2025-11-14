import { AlertTriangle, Shield, RefreshCw, Calendar, MapPin, Globe } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable from './DataTable'
import Badge from './Badge'

interface MISPEvent {
  id: string
  uuid: string
  date: string
  info: string
  threat_level_id: string
  published: boolean
  timestamp: string
  attribute_count: string
  analysis: string
  orgc?: {
    name: string
    uuid: string
  }
  org?: {
    name: string
    uuid: string
  }
}

interface MISPPageProps {
  setCurrentPage?: (page: string) => void
}

export default function MISPPage({ setCurrentPage }: MISPPageProps) {
  const { t } = useTranslation()
  const [mispEvents, setMispEvents] = useState<MISPEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'

  // Fetch MISP feed data
  const fetchMISPData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    // Če smo v demo načinu, takoj pokažemo demo podatke
    if (isDemoMode) {
      setTimeout(() => {
        setMispEvents(getDemoMISPData())
        setLastUpdated(new Date())
        setError('Demo način: Prikazani so testni MISP podatki')
        setLoading(false)
      }, 1000) // Simuliramo nalaganje
      return
    }
    
    try {
      // Poskusimo dostopati do MISP feed-a preko Supabase Edge Function
      // Supabase URL je https://ckxlbiiirfdogobccmjs.supabase.co
      const supabaseUrl = 'https://ckxlbiiirfdogobccmjs.supabase.co'
      const functionUrl = `${supabaseUrl}/functions/v1/fetch-misp-feed`
      
      console.log('Fetching MISP data from:', functionUrl)
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (!response.ok) {
        console.error(`HTTP error: ${response.status} ${response.statusText}`)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Check if the result indicates we should use demo data
      if (result.demo || !result.success || !result.events) {
        console.warn('MISP feed returned demo flag or no data:', result)
        setMispEvents(getDemoMISPData())
        setLastUpdated(new Date())
        setError(result.error ? `Dostop do CERT.si ni na voljo: ${result.error}. Prikazani so demo podatki.` : 'Prikazani so demo podatki - dostop do CERT.si MISP feed-a trenutno ni na voljo')
        return
      }

      // Successfully fetched real data
      setMispEvents(result.events)
      setLastUpdated(new Date())
      setError(null)
      
    } catch (err: any) {
      console.error('Error fetching MISP data:', err)
      
      // On any error, fall back to demo data
      setMispEvents(getDemoMISPData())
      setLastUpdated(new Date())
      
      // Create user-friendly error message
      const errorMsg = err?.message || 'Neznana napaka pri pridobivanju podatkov'
      if (errorMsg.includes('abort') || errorMsg.includes('timeout')) {
        setError('Zahteva je potekla. Prikazani so demo podatki.')
      } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        setError('Mrežna napaka. Prikazani so demo podatki.')
      } else {
        setError(`Napaka pri pridobivanju podatkov: ${errorMsg}. Prikazani so demo podatki.`)
      }
    } finally {
      setLoading(false)
    }
  }, [isDemoMode])

  // Demo podatki za testiranje
  const getDemoMISPData = (): MISPEvent[] => [
    {
      id: '1',
      uuid: 'demo-uuid-1',
      date: new Date().toISOString().split('T')[0],
      info: 'Phishing kampanja ciljana na slovenske uporabnike',
      threat_level_id: '2',
      published: true,
      timestamp: Date.now().toString(),
      attribute_count: '15',
      analysis: '2',
      orgc: { name: 'SI-CERT', uuid: 'cert-si-uuid' }
    },
    {
      id: '2',
      uuid: 'demo-uuid-2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      info: 'Malware distribucija preko kompromitiranih spletnih strani',
      threat_level_id: '3',
      published: true,
      timestamp: (Date.now() - 86400000).toString(),
      attribute_count: '8',
      analysis: '1',
      orgc: { name: 'SI-CERT', uuid: 'cert-si-uuid' }
    },
    {
      id: '3',
      uuid: 'demo-uuid-3',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      info: 'Ransomware napad na slovensko infrastrukturo',
      threat_level_id: '1',
      published: true,
      timestamp: (Date.now() - 2 * 86400000).toString(),
      attribute_count: '22',
      analysis: '2',
      orgc: { name: 'SI-CERT', uuid: 'cert-si-uuid' }
    }
  ]

  useEffect(() => {
    fetchMISPData()
  }, [fetchMISPData])

  // Helper functions
  const getThreatLevelBadge = (level: string) => {
    switch (level) {
      case '1': return <Badge type="risk" value="high" />
      case '2': return <Badge type="risk" value="medium" />
      case '3': return <Badge type="risk" value="low" />
      case '4': return <Badge type="status" value="Nedefinirana" />
      default: return <Badge type="status" value="Neznana" />
    }
  }

  const getAnalysisStatus = (analysis: string) => {
    switch (analysis) {
      case '0': return 'Začetna'
      case '1': return 'V obdelavi'
      case '2': return 'Zaprt'
      default: return 'Neznana'
    }
  }

  const getAnalysisBadge = (analysis: string) => {
    switch (analysis) {
      case '0': return <Badge type="status" value="Odprt" />
      case '1': return <Badge type="status" value="V obdelavi" />
      case '2': return <Badge type="status" value="Zaprt" />
      default: return <Badge type="status" value="Neznana" />
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('sl-SI')
  }

  // Table columns for MISP events
  const columns = [
    {
      key: 'info',
      header: 'Opis dogodka',
      render: (item: MISPEvent) => (
        <div className="max-w-md">
          <div className="font-medium text-text-primary mb-1">{item.info}</div>
          <div className="text-body-sm text-text-secondary">
            ID: {item.id} | UUID: {item.uuid.substring(0, 8)}...
          </div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Datum',
      render: (item: MISPEvent) => (
        <div className="text-body-sm">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <span>{item.date}</span>
          </div>
          <div className="text-text-secondary">
            {formatDate(item.timestamp)}
          </div>
        </div>
      )
    },
    {
      key: 'threat_level',
      header: 'Stopnja grožnje',
      render: (item: MISPEvent) => getThreatLevelBadge(item.threat_level_id)
    },
    {
      key: 'analysis',
      header: 'Status analize',
      render: (item: MISPEvent) => getAnalysisBadge(item.analysis)
    },
    {
      key: 'attributes',
      header: 'Atributi',
      render: (item: MISPEvent) => (
        <div className="text-center">
          <span className="text-accent-primary font-medium">{item.attribute_count}</span>
        </div>
      )
    },
    {
      key: 'organization',
      header: 'Organizacija',
      render: (item: MISPEvent) => (
        <div className="text-body-sm">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-text-secondary" />
            <span>{item.orgc?.name || 'SI-CERT'}</span>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-bg-near-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">MISP - Kibernetske grožnje</h1>
              <p className="text-body text-text-secondary">
                Informacije o kibernetskih grožnjah iz SI-CERT MISP feed-a
              </p>
            </div>
          </div>

          {/* Stats and refresh */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-accent-primary" />
                <span className="text-body-sm font-medium text-text-secondary">Skupaj dogodkov</span>
              </div>
              <div className="text-h3 font-bold text-text-primary">{mispEvents.length}</div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-body-sm font-medium text-text-secondary">Visoke grožnje</span>
              </div>
              <div className="text-h3 font-bold text-text-primary">
                {mispEvents.filter(e => e.threat_level_id === '1').length}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-accent-primary" />
                <span className="text-body-sm font-medium text-text-secondary">Vir</span>
              </div>
              <div className="text-body font-medium text-text-primary">SI-CERT</div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-accent-primary" />
                <span className="text-body-sm font-medium text-text-secondary">Zadnja posodobitev</span>
              </div>
              <div className="text-body-sm text-text-primary">
                {lastUpdated ? lastUpdated.toLocaleString('sl-SI') : 'Ni podatka'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={fetchMISPData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Posodobi podatke
            </button>

            <a
              href="https://www.cert.si/navodila-za-misp-feed/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              Več o CERT.si MISP feed →
            </a>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-body text-yellow-200">{error}</span>
            </div>
          </div>
        )}

        {/* MISP Events Table */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-h3 font-semibold text-text-primary">Nedavni kibernetski incidenti</h2>
            <p className="text-body text-text-secondary mt-1">
              Pregled kibernetskih grožnji iz Slovenije in regije
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
              <p className="mt-4 text-text-secondary">Nalagam MISP podatke...</p>
            </div>
          ) : (
            <DataTable
              title="MISP Dogodki"
              data={mispEvents}
              columns={columns}
            />
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 p-6 bg-bg-surface border border-border-subtle rounded-lg">
          <h3 className="text-h4 font-semibold text-text-primary mb-3">O MISP podatkih</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-body text-text-secondary">
              MISP (Malware Information Sharing Platform) je odprta platforma za deljenje informacij o kibernetskih grožnjah.
              SI-CERT uporablja MISP za zbiranje in deljenje informacij o kibernetskih incidentih v Sloveniji.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}