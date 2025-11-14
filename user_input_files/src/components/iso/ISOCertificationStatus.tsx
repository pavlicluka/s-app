import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Award, Plus, Edit, Trash2 } from 'lucide-react'
import { ISOCertificationStatusAddModal } from '../modals'

// Demo podatki za prikaz, če je baza prazna
const demoData = [
  {
    id: 'demo-1',
    certification_id: 'ISO-27001-2023-001',
    certification_body: 'SIQ Ljubljana',
    certificate_number: 'SIQ-2023-ISO27001-001',
    certification_date: '2023-06-15',
    expiry_date: '2026-06-15',
    status: 'active'
  },
  {
    id: 'demo-2',
    certification_id: 'ISO-27001-2020-002',
    certification_body: 'TÜV SÜD',
    certificate_number: 'TUV-2020-ISO27001-002',
    certification_date: '2020-03-10',
    expiry_date: '2023-03-10',
    status: 'expired'
  },
  {
    id: 'demo-3',
    certification_id: 'ISO-27701-2022-003',
    certification_body: 'Bureau Veritas',
    certificate_number: 'BV-2022-ISO27701-003',
    certification_date: '2022-09-20',
    expiry_date: '2025-09-20',
    status: 'active'
  },
  {
    id: 'demo-4',
    certification_id: 'ISO-27017-2021-004',
    certification_body: 'DNV',
    certificate_number: 'DNV-2021-ISO27017-004',
    certification_date: '2021-12-05',
    expiry_date: '2024-12-05',
    status: 'active'
  },
  {
    id: 'demo-5',
    certification_id: 'ISO-27018-2024-005',
    certification_body: 'LRQA',
    certificate_number: 'LRQA-2024-ISO27018-005',
    certification_date: '2024-01-30',
    expiry_date: '2027-01-30',
    status: 'active'
  }
]

export default function ISOCertificationStatus() {
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
        .from('iso_certification_status')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('certification_date', { ascending: false })
      
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
          <Award className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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
            <Award className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.certification.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.certification.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.certification.addCertificate')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.certification.certificationId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.certification.certificationBody')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.certification.certificateNumber')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.certification.certificationDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.certification.expiryDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {(records.length > 0 ? records : demoData).map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.certification_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.certification_body}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.certificate_number}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.certification_date).toLocaleDateString('sl-SI')}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.expiry_date).toLocaleDateString('sl-SI')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.status === 'active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                    {t(`iso.certification.statusOptions.${record.status}`)}
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

      <ISOCertificationStatusAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
