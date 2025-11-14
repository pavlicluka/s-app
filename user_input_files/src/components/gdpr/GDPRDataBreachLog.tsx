import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { AlertTriangle, Plus, FileText, Download, AlertCircle } from 'lucide-react'
import { GDPRDataBreachLogAddModal } from '../modals'

export default function GDPRDataBreachLog() {
  const { t } = useTranslation()
  const { organizationId, loading: orgLoading, error: orgError } = useOrganization()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error } = await supabase
        .from('gdpr_data_breach_log')
        .select('*')
        .eq('organization_id', organizationId)
        .order('breach_date', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (organizationId) {
      fetchRecords()
    }
  }, [organizationId])

  if (orgLoading) {
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t('common.accessDenied')}</h2>
          <p className="text-body text-text-secondary">
            {orgError || t('gdpr.breach.noOrganization')}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t('common.error')}</h2>
          <p className="text-body text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => fetchRecords()}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  const getSeverityStyle = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'bg-risk-critical/20 text-risk-critical shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      case 'high': return 'bg-risk-high/20 text-risk-high shadow-[0_0_8px_rgba(251,146,60,0.3)]'
      case 'medium': return 'bg-risk-medium/20 text-risk-medium'
      default: return 'bg-risk-low/20 text-risk-low'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-critical/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-risk-critical" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('gdpr.breach.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('gdpr.breach.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('gdpr.breach.addBreach')}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-sm p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-status-error" />
            <span className="text-body text-status-error">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.breachId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.breachType')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.breachDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.affectedRecords')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.severity')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.breach.reportedToAuthority')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('tables.attachedFile')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.breach_id}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.breach_type}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.breach_date).toLocaleDateString('sl-SI')}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.affected_records}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${getSeverityStyle(record.severity)}`}>
                    {t(`gdpr.breach.severityOptions.${record.severity.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.reported_to_authority ? t('gdpr.breach.reportedYes') : t('gdpr.breach.reportedNo')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.status === 'mitigated' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                    {t(`gdpr.breach.statusOptions.${record.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {record.file_url ? (
                    <a
                      href={record.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-accent-primary hover:text-accent-primary-hover transition-colors"
                      title={record.file_name}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm truncate max-w-[150px]">
                        {record.file_name || 'Datoteka'}
                      </span>
                      <Download className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-text-muted text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GDPRDataBreachLogAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
