import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, XCircle, Plus, FileText, Download } from 'lucide-react'
import { GDPRConsentManagementAddModal } from '../modals'

export default function GDPRConsentManagement() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_consent_management')
        .select('*')
        .order('created_at', { ascending: false })
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
    fetchRecords()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
  </div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('gdpr.consent.title')}</h1>
          <p className="text-body-sm text-text-secondary">{t('gdpr.consent.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('gdpr.consent.addConsent')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.consent.userName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.consent.userEmail')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.consent.consentType')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.consent.consentStatus')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.date')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('tables.attachedFile')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary">{record.subject_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.subject_email}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.consent_type}</td>
                <td className="px-6 py-4">
                  {record.consent_given ? (
                    <span className="flex items-center gap-2 text-status-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-body-sm font-medium">{t('gdpr.consent.consentGiven')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-status-error">
                      <XCircle className="w-4 h-4" />
                      <span className="text-body-sm font-medium">{t('gdpr.consent.consentDenied')}</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.consent_date ? new Date(record.consent_date).toLocaleDateString('sl-SI') : '-'}
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

      <GDPRConsentManagementAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
