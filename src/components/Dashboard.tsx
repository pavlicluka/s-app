import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Incident, CyberIncidentReport, Device, SupportRequest, RiskData } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import RiskChart from './RiskChart'
import DataTable from './DataTable'
import Badge from './Badge'
import IncidentDetailModal from './modals/IncidentDetailModal'
import ReportDetailModal from './modals/ReportDetailModal'
import DeviceDetailModal from './modals/DeviceDetailModal'
import SupportDetailModal from './modals/SupportDetailModal'
import { useActiveAlerts } from '../hooks/useActiveAlerts'
import { AlertTriangle, Shield } from 'lucide-react'

interface DashboardProps {
  setCurrentPage: (page: string) => void
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [cyberReports, setCyberReports] = useState<CyberIncidentReport[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [supportRequests, setSupportRequests] = useState<any[]>([])
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Aktivna opozorila hook - automatically handles real-time updates
  const {
    hasActiveAlerts,
    noAlertsMessage,
    activeAlertsMessage,
    totalActiveAlerts,
    loading: alertsLoading,
    refreshData
  } = useActiveAlerts()

  // Setup periodic refresh of alerts (every 30 seconds as backup to real-time)
  useEffect(() => {
    const alertsRefreshInterval = setInterval(() => {
      if (refreshData) {
        refreshData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(alertsRefreshInterval)
  }, [refreshData])

  // Demo podatki za support zahtevke (zadnji 3 zapisi)
  const demoSupportRecords = [
    {
      id: 1,
      ticket_id: 'ZD-2024-001',
      requester_name: 'Marija Kovač',
      subject: 'Težava z dostopom do sistema',
      priority: 'high',
      status: 'in_progress',
      created_date: '2024-11-08T10:30:00Z'
    },
    {
      id: 2,
      ticket_id: 'ZD-2024-002',
      requester_name: 'Peter Horvat',
      subject: 'Pozabljeno geslo',
      priority: 'medium',
      status: 'resolved',
      created_date: '2024-11-07T14:15:00Z'
    },
    {
      id: 3,
      ticket_id: 'ZD-2024-003',
      requester_name: 'Tomaž Bergant',
      subject: 'Varnostni incident - sum vdora',
      priority: 'urgent',
      status: 'open',
      created_date: '2024-11-06T09:20:00Z'
    },
    {
      id: 4,
      ticket_id: 'ZD-2024-004',
      requester_name: 'Maja Virtič',
      subject: 'Zahteva za usposabljanje',
      priority: 'low',
      status: 'waiting_for_customer',
      created_date: '2024-11-05T16:45:00Z'
    },
    {
      id: 5,
      ticket_id: 'ZD-2024-005',
      requester_name: 'Robert Kosec',
      subject: 'Težava s tiskalnikom',
      priority: 'medium',
      status: 'closed',
      created_date: '2024-11-04T11:30:00Z'
    }
  ]

  // Modal states
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<CyberIncidentReport | null>(null)
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [selectedSupport, setSelectedSupport] = useState<any | null>(null)

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
      loadData()
    } else {
      setLoading(false)
    }
  }, [userProfile])

  async function loadData() {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load all data in parallel
      const [
        { data: incidentsData },
        { data: reportsData },
        { data: devicesData },
        { data: supportData },
        { data: riskDataData }
      ] = await Promise.all([
        supabase.from('incidents').select('*').eq('organization_id', userProfile.organization_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('cyber_incident_reports').select('*').eq('organization_id', userProfile.organization_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('devices').select('*').eq('risk_level', 'High').eq('organization_id', userProfile.organization_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('support_ticket_management').select('*').order('created_date', { ascending: false }).limit(3),
        supabase.from('risk_data').select('*').eq('organization_id', userProfile.organization_id)
      ])

      setIncidents(incidentsData || [])
      setCyberReports(reportsData || [])
      setDevices(devicesData || [])
      // Sort demo records by date and take last 3
      const finalSupportData = supportData && supportData.length > 0 
        ? supportData 
        : [...demoSupportRecords]
          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
          .slice(0, 3)
      
      setSupportRequests(finalSupportData)
      setRiskData(riskDataData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handler functions for View actions
  const handleViewIncident = (incident: Incident) => {
    console.log('Dashboard: handleViewIncident called with incident:', incident)
    setSelectedIncident(incident)
    setShowIncidentModal(true)
    console.log('Dashboard: Incident modal should now be open')
  }

  const handleViewReport = (report: CyberIncidentReport) => {
    console.log('Dashboard: handleViewReport called with report:', report)
    setSelectedReport(report)
    setShowReportModal(true)
    console.log('Dashboard: Report modal should now be open')
  }

  const handleViewDevice = (device: Device) => {
    console.log('Dashboard: handleViewDevice called with device:', device)
    setSelectedDevice(device)
    setShowDeviceModal(true)
    console.log('Dashboard: Device modal should now be open')
  }

  // Adapter function to convert support_ticket_management data to SupportRequest format
  const adaptSupportData = (data: any): SupportRequest => {
    return {
      id: data.id,
      ticket_id: data.ticket_id,
      user_id: null, // Not available in support_ticket_management
      full_name: data.requester_name || 'Neznano',
      subject: data.subject,
      priority: data.priority === 'low' ? 'Nizka' : 
                data.priority === 'medium' ? 'Normalna' : 
                data.priority === 'high' ? 'Visoka' : 'Normalna',
      status: data.status === 'open' ? 'Odprt' : 
              data.status === 'in_progress' ? 'V obdelavi' : 
              data.status === 'resolved' ? 'Zaprt' : 'Odprt',
      created_at: data.created_date,
      updated_at: data.resolved_date || data.created_date
    }
  }

  const handleViewSupport = (support: any) => {
    console.log('Dashboard: handleViewSupport called with support:', support)
    const adaptedSupport = adaptSupportData(support)
    setSelectedSupport(adaptedSupport)
    setShowSupportModal(true)
    console.log('Dashboard: Support modal should now be open')
  }

  // Handler functions for View All actions
  const handleViewAllIncidents = () => {
    console.log('Dashboard: handleViewAllIncidents called - navigating to nis2 page')
    setCurrentPage('nis2')
  }

  const handleViewAllReports = () => {
    console.log('Dashboard: handleViewAllReports called - navigating to nis2 page')
    setCurrentPage('nis2')
  }

  const handleViewAllDevices = () => {
    console.log('Dashboard: handleViewAllDevices called - navigating to workspaces page')
    setCurrentPage('workspaces')
  }

  const handleViewAllSupport = () => {
    console.log('Dashboard: handleViewAllSupport called - navigating to support-tickets page')
    setCurrentPage('support-tickets')
  }

  // Prepare chart data
  const inventoryRiskData = {
    labels: [t('common.highRiskDevices'), t('common.mediumRiskDevices'), t('common.lowRiskDevices')],
    values: riskData
      .filter(d => d.category === 'inventory')
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 }
        return order[a.risk_level] - order[b.risk_level]
      })
      .map(d => d.count),
    colors: ['#ef4444', '#f59e0b', '#22c55e']
  }

  const suppliersRiskData = {
    labels: [t('common.highRiskSuppliers'), t('common.mediumRiskSuppliers'), t('common.lowRiskSuppliers')],
    values: riskData
      .filter(d => d.category === 'suppliers')
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 }
        return order[a.risk_level] - order[b.risk_level]
      })
      .map(d => d.count),
    colors: ['#ef4444', '#f59e0b', '#22c55e']
  }

  const potentialsRiskData = {
    labels: [t('common.highRisk'), t('common.mediumRisk'), t('common.lowRisk')],
    values: riskData
      .filter(d => d.category === 'potentials')
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 }
        return order[a.risk_level] - order[b.risk_level]
      })
      .map(d => d.count),
    colors: ['#ef4444', '#f59e0b', '#22c55e']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'
  
  if (!userProfile?.organization_id && !isDemoMode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-lg border border-border-subtle">
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          {t('dashboard.welcomeTitle')}
        </h1>
        <p className="text-body-lg text-text-secondary">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Aktivna opozorila - notifikacija */}
      {!alertsLoading && (
        <div className={`p-4 rounded-lg border-2 ${
          hasActiveAlerts 
            ? 'bg-red-500/5 border-red-500/30' 
            : 'bg-green-500/5 border-green-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              hasActiveAlerts 
                ? 'bg-red-500/20 border border-red-500/40' 
                : 'bg-green-500/20 border border-green-500/40'
            }`}>
              {hasActiveAlerts ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Shield className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div className="flex-1">
              {hasActiveAlerts ? (
                <button 
                  onClick={() => setCurrentPage('alerts')}
                  className="text-body font-medium text-red-400 hover:text-red-300 transition-colors text-left"
                >
                  {activeAlertsMessage}
                </button>
              ) : (
                <p className="text-body font-medium text-green-400">
                  {noAlertsMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RiskChart
          title={t('dashboard.potentialsRisk')}
          data={potentialsRiskData}
        />
        <RiskChart
          title={t('dashboard.inventoryRisk')}
          data={inventoryRiskData}
        />
        <RiskChart
          title={t('dashboard.suppliersRisk')}
          data={suppliersRiskData}
        />
      </div>

      {/* Incident Management Table */}
      <DataTable
        title={t('dashboard.incidentManagementTable')}
        columns={[
          { key: 'incident_id', header: t('dashboard.incidentId') },
          { key: 'type', header: t('dashboard.incidentType') },
          { 
            key: 'estimated_damage', 
            header: t('dashboard.estimatedDamage'),
            render: (item) => <Badge type="risk" value={item.estimated_damage} />
          },
          { 
            key: 'detected_at', 
            header: t('dashboard.detectionDate'),
            render: (item) => new Date(item.detected_at).toLocaleDateString('sl-SI')
          },
          { 
            key: 'resolved_at', 
            header: t('dashboard.resolutionDate'),
            render: (item) => item.resolved_at ? new Date(item.resolved_at).toLocaleDateString('sl-SI') : '-'
          },
          { 
            key: 'nis2_required', 
            header: t('dashboard.nis2Required'),
            render: (item) => item.nis2_required ? t('dashboard.yes') : t('dashboard.no')
          },
          { 
            key: 'status', 
            header: t('common.status'),
            render: (item) => <Badge type="status" value={item.status} />
          }
        ]}
        data={incidents}
        onViewAll={handleViewAllIncidents}
        onViewItem={handleViewIncident}
      />

      {/* Cyber Incident Reports Table */}
      <DataTable
        title={t('dashboard.cyberIncidentReportsTable')}
        columns={[
          { 
            key: 'referencna_stevilka', 
            header: 'Referenčna št.',
            render: (item) => item.referencna_stevilka || item.incident_number || `INC-${item.id?.slice(0, 8) || 'NEW'}`
          },
          { 
            key: 'zadeva', 
            header: 'Zadeva',
            render: (item) => item.zadeva || item.opis_incidenta || item.incident_description || 'Brez zadeve'
          },
          { 
            key: 'tip_porocila', 
            header: 'Poročilo',
            render: (item) => {
              const reportType = item.tip_porocila || item.report_type
              const typeMap: { [key: string]: string } = {
                'prvo_porocilo': 'Prvo poročilo',
                'vmesno_porocilo': 'Vmesno poročilo',
                'koncno_porocilo': 'Končno poročilo',
                'prostovoljna_priglasitev': 'Prostovoljna priglasitev'
              }
              return typeMap[reportType] || reportType || '-'
            }
          },
          { 
            key: 'zacetek_incidenta', 
            header: 'Začetek incidenta',
            render: (item) => {
              const date = item.zacetek_incidenta || item.detection_datetime
              return date ? new Date(date).toLocaleString('sl-SI') : '-'
            }
          },
          { 
            key: 'cas_zadnjega_porocanja', 
            header: 'Zadnje poročanje',
            render: (item) => {
              const date = item.cas_zadnjega_porocanja
              return date ? new Date(date).toLocaleString('sl-SI') : '-'
            }
          },
          { 
            key: 'trenutno_stanje', 
            header: t('common.status'),
            render: (item) => <Badge type="status" value={item.trenutno_stanje || item.incident_status || 'v teku'} />
          }
        ]}
        data={cyberReports}
        onViewAll={handleViewAllReports}
        onViewItem={handleViewReport}
      />

      {/* High-risk Workspaces Table */}
      <DataTable
        title={t('dashboard.workspacesTable')}
        columns={[
          { 
            key: 'manufacturer', 
            header: t('dashboard.manufacturerAndModel'),
            render: (item) => `${item.manufacturer} ${item.model}`
          },
          { key: 'device_type', header: t('dashboard.type') },
          { key: 'location', header: t('dashboard.whereIsLocated') },
          { 
            key: 'risk_level', 
            header: t('dashboard.riskLevel'),
            render: (item) => <Badge type="risk" value={item.risk_level} />
          },
          { 
            key: 'last_check', 
            header: t('dashboard.lastDeviceCheck'),
            render: (item) => item.last_check ? new Date(item.last_check).toLocaleString('sl-SI') : '-'
          }
        ]}
        data={devices}
        onViewAll={handleViewAllDevices}
        onViewItem={handleViewDevice}
      />

      {/* Support Requests Table */}
      <DataTable
        title={t('dashboard.supportRequestsTable')}
        columns={[
          { key: 'ticket_id', header: t('common.id') },
          { 
            key: 'created_date', 
            header: t('dashboard.dateAndTime'),
            render: (item) => new Date(item.created_date).toLocaleString('sl-SI')
          },
          { key: 'requester_name', header: t('dashboard.fullNameColumn') },
          { key: 'subject', header: t('dashboard.subject') },
          { 
            key: 'priority', 
            header: t('dashboard.priority'),
            render: (item) => {
              // Map English priority values to Slovenian for badge
              const priorityMap: { [key: string]: string } = {
                'low': 'Nizka',
                'medium': 'Srednja', 
                'high': 'Visoka',
                'urgent': 'Nujna',
                'critical': 'Kritična'
              }
              const mappedPriority = priorityMap[item.priority] || item.priority
              return <Badge type="priority" value={mappedPriority} />
            }
          },
          { 
            key: 'status', 
            header: t('dashboard.requestStatus'),
            render: (item) => {
              // Map English status values to Slovenian for badge
              const statusMap: { [key: string]: string } = {
                'open': 'Odprto',
                'in_progress': 'V teku',
                'waiting_for_customer': 'Čakanje na stranko',
                'resolved': 'Rešeno',
                'closed': 'Zaprto'
              }
              const mappedStatus = statusMap[item.status] || item.status
              return <Badge type="status" value={mappedStatus} />
            }
          }
        ]}
        data={supportRequests}
        onViewAll={handleViewAllSupport}
        onViewItem={handleViewSupport}
      />

      {/* Detail Modals */}
      <IncidentDetailModal
        isOpen={showIncidentModal}
        onClose={() => {
          console.log('Dashboard: Incident modal closing')
          setShowIncidentModal(false)
          setSelectedIncident(null)
        }}
        incident={selectedIncident}
      />

      <ReportDetailModal
        isOpen={showReportModal}
        onClose={() => {
          console.log('Dashboard: Report modal closing')
          setShowReportModal(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
      />

      <DeviceDetailModal
        isOpen={showDeviceModal}
        onClose={() => {
          console.log('Dashboard: Device modal closing')
          setShowDeviceModal(false)
          setSelectedDevice(null)
        }}
        device={selectedDevice}
      />

      <SupportDetailModal
        isOpen={showSupportModal}
        onClose={() => {
          console.log('Dashboard: Support modal closing')
          setShowSupportModal(false)
          setSelectedSupport(null)
        }}
        supportRequest={selectedSupport}
      />
    </div>
  )
}
