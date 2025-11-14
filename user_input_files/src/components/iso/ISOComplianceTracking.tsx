import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { CheckSquare, Plus, Edit, Trash2 } from 'lucide-react'
import { ISOComplianceTrackingAddModal } from '../modals'

export default function ISOComplianceTracking() {
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
        .from('iso_compliance_tracking')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
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
          <CheckSquare className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.compliance.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.compliance.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.compliance.addRequirement')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.compliance.complianceId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.compliance.requirementName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.compliance.standardReference')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.compliance.lastAssessmentDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.compliance.nextReviewDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.compliance_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium max-w-xs truncate">{record.requirement_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.standard_reference}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                    record.compliance_status === 'compliant' ? 'bg-status-success/10 text-status-success' :
                    record.compliance_status === 'partially_compliant' ? 'bg-status-warning/10 text-status-warning' :
                    'bg-status-error/10 text-status-error'
                  }`}>
                    {t(`iso.compliance.statusOptions.${record.compliance_status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.last_assessment_date ? new Date(record.last_assessment_date).toLocaleDateString('sl-SI') : '-'}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.next_review_date ? new Date(record.next_review_date).toLocaleDateString('sl-SI') : '-'}</td>
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

      <ISOComplianceTrackingAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
