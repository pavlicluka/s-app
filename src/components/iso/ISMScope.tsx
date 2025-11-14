import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Target, Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react'
import { ISMScopeAddModal, ModifyModal } from '../modals'
import { useOrganizationId } from '../../hooks/useOrganizationId'

export default function ISMScope() {
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
        .from('isms_scope')
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

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'active': return 'bg-status-success/20 text-status-success shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      case 'approved': return 'bg-blue-500/20 text-blue-400'
      case 'under_review': return 'bg-status-warning/20 text-status-warning'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Aktiven'
      case 'approved': return 'Odobren'
      case 'under_review': return 'V pregledu'
      case 'draft': return 'Osnutek'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Obseg ISMS</h1>
            <p className="text-body-sm text-text-secondary">Določitev mej in področja uporabe sistema upravljanja informacijske varnosti</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Dodaj obseg</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Naziv obsega</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Opis</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Organizacijske enote</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Odgovorna oseba</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Datum veljavnosti</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dejanja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-text-secondary" />
                    <p className="text-body text-text-secondary">Nobeni zapis ni najden</p>
                    <p className="text-body-sm text-text-secondary">
                      {organizationId ? 
                        `Za organizacijo ${organizationId} ni najdenih zapisov v tabeli isms_scope` : 
                        'Organizacijski kontekst ni na voljo'
                      }
                    </p>
                    <p className="text-body-sm text-text-secondary">Poizkusite dodati nov obseg ISMS</p>
                    <details className="mt-2">
                      <summary className="text-body-sm text-text-secondary cursor-pointer hover:text-text-primary">
                        Tehnične informacije
                      </summary>
                      <div className="mt-2 text-caption text-text-secondary bg-bg-pure-black p-3 rounded border">
                        <p>Organization ID: {organizationId || 'Ni na voljo'}</p>
                        <p>Records count: {records.length}</p>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.scope_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.scope_description}</td>
                <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.organizational_units}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${getStatusStyle(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.responsible_person}</td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.effective_date ? new Date(record.effective_date).toLocaleDateString('sl-SI') : '-'}
                </td>
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
            ))
            )}
          </tbody>
        </table>
      </div>

      <ISMScopeAddModal
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
        title="Uredi obseg ISMS"
        table="isms_scope"
        fields={[
          { key: 'scope_name', label: 'Naziv obsega', type: 'text' as const, required: true },
          { key: 'scope_description', label: 'Opis obsega', type: 'textarea' as const, required: true },
          { key: 'scope_boundaries', label: 'Mejne opredelitve', type: 'textarea' as const, required: true },
          { key: 'organizational_units', label: 'Organizacijske enote', type: 'textarea' as const, required: true },
          { key: 'business_processes', label: 'Poslovni procesi', type: 'textarea' as const },
          { key: 'information_types', label: 'Tipi informacij', type: 'textarea' as const },
          { key: 'systems_applications', label: 'Sistemi in aplikacije', type: 'textarea' as const },
          { key: 'third_party_interfaces', label: 'Vmesniki do tretjih oseb', type: 'textarea' as const },
          { key: 'regulatory_requirements', label: 'Regulatorne zahteve', type: 'textarea' as const },
          { key: 'exclusions', label: 'Izključitve', type: 'textarea' as const },
          { key: 'exclusion_justification', label: 'Utemeljitev izključitve', type: 'textarea' as const },
          { key: 'connection_risk_assessment', label: 'Povezana ocena tveganj', type: 'select' as const, required: false, dataSource: { table: 'iso_risk_assessment', idField: 'id', labelField: 'risk_name' } },
          { key: 'connection_soa', label: 'Povezana izjava o uporabnosti', type: 'select' as const, required: false, dataSource: { table: 'iso_statement_applicability', idField: 'id', labelField: 'control_name' } },
          { key: 'status', label: 'Status', type: 'select' as const, required: true, options: ['draft', 'under_review', 'approved', 'active'] },
          { key: 'status', label: 'Status', type: 'select' as const, required: true, options: [
            'draft',
            'under_review',
            'approved',
            'active'
          ]},
          { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const, required: true },
          { key: 'effective_date', label: 'Datum veljavnosti', type: 'date' as const, required: true },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const, required: true },
          { key: 'connection_risk_assessment', label: 'Povezava z RA', type: 'text' as const },
          { key: 'connection_soa', label: 'Povezava s SoA', type: 'text' as const },
          { key: 'connection_policies', label: 'Povezava s politikami', type: 'text' as const }
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
        title="Izbriši obseg ISMS"
        table="isms_scope"
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
        title="Podrobnosti obsega ISMS"
        table="isms_scope"
        fields={[
          { key: 'scope_name', label: 'Naziv obsega', type: 'text' as const },
          { key: 'scope_description', label: 'Opis obsega', type: 'textarea' as const },
          { key: 'scope_boundaries', label: 'Mejne opredelitve', type: 'textarea' as const },
          { key: 'organizational_units', label: 'Organizacijske enote', type: 'textarea' as const },
          { key: 'business_processes', label: 'Poslovni procesi', type: 'textarea' as const },
          { key: 'information_types', label: 'Tipi informacij', type: 'textarea' as const },
          { key: 'systems_applications', label: 'Sistemi in aplikacije', type: 'textarea' as const },
          { key: 'third_party_interfaces', label: 'Vmesniki do tretjih oseb', type: 'textarea' as const },
          { key: 'regulatory_requirements', label: 'Regulatorne zahteve', type: 'textarea' as const },
          { key: 'exclusions', label: 'Izključitve', type: 'textarea' as const },
          { key: 'exclusion_justification', label: 'Utemeljitev izključitve', type: 'textarea' as const },
          { key: 'status', label: 'Status', type: 'select' as const, options: [
            'draft',
            'under_review',
            'approved',
            'active'
          ]},
          { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
          { key: 'effective_date', label: 'Datum veljavnosti', type: 'date' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const },
          { key: 'connection_risk_assessment', label: 'Povezava z RA', type: 'text' as const },
          { key: 'connection_soa', label: 'Povezava s SoA', type: 'text' as const },
          { key: 'connection_policies', label: 'Povezava s politikami', type: 'text' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />
    </div>
  )
}