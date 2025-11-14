// Page component for NIS2 compliance
import { Shield, AlertTriangle, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Incident } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import DataTable from './DataTable'
import Badge from './Badge'
import IncidentDetailModal from './modals/IncidentDetailModal'


interface NIS2PageProps {
  setCurrentPage: (page: string) => void
}

export default function NIS2Page({ setCurrentPage }: NIS2PageProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'incidents'>('incidents')
  
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

      // Setup real-time subscription
      const channel = supabase
        .channel('incidents-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'incidents' }, 
          () => {
            loadIncidents()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
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
            <Shield className="w-8 h-8 text-white" />
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

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    nis2Required: incidents.filter(i => i.nis2_required).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('nis2.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('nis2.subtitle')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setCurrentPage('cyber-incident-report')}
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Poročanje o incidentih
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Total Incidents</div>
          <div className="text-display-lg font-bold text-text-primary">{stats.total}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Open</div>
          <div className="text-display-lg font-bold text-risk-high">{stats.open}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Investigating</div>
          <div className="text-display-lg font-bold text-risk-medium">{stats.investigating}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Resolved</div>
          <div className="text-display-lg font-bold text-risk-low">{stats.resolved}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">zahteva NIS-2</div>
          <div className="text-display-lg font-bold text-accent-primary">{stats.nis2Required}</div>
        </div>
      </div>



      {/* Content - Incidents */}
      <div className="space-y-8">
        {/* Critical Alert */}
        {stats.open > 0 && (
          <div className="bg-risk-high/15 border border-risk-high/30 p-6 rounded-lg flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-risk-high flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-heading-md font-semibold text-risk-high mb-2">
                Kritični incidenti zahtevajo pozornost
              </h3>
              <p className="text-body-sm text-text-primary">
                {stats.open} odprtih incidentov zahteva takojšnjo obravnavo. 
                {stats.nis2Required > 0 && ` ${stats.nis2Required} incidentov zahteva NIS2 poročanje.`}
              </p>
            </div>
          </div>
        )}

        {/* All Incidents Table */}
        <DataTable
          title={t('nis2.tabs.incidents')}
          columns={[
            { key: 'incident_id', header: t('nis2.incidents.table.incidentId') },
            { key: 'type', header: t('nis2.incidents.table.incidentType') },
            { 
              key: 'estimated_damage', 
              header: t('nis2.incidents.table.estimatedDamage'),
              render: (item) => <Badge type="risk" value={item.estimated_damage} />
            },
            { 
              key: 'detected_at', 
              header: t('nis2.incidents.table.detectionDate'),
              render: (item) => new Date(item.detected_at).toLocaleDateString('sl-SI')
            },
            { 
              key: 'resolved_at', 
              header: t('nis2.incidents.table.resolutionDate'),
              render: (item) => item.resolved_at ? new Date(item.resolved_at).toLocaleDateString('sl-SI') : '-'
            },
            { 
              key: 'nis2_required', 
              header: t('nis2.incidents.table.nis2Required'),
              render: (item) => (
                <span className={item.nis2_required ? 'text-risk-high font-medium' : 'text-text-tertiary'}>
                  {item.nis2_required ? 'DA' : 'NE'}
                </span>
              )
            },
            { 
              key: 'status', 
              header: t('nis2.incidents.table.status'),
              render: (item) => <Badge type="status" value={item.status} />
            }
          ]}
          data={incidents}
          onViewItem={handleViewIncident}
        />
      </div>
      
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
