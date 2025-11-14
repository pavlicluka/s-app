import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { ISORiskAssessmentAddModal, ModifyModal } from '../modals'
import { useOrganizationId } from '../../hooks/useOrganizationId'

export default function ISORiskAssessment() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId } = useOrganizationId()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
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
    if (!organizationId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error} = await supabase
        .from('iso_risk_assessment')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Demo data for ISO 27001 Risk Assessment
  const demoRecords = [
    {
      id: 'demo-1',
      risk_id: 'R-001',
      asset_name: 'Strežniki in sistemska infrastruktura',
      threat_description: 'Kibernetski napad na strežnike',
      vulnerability_description: 'Nezadostna konfiguracija varnostnih nastavitev',
      likelihood: 'high',
      impact: 'critical',
      risk_level: 'critical',
      mitigation_strategy: 'Implementacija naprednih zaščitnih sistemov in redno posodabljanje',
      residual_risk: 'medium',
      owner: 'Sistemski administrator',
      review_date: '2024-03-15',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      status: 'identified'
    },
    {
      id: 'demo-2',
      risk_id: 'R-002',
      asset_name: 'Baze podatkov s strankami',
      threat_description: 'Izguba osebnih podatkov',
      vulnerability_description: 'Pomanjkanje rednih varnostnih kopij',
      likelihood: 'medium',
      impact: 'high',
      risk_level: 'high',
      mitigation_strategy: 'Dnevno varnostno kopiranje in testiranje obnovitve',
      residual_risk: 'low',
      owner: 'Administrator baz podatkov',
      review_date: '2024-03-20',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      status: 'in_progress'
    },
    {
      id: 'demo-3',
      risk_id: 'R-003',
      asset_name: 'Sistemski dostopi in pooblastila',
      threat_description: 'Prekoračitev pooblastil',
      vulnerability_description: 'Nedostatek nadzora dostopa',
      likelihood: 'low',
      impact: 'high',
      risk_level: 'medium',
      mitigation_strategy: 'Implementacija principa najmanjših pooblastil in redna revizija',
      residual_risk: 'low',
      owner: 'Varnostni manager',
      review_date: '2024-03-25',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      status: 'resolved'
    },
    {
      id: 'demo-4',
      risk_id: 'R-004',
      asset_name: 'Omrežna infrastruktura',
      threat_description: 'Okvara kritične infrastrukture',
      vulnerability_description: 'Staranje strojne opreme',
      likelihood: 'medium',
      impact: 'critical',
      risk_level: 'high',
      mitigation_strategy: 'Preventivno vzdrževanje in redundantni sistemi',
      residual_risk: 'medium',
      owner: 'IT manager',
      review_date: '2024-03-30',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      status: 'in_progress'
    },
    {
      id: 'demo-5',
      risk_id: 'R-005',
      asset_name: 'Človeški viri in usposabljanje',
      threat_description: 'Neusposobljeni zaposleni',
      vulnerability_description: 'Pomanjkanje rednega usposabljanja',
      likelihood: 'high',
      impact: 'medium',
      risk_level: 'high',
      mitigation_strategy: 'Redno usposabljanje in izobraževalni programi',
      residual_risk: 'low',
      owner: 'Človeški viri',
      review_date: '2024-04-05',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      status: 'identified'
    }
  ]

  const addDemoData = async () => {
    try {
      for (const record of demoRecords) {
        const { error } = await supabase
          .from('iso_risk_assessment')
          .insert([record])
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error inserting demo record:', error)
        }
      }
      await fetchRecords()
    } catch (error) {
      console.error('Error adding demo data:', error)
    }
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsViewModalOpen(false)
    setSelectedRecord(null)
  }

  const openEditModal = (record: any) => {
    setSelectedRecord(record)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (record: any) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = (record: any) => {
    setSelectedRecord(record)
    setIsViewModalOpen(true)
  }

  useEffect(() => {
    if (organizationId) {
      fetchRecords()
    }
  }, [organizationId])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        <p className="text-body-sm text-text-secondary">{t('common.loading')}</p>
      </div>
    </div>
  )

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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
    switch(risk.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-green-500 bg-green-500/10'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-risk-high" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.risk.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.risk.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.risk.addRisk')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        {records.length === 0 ? (
          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-sm">
              <p className="text-body-sm text-blue-400">
                {t('iso.risk.noRisks')}
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-bg-pure-black border-b border-border-subtle">
                <tr>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskId')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.assetName')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.threatDescription')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.likelihood')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.impact')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskLevel')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.status')}</th>
                  <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.owner')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {demoRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150 opacity-75">
                    <td className="px-6 py-4 text-body text-text-primary font-mono">{record.risk_id}</td>
                    <td className="px-6 py-4 text-body text-text-primary font-medium">{record.asset_name}</td>
                    <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.threat_description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.likelihood)}`}>
                        {record.likelihood === 'very_low' ? 'Zelo nizka' : 
                         record.likelihood === 'low' ? 'Nizka' : 
                         record.likelihood === 'medium' ? 'Srednja' : 
                         record.likelihood === 'high' ? 'Visoka' : 
                         record.likelihood === 'very_high' ? 'Zelo visoka' : record.likelihood}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.impact)}`}>
                        {record.impact === 'very_low' ? 'Zelo nizka' : 
                         record.impact === 'low' ? 'Nizka' : 
                         record.impact === 'medium' ? 'Srednja' : 
                         record.impact === 'high' ? 'Visoka' : 
                         record.impact === 'very_high' ? 'Zelo visoka' : record.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.risk_level)}`}>
                        {record.risk_level === 'critical' ? 'Kritično' : 
                         record.risk_level === 'high' ? 'Visoko' : 
                         record.risk_level === 'medium' ? 'Srednje' : 
                         record.risk_level === 'low' ? 'Nizko' : record.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-caption font-medium bg-blue-500/10 text-blue-500">
                        {record.status === 'identified' ? 'Identificirano' : 
                         record.status === 'in_progress' ? 'V obravnavi' : 
                         record.status === 'resolved' ? 'Rešeno' : record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-border-subtle text-center">
              <button 
                onClick={addDemoData}
                className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="text-body-sm font-medium">Dodaj demo podatke v bazo</span>
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskId')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.assetName')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.threatDescription')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.likelihood')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.impact')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskLevel')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.status')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.owner')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4 text-body text-text-primary font-mono">{record.risk_id}</td>
                  <td className="px-6 py-4 text-body text-text-primary font-medium">{record.asset_name}</td>
                  <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.threat_description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.likelihood)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.likelihood.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.impact)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.impact.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.risk_level)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.risk_level.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-blue-500/10 text-blue-500">
                      {record.status === 'identified' ? 'Identificirano' : 
                       record.status === 'in_progress' ? 'V obravnavi' : 
                       record.status === 'resolved' ? 'Rešeno' : record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.owner}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openViewModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.view')}
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openEditModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ISORiskAssessmentAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />

      <ModifyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="edit"
        record={selectedRecord}
        title="Uredi oceno tveganja"
        table="iso_risk_assessment"
        fields={[
          { key: 'risk_id', label: 'ID tveganja', type: 'text' as const, required: true },
          { key: 'asset_name', label: 'Naziv sredstva', type: 'text' as const, required: true },
          { key: 'threat_description', label: 'Opis grožnje', type: 'textarea' as const, required: true },
          { key: 'vulnerability_description', label: 'Opis ranljivosti', type: 'textarea' as const },
          { key: 'likelihood', label: 'Verjetnost', type: 'select' as const, required: true, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'impact', label: 'Vpliv', type: 'select' as const, required: true, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'risk_level', label: 'Nivo tveganja', type: 'select' as const, required: true, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'mitigation_strategy', label: 'Strategija za zmanjšanje', type: 'textarea' as const },
          { key: 'residual_risk', label: 'Preostalo tveganje', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'owner', label: 'Lastnik', type: 'text' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />

      <ModifyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="delete"
        record={selectedRecord}
        title="Izbriši oceno tveganja"
        table="iso_risk_assessment"
        fields={[]}
        defaultValues={{}}
      />

      <ModifyModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="view"
        record={selectedRecord}
        title="Podrobnosti ocene tveganja"
        table="iso_risk_assessment"
        fields={[
          { key: 'risk_id', label: 'ID tveganja', type: 'text' as const },
          { key: 'asset_name', label: 'Naziv sredstva', type: 'text' as const },
          { key: 'threat_description', label: 'Opis grožnje', type: 'textarea' as const },
          { key: 'vulnerability_description', label: 'Opis ranljivosti', type: 'textarea' as const },
          { key: 'likelihood', label: 'Verjetnost', type: 'select' as const, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'impact', label: 'Vpliv', type: 'select' as const, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'risk_level', label: 'Nivo tveganja', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'mitigation_strategy', label: 'Strategija za zmanjšanje', type: 'textarea' as const },
          { key: 'residual_risk', label: 'Preostalo tveganje', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'owner', label: 'Lastnik', type: 'text' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />
    </div>
  )
}
