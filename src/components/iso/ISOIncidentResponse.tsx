import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Siren, Plus, Edit, Trash2 } from 'lucide-react'
import { ISOIncidentResponseAddModal } from '../modals'

export default function ISOIncidentResponse() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

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

  const fetchRecords = async () => {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error} = await supabase
        .from('iso_incident_response')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('detection_date', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchRecords()
    }
  }, [userProfile])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        <p className="text-body-sm text-text-secondary">{t('common.loading')}</p>
      </div>
    </div>
  )

  if (!userProfile?.organization_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Siren className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <h3 className="text-heading-md font-semibold text-text-primary mb-2">
            {t('common.organizationRequired')}
          </h3>
          <p className="text-body text-text-secondary">
            {t('common.organizationRequiredDescription')}
          </p>
        </div>
      </div>
    )
  }

  const getSeverityStyle = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-risk-critical/20 text-risk-critical shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      case 'high': return 'bg-risk-high/20 text-risk-high shadow-[0_0_8px_rgba(251,146,60,0.3)]'
      case 'medium': return 'bg-risk-medium/20 text-risk-medium'
      case 'low': return 'bg-risk-low/20 text-risk-low'
      default: return 'bg-bg-surface text-text-secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center">
            <Siren className="w-5 h-5 text-risk-high" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.incident.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.incident.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.incident.addIncident')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.incident.incidentId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.incident.incidentType')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.incident.detectionDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('dashboard.severity')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.incident_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.incident_type}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.detection_date).toLocaleString('sl-SI')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${getSeverityStyle(record.severity)}`}>
                    {t(`iso.incident.severityOptions.${record.severity.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.status === 'closed' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                    {t(`iso.incident.statusOptions.${record.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
                      <Edit className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
                      <Trash2 className="w-4 h-4 text-status-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ISOIncidentResponseAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
