import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Monitor, 
  Shield, 
  AlertTriangle, 
  Search, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useEmsisoftAPI, useEmsisoftDemo } from '../hooks/useEmsisoftAPI'
import type { EmsisoftWorkstation, EmsisoftEvent, EmsisoftScanTask } from '../hooks/useEmsisoftAPI'



export default function SOCPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'workstations' | 'events' | 'scans'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Check if we're in demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'
  
  // Use real API or demo data based on mode - MUST be called unconditionally
  const realApi = useEmsisoftAPI()
  const demoApi = useEmsisoftDemo()
  const api = isDemoMode ? demoApi : realApi
  
  // State for data
  const [workstations, setWorkstations] = useState<EmsisoftWorkstation[]>([])
  const [events, setEvents] = useState<EmsisoftEvent[]>([])
  const [scanTasks, setScanTasks] = useState<EmsisoftScanTask[]>([])
  const [workspaceId] = useState('VIRTUAL IT d.o.o') // Emsisoft workspace ID

  // Load data
  const loadData = useCallback(async () => {
    if (api.isLoading) return
    
    try {
      const [workstationsData, eventsData] = await Promise.all([
        api.fetchWorkstations(workspaceId),
        api.fetchEvents(workspaceId, 50)
      ])
      
      setWorkstations(workstationsData)
      setEvents(eventsData)
      
      // Load existing scan tasks (simulate with local storage or API)
      const savedScans = localStorage.getItem('emsisoft-scan-tasks')
      if (savedScans) {
        setScanTasks(JSON.parse(savedScans))
      }
    } catch (error) {
      console.error('Error loading SOC data:', error)
    }
  }, [api, workspaceId])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Add new scan task and save to localStorage
  const addScanTask = useCallback((task: EmsisoftScanTask) => {
    setScanTasks(prev => {
      const newTasks = [task, ...prev]
      localStorage.setItem('emsisoft-scan-tasks', JSON.stringify(newTasks))
      return newTasks
    })
  }, [])

  // Update scan task
  const updateScanTask = useCallback((taskId: string, updates: Partial<EmsisoftScanTask>) => {
    setScanTasks(prev => {
      const newTasks = prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
      localStorage.setItem('emsisoft-scan-tasks', JSON.stringify(newTasks))
      return newTasks
    })
  }, [])

  // Start scan with API integration
  const startScan = useCallback(async (workstationId: string, scanType: 'full' | 'quick' | 'custom') => {
    try {
      const scanTask = await api.startScan(workstationId, scanType)
      if (scanTask) {
        addScanTask(scanTask)
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
      // For demo mode or if API fails, create local task
      if (isDemoMode) {
        const newTask: EmsisoftScanTask = {
          id: Date.now().toString(),
          workstationId,
          workstationName: workstations.find(w => w.id === workstationId)?.name || 'Unknown',
          type: scanType,
          status: 'running',
          startedAt: new Date().toISOString(),
          threatsFound: 0,
          filesScanned: 0
        }
        addScanTask(newTask)
      }
    }
  }, [api, addScanTask, workstations, isDemoMode])

  // Refresh data
  const handleRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  // Utility functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'maintenance': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />
      case 'offline': return <XCircle className="w-4 h-4" />
      case 'maintenance': return <Clock className="w-4 h-4" />
      default: return <XCircle className="w-4 h-4" />
    }
  }, [])

  const getThreatLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }, [])

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }, [])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Pravkar'
    if (diffInMinutes < 60) return `pred ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `pred ${Math.floor(diffInMinutes / 60)} ur`
    return `pred ${Math.floor(diffInMinutes / 1440)} dnevi`
  }

  // Izračun statistik za overview
  const stats = {
    totalWorkstations: workstations.length,
    onlineWorkstations: workstations.filter(w => w.status === 'online').length,
    offlineWorkstations: workstations.filter(w => w.status === 'offline').length,
    totalThreats: events.filter(e => e.type === 'threat' && e.status === 'pending').length,
    activeScans: scanTasks.filter(s => s.status === 'running').length,
    criticalWorkstations: workstations.filter(w => w.threatLevel === 'critical').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">SOC (Security Operations Center)</h1>
              <p className="text-text-secondary">Nadzorovanje in upravljanje varnosti delovnih postaj</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={api.isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg hover:bg-bg-surface-hover transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${api.isLoading ? 'animate-spin' : ''}`} />
              <span className="text-body-sm">Osveži</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Monitor className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-text-secondary text-body-sm">Vse postaje</p>
                <p className="text-text-primary text-xl font-semibold">{stats.totalWorkstations}</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-body-sm">Online</p>
                <p className="text-text-primary text-xl font-semibold">{stats.onlineWorkstations}</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-text-secondary text-body-sm">Offline</p>
                <p className="text-text-primary text-xl font-semibold">{stats.offlineWorkstations}</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-text-secondary text-body-sm">Grožnje</p>
                <p className="text-text-primary text-xl font-semibold">{stats.totalThreats}</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-text-secondary text-body-sm">Aktivna skeniranja</p>
                <p className="text-text-primary text-xl font-semibold">{stats.activeScans}</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-text-secondary text-body-sm">Kritične</p>
                <p className="text-text-primary text-xl font-semibold">{stats.criticalWorkstations}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        <div className="flex space-x-1 p-1">
          {[
            { id: 'overview', label: 'Pregled', icon: Activity },
            { id: 'workstations', label: 'Delovne postaje', icon: Monitor },
            { id: 'events', label: 'Dogodki', icon: AlertTriangle },
            { id: 'scans', label: 'Skeniranja', icon: Search }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-body-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical threats overview */}
          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Aktivne grožnje</h2>
            <div className="space-y-3">
              {events.filter(e => e.type === 'threat' && e.status === 'pending').map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-bg-near-black rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}></div>
                    <div>
                      <p className="text-text-primary font-medium">{event.title}</p>
                      <p className="text-text-secondary text-body-sm">{event.workstationName} - {event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-text-tertiary text-body-sm">{formatTimeAgo(event.timestamp)}</span>
                    <button className="px-3 py-1 bg-red-500 text-white text-body-sm rounded hover:bg-red-600 transition-colors">
                      Obravnavaj
                    </button>
                  </div>
                </div>
              ))}
              {events.filter(e => e.type === 'threat' && e.status === 'pending').length === 0 && (
                <p className="text-text-tertiary text-center py-8">Ni aktivnih groženj</p>
              )}
            </div>
          </div>

          {/* Active scans */}
          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Aktivna skeniranja</h2>
            <div className="space-y-3">
              {scanTasks.filter(s => s.status === 'running').map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 bg-bg-near-black rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                    <div>
                      <p className="text-text-primary font-medium">
                        {scan.type === 'full' ? 'Polno' : scan.type === 'quick' ? 'Hitro' : 'Po meri'} skeniranje
                      </p>
                      <p className="text-text-secondary text-body-sm">{scan.workstationName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary text-body-sm">
                      {scan.filesScanned.toLocaleString()} datotek
                    </p>
                    <p className="text-text-tertiary text-body-sm">
                      {scan.threatsFound} groženj
                    </p>
                  </div>
                </div>
              ))}
              {scanTasks.filter(s => s.status === 'running').length === 0 && (
                <p className="text-text-tertiary text-center py-8">Ni aktivnih skeniranj</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workstations' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Išči delovne postaje..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Workstations list */}
          <div className="bg-bg-surface rounded-lg border border-border-subtle">
            <div className="p-4 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Delovne postaje</h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {workstations
                .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.ipAddress.includes(searchTerm))
                .map((workstation) => (
                <div key={workstation.id} className="p-4 hover:bg-bg-surface-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(workstation.status)}
                        <Monitor className="w-5 h-5 text-text-tertiary" />
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{workstation.name}</p>
                        <p className="text-text-secondary text-body-sm">
                          {workstation.ipAddress} • {workstation.os} • {workstation.location}
                        </p>
                        <p className="text-text-tertiary text-body-sm">
                          Zadnji ogled: {formatTimeAgo(workstation.lastSeen)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-body-sm font-medium ${getThreatLevelColor(workstation.threatLevel)}`}>
                          {workstation.threatLevel === 'low' ? 'Nizko' : 
                           workstation.threatLevel === 'medium' ? 'Srednje' : 
                           workstation.threatLevel === 'high' ? 'Visoko' : 'Kritično'}
                        </p>
                        <p className="text-text-tertiary text-body-sm">
                          Agent: {workstation.agentVersion}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startScan(workstation.id, 'quick')}
                          className="px-3 py-1 bg-accent-primary text-white text-body-sm rounded hover:bg-accent-primary/80 transition-colors"
                        >
                          Hitro skeniranje
                        </button>
                        <button
                          onClick={() => startScan(workstation.id, 'full')}
                          className="px-3 py-1 bg-bg-near-black border border-border-subtle text-text-primary text-body-sm rounded hover:bg-bg-surface-hover transition-colors"
                        >
                          Polno skeniranje
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-bg-surface rounded-lg border border-border-subtle">
            <div className="p-4 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Varnostni dogodki</h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-bg-surface-hover transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(event.severity)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-text-primary font-medium">{event.title}</p>
                        <span className="text-text-tertiary text-body-sm">{formatTimeAgo(event.timestamp)}</span>
                      </div>
                      <p className="text-text-secondary text-body-sm mt-1">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-text-tertiary text-body-sm">{event.workstationName}</p>
                        <span className={`
                          px-2 py-1 text-body-xs rounded-full
                          ${event.status === 'pending' ? 'bg-red-500/20 text-red-400' :
                            event.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'}
                        `}>
                          {event.status === 'pending' ? 'V čakanju' :
                           event.status === 'investigating' ? 'V preiskavi' :
                           event.status === 'resolved' ? 'Rešeno' : 'Lažno opozorilo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scans' && (
        <div className="space-y-4">
          <div className="bg-bg-surface rounded-lg border border-border-subtle">
            <div className="p-4 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary">Zgodovina skeniranj</h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {scanTasks.map((scan) => (
                <div key={scan.id} className="p-4 hover:bg-bg-surface-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {scan.status === 'running' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                      ) : scan.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : scan.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                      <div>
                        <p className="text-text-primary font-medium">
                          {scan.type === 'full' ? 'Polno' : scan.type === 'quick' ? 'Hitro' : 'Po meri'} skeniranje
                        </p>
                        <p className="text-text-secondary text-body-sm">{scan.workstationName}</p>
                        <p className="text-text-tertiary text-body-sm">
                          Začeto: {formatTimeAgo(scan.startedAt)}
                          {scan.completedAt && ` • Končano: ${formatTimeAgo(scan.completedAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary text-body-sm">
                        {scan.filesScanned.toLocaleString()} datotek
                      </p>
                      <p className={`text-body-sm ${scan.threatsFound > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {scan.threatsFound} groženj
                      </p>
                      <span className={`
                        px-2 py-1 text-body-xs rounded-full
                        ${scan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          scan.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                          scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'}
                      `}>
                        {scan.status === 'pending' ? 'V čakanju' :
                         scan.status === 'running' ? 'V teku' :
                         scan.status === 'completed' ? 'Končano' : 'Neuspešno'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {api.error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Napaka pri povezavi z Emsisoft API</p>
            <p className="text-red-300 text-body-sm">{api.error}</p>
            <button
              onClick={api.clearError}
              className="mt-2 text-red-400 hover:text-red-300 text-body-sm underline"
            >
              Zapri
            </button>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-blue-400 font-medium">Demo način</p>
              <p className="text-blue-300 text-body-sm">
                Prikazani so demo podatki. Za pravo funkcionalnost potrebujete veljaven Emsisoft API ključ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}