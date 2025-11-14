import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { Building2, Plus, FileText, Download, AlertCircle } from 'lucide-react'
import { GDPRControllerProcessorAddModal } from '../modals'

export default function GDPRControllerProcessor() {
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
      console.log('Fetching records for organization:', organizationId)
      const { data, error } = await supabase
        .from('gdpr_controller_processor')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      console.log('Successfully fetched records:', data)
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
            {orgError || t('gdpr.controller.noOrganization')}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('gdprController.title_new')}</h1>
            <p className="text-body-sm text-text-secondary">{t('gdprController.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('gdprController.addEntity')}</span>
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
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.fields.company_name')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.fields.headquarters_address')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.fields.legal_basis')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.fields.processing_type')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.agreementColumnName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdprController.fields.retention_period')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.entity_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.headquarters_address || '-'}</td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.legal_basis ? (
                    <span className="text-body-sm">{t(`gdprController.legal_basis_options.${record.legal_basis}`)}</span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.processing_type || '-'}</td>
                <td className="px-6 py-4">
                  {record.agreement_signed ? (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-success/10 text-status-success">
                      {t('gdprController.yes_no.yes')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-error/10 text-status-error">
                      {t('gdprController.yes_no.no')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.retention_period || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GDPRControllerProcessorAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
