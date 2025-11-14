import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react'
import { InformationSecurityPolicyAddModal, ModifyModal } from '../modals'
import { useOrganizationId } from '../../hooks/useOrganizationId'

export default function InformationSecurityPolicy() {
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
        .from('information_security_policy')
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

  // Demo podatki za IT-varnostne politike - prikažejo se, ko baza ne vrača podatkov
  // Ti zapisi se uporabljajo kot fallback podatki za prikaz primera strukture in vsebine
  const demoRecords = [
    {
      id: 'demo-1',
      policy_name: 'Politika kibernetske varnosti',
      policy_type: 'information_security_general',
      scope_of_application: 'Vsi zaposleni, pogodbeniki in zunanji sodelavci organizacije',
      policy_description: 'Celovita politika za zaščito informacijskih sistemov pred kibernetskimi grožnjami',
      policy_objectives: 'Zagotavljanje celovite zaščite pred kibernetskimi napadi, vzpostavitev varnostnih kontrol in incidentov odziva',
      roles_and_responsibilities: 'IT varnostni manager, sistemski administratorji, vsi zaposleni',
      status: 'active',
      version: '1.0',
      effective_date: '2024-01-15',
      approval_authority: 'Janez Novak, direktor IT'
    },
    {
      id: 'demo-2', 
      policy_name: 'Politika dostopa do sistemov',
      policy_type: 'access_control',
      scope_of_application: 'Vsi informacijski sistemi, aplikacije in podatkovne baze organizacije',
      policy_description: 'Ureja upravljanje dostopov do sistemov z načelom najmanjših pravic',
      policy_objectives: 'Preprečevanje neavtoriziranega dostopa, zagotavljanje sledljivosti dostopov',
      roles_and_responsibilities: 'IT administratorji, varnostni officer, uporabniki sistemov',
      status: 'approved',
      version: '2.1',
      effective_date: '2024-03-01', 
      approval_authority: 'Ana Kovač, varnostna direktorica'
    },
    {
      id: 'demo-3',
      policy_name: 'Politika varnosti podatkov', 
      policy_type: 'data_protection',
      scope_of_application: 'Vsi osebni podatki, poslovni podatki in zaupne informacije organizacije',
      policy_description: 'Zagotavljanje varstva podatkov skladno z GDPR in notranjimi zahtevami',
      policy_objectives: 'Zaščita zaupnosti, celovitosti in razpoložljivosti podatkov',
      roles_and_responsibilities: 'DPO, IT varnostni tim, vodje oddelkov',
      status: 'active',
      version: '1.3',
      effective_date: '2024-02-10',
      approval_authority: 'Marko Peternel, DPO'
    },
    {
      id: 'demo-4',
      policy_name: 'Politika uporabe interneta',
      policy_type: 'compliance', 
      scope_of_application: 'Vsi zaposleni pri uporabi interneta in spletnih storitev v službene namene',
      policy_description: 'Ureja primerno uporabo interneta in spletnih storitev med delovnim časom',
      policy_objectives: 'Zagotavljanje produktivne in varne uporabe interneta, preprečevanje zlorab',
      roles_and_responsibilities: 'IT oddelek, HR, vsi zaposleni',
      status: 'under_review',
      version: '1.2',
      effective_date: '2024-04-01',
      approval_authority: 'Maja Horvat, HR direktorica'
    },
    {
      id: 'demo-5',
      policy_name: 'Politika varnosti mobilnih naprav',
      policy_type: 'information_security_general',
      scope_of_application: 'Vsi mobilni telefoni, tablice, prenosniki in druge prenosne naprave',
      policy_description: 'Zagotavljanje varnosti mobilnih naprav, ki dostopajo do poslovnih podatkov',
      policy_objectives: 'Preprečevanje izgube podatkov preko mobilnih naprav, zagotavljanje šifriranja',
      roles_and_responsibilities: 'IT podpora, zaposleni z mobilnimi napravami, varnostni tim',
      status: 'draft',
      version: '0.9',
      effective_date: '2024-05-01',
      approval_authority: 'Tomaž Leskovar, mobilni IT manager'
    }
  ]

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
      case 'retired': return 'Povlečen'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">IT-varnostne politike</h1>
            <p className="text-body-sm text-text-secondary">Upravljanje IT-varnostnih politik znotraj organizacije</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Dodaj politiko</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Naziv politike</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip politike</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Področje uporabe</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Verzija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Datum veljavnosti</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dejanja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {(records.length === 0 ? demoRecords : records).map((record, index) => (
              <tr key={record.id || index} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.policy_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">
                  {record.policy_type === 'information_security_general' ? 'Splošna informacijska varnost' :
                   record.policy_type === 'access_control' ? 'Kontrola dostopa' :
                   record.policy_type === 'data_protection' ? 'Varstvo podatkov' :
                   record.policy_type === 'incident_response' ? 'Odziv na incidente' :
                   record.policy_type === 'business_continuity' ? 'Poslovna kontinuiteta' :
                   record.policy_type === 'supplier_security' ? 'Varnost dobaviteljev' :
                   record.policy_type === 'physical_security' ? 'Fizična varnost' :
                   record.policy_type === 'human_resources' ? 'Človeški viri' :
                   record.policy_type === 'risk_management' ? 'Upravljanje tveganj' :
                   record.policy_type === 'compliance' ? 'Skladnost' : record.policy_type}
                </td>
                <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.scope_of_application}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${getStatusStyle(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.version}</td>
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
                    {records.length > 0 && (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-status-warning" />
                    <p className="text-body-sm text-text-secondary font-medium">Prikazani so testni (demo) podatki</p>
                    <p className="text-caption text-text-secondary">V bazi ni najdenih zapisov. Kliknite "Dodaj politiko" za vnos resničnih IT-varnostnih politik.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InformationSecurityPolicyAddModal
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
        title="Uredi politiko informacijske varnosti"
        table="information_security_policy"
        fields={[
          { key: 'policy_name', label: 'Naziv politike', type: 'text' as const, required: true },
          { key: 'policy_type', label: 'Tip politike', type: 'select' as const, required: true, options: [
            'information_security_general',
            'access_control',
            'data_protection',
            'incident_response',
            'business_continuity',
            'supplier_security',
            'physical_security',
            'human_resources',
            'risk_management',
            'compliance'
          ]},
          { key: 'policy_description', label: 'Opis politike', type: 'textarea' as const, required: true },
          { key: 'scope_of_application', label: 'Področje uporabe', type: 'textarea' as const, required: true },
          { key: 'policy_objectives', label: 'Cilji politike', type: 'textarea' as const, required: true },
          { key: 'policy_requirements', label: 'Zahteve politike', type: 'textarea' as const, required: true },
          { key: 'roles_and_responsibilities', label: 'Vloge in odgovornosti', type: 'textarea' as const, required: true },
          { key: 'compliance_requirements', label: 'Zahteve skladnosti', type: 'textarea' as const },
          { key: 'implementation_guidelines', label: 'Navodila za izvajanje', type: 'textarea' as const },
          { key: 'monitoring_requirements', label: 'Zahteve spremljanja', type: 'textarea' as const },
          { key: 'review_procedures', label: 'Postopki pregleda', type: 'textarea' as const },
          { key: 'version', label: 'Verzija', type: 'text' as const, required: true },
          { key: 'status', label: 'Status', type: 'select' as const, required: true, options: ['draft', 'under_review', 'approved', 'active', 'retired'] },
          { key: 'effective_date', label: 'Datum veljavnosti', type: 'date' as const, required: true },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const, required: true },
          { key: 'approval_authority', label: 'Avtor odobritve', type: 'text' as const, required: true },
          { key: 'connection_policies', label: 'Povezane politike', type: 'text' as const },
          { key: 'connection_procedures', label: 'Povezani postopki', type: 'text' as const },
          { key: 'connection_risk_assessment', label: 'Povezana ocena tveganj', type: 'text' as const },
          { key: 'connection_soa', label: 'Povezana izjava o uporabnosti', type: 'text' as const }
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
        title="Izbriši politiko informacijske varnosti"
        table="information_security_policy"
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
        title="Podrobnosti politike informacijske varnosti"
        table="information_security_policy"
        fields={[
          { key: 'policy_name', label: 'Naziv politike', type: 'text' as const },
          { key: 'policy_type', label: 'Tip politike', type: 'select' as const, options: [
            'information_security_general',
            'access_control',
            'data_protection',
            'incident_response',
            'business_continuity',
            'supplier_security',
            'physical_security',
            'human_resources',
            'risk_management',
            'compliance'
          ]},
          { key: 'policy_description', label: 'Opis politike', type: 'textarea' as const },
          { key: 'scope_of_application', label: 'Področje uporabe', type: 'textarea' as const },
          { key: 'policy_objectives', label: 'Cilji politike', type: 'textarea' as const },
          { key: 'policy_requirements', label: 'Zahteve politike', type: 'textarea' as const },
          { key: 'roles_and_responsibilities', label: 'Vloge in odgovornosti', type: 'textarea' as const },
          { key: 'compliance_requirements', label: 'Zahteve skladnosti', type: 'textarea' as const },
          { key: 'implementation_guidelines', label: 'Navodila za izvajanje', type: 'textarea' as const },
          { key: 'monitoring_requirements', label: 'Zahteve spremljanja', type: 'textarea' as const },
          { key: 'review_procedures', label: 'Postopki pregleda', type: 'textarea' as const },
          { key: 'version', label: 'Verzija', type: 'text' as const },
          { key: 'status', label: 'Status', type: 'select' as const, options: ['draft', 'under_review', 'approved', 'active', 'retired'] },
          { key: 'effective_date', label: 'Datum veljavnosti', type: 'date' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const },
          { key: 'approval_authority', label: 'Avtor odobritve', type: 'text' as const },
          { key: 'connection_policies', label: 'Povezane politike', type: 'text' as const },
          { key: 'connection_procedures', label: 'Povezani postopki', type: 'text' as const },
          { key: 'connection_risk_assessment', label: 'Povezana ocena tveganj', type: 'text' as const },
          { key: 'connection_soa', label: 'Povezana izjava o uporabnosti', type: 'text' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />
    </div>
  )
}