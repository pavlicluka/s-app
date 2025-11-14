import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Package, Plus, Edit, Trash2 } from 'lucide-react'
import { ISOAssetManagementAddModal } from '../modals'

export default function ISOAssetManagement() {
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
        .from('iso_asset_management')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        // Demo podatki ko je baza prazna
        const demoData = [
          {
            id: 'demo-1',
            asset_id: 'SRV-001',
            asset_name: 'Glavni strežnik',
            asset_type: 'hardware',
            owner: 'Janez Novak',
            location: 'Klet - Rack 01',
            value_rating: 'very_high',
            classification: 'confidential',
            risk_level: 'high',
            last_assessment_date: '2024-11-01',
            organization_id: userProfile.organization_id
          },
          {
            id: 'demo-2',
            asset_id: 'SW-001',
            asset_name: 'SAP ERP sistem',
            asset_type: 'software',
            owner: 'IT oddelek',
            location: 'Glavni podatkovni center',
            value_rating: 'very_high',
            classification: 'confidential',
            risk_level: 'critical',
            last_assessment_date: '2024-10-15',
            organization_id: userProfile.organization_id
          },
          {
            id: 'demo-3',
            asset_id: 'LAP-001',
            asset_name: 'Prenosni računalnik direktorja',
            asset_type: 'hardware',
            owner: 'Dr. Marija Kovač',
            location: 'Pisarna 205',
            value_rating: 'high',
            classification: 'restricted',
            risk_level: 'medium',
            last_assessment_date: '2024-11-05',
            organization_id: userProfile.organization_id
          },
          {
            id: 'demo-4',
            asset_id: 'DATA-001',
            asset_name: 'Baza strank',
            asset_type: 'data',
            owner: 'Vodja prodaje',
            location: 'Podatkovni center - DB Cluster',
            value_rating: 'very_high',
            classification: 'confidential',
            risk_level: 'high',
            last_assessment_date: '2024-11-08',
            organization_id: userProfile.organization_id
          },
          {
            id: 'demo-5',
            asset_id: 'SVC-001',
            asset_name: 'Email sistem',
            asset_type: 'service',
            owner: 'IT oddelek',
            location: 'Cloud (Microsoft 365)',
            value_rating: 'medium',
            classification: 'internal',
            risk_level: 'medium',
            last_assessment_date: '2024-11-07',
            organization_id: userProfile.organization_id
          }
        ]
        setRecords(demoData)
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error:', error)
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
          <Package className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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

  const getRiskStyle = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'bg-risk-high/20 text-risk-high'
      case 'medium': return 'bg-risk-medium/20 text-risk-medium'
      case 'low': return 'bg-risk-low/20 text-risk-low'
      case 'critical': return 'bg-risk-high/20 text-risk-high'
      default: return 'bg-bg-surface text-text-secondary'
    }
  }

  const getValueRatingText = (valueRating: string) => {
    switch(valueRating?.toLowerCase()) {
      case 'very_low': return 'Zelo nizka'
      case 'low': return 'Nizka'
      case 'medium': return 'Srednja'
      case 'high': return 'Visoka'
      case 'very_high': return 'Zelo visoka'
      default: return '-'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.assets.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.assets.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.assets.addAsset')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.assets.assetId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.assets.assetName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.assets.assetType')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.assets.owner')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Lokacija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Vrednost</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.assets.classification')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskLevel')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.asset_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.asset_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.asset_type}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.owner}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.location || '-'}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{getValueRatingText(record.value_rating)}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-caption font-medium bg-accent-primary/10 text-accent-primary">
                    {record.classification}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.risk_level)}`}>
                    {t(`iso.assets.riskLevelOptions.${record.risk_level.toLowerCase()}`)}
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

      <ISOAssetManagementAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
