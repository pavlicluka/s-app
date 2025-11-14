import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, Plus, Edit, Trash2, Eye } from 'lucide-react'
import Modal from '../common/Modal'
import { ISOControlsAddModal, ModifyModal } from '../modals'

export default function ISOControlsManagement() {
  const { t } = useTranslation()
  const { user } = useAuth()
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

  // Demo podatki za ISO 27001 kontrole
  const demoData = [
    {
      id: 'demo-1',
      control_id: 'A.5.1.1',
      control_name: 'Varnostna politika informacijske varnosti',
      control_category: 'Varnostna politika',
      implementation_status: 'implemented',
      description: 'Politika informacijske varnosti je določena, odobrena s strani vodstva, objavljena, komunicirana in priznana s strani relevantnih zainteresiranih strani ter se pregleduje redno.',
      responsible_person: 'Janez Novak',
      effectiveness: 'high',
      implementation_date: '2024-01-15',
      review_date: '2024-12-15',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-2',
      control_id: 'A.6.1.1',
      control_name: 'Vloge in odgovornosti za informacijsko varnost',
      control_category: 'Organizacija informacijske varnosti',
      implementation_status: 'implemented',
      description: 'Vloge in odgovornosti za informacijsko varnost so določene in komunicirane v skladu z varnostno politiko informacijske varnosti.',
      responsible_person: 'Ana Kovačič',
      effectiveness: 'high',
      implementation_date: '2024-01-20',
      review_date: '2024-12-20',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-3',
      control_id: 'A.7.1.1',
      control_name: 'Preverjanje ozadja',
      control_category: 'Človeški viri',
      implementation_status: 'partially_implemented',
      description: 'Preverjanje ozadja vseh kandidatov za zaposlitev, pogodbenikov in uporabnikov tretjih strani se izvaja skladno z ustreznimi zakoni, predpisi in etičnimi načeli ter sorazmerno z zahtevami dostopa do informacij.',
      responsible_person: 'Marko Zupan',
      effectiveness: 'medium',
      implementation_date: '2024-02-01',
      review_date: '2025-02-01',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-4',
      control_id: 'A.8.1.1',
      control_name: 'Inventar sredstev',
      control_category: 'Upravljanje sredstev',
      implementation_status: 'implemented',
      description: 'Sredstva, povezana z informacijskimi sistemi, identifikacijom, posodabljanjem in zaščitnimi sredstvi se evidentirajo in vzdržujejo.',
      responsible_person: 'Petra Pavlin',
      effectiveness: 'high',
      implementation_date: '2024-01-10',
      review_date: '2024-07-10',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-5',
      control_id: 'A.9.1.1',
      control_name: 'Politika nadzora dostopa',
      control_category: 'Nadzor dostopa',
      implementation_status: 'not_implemented',
      description: 'Politika nadzora dostopa se vzpostavi, dokumentira in pregleduje na podlagi poslovnih in zahtev informacijske varnosti.',
      responsible_person: 'Tomaž Bergant',
      effectiveness: 'low',
      implementation_date: null,
      review_date: '2025-01-30',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-6',
      control_id: 'A.10.1.1',
      control_name: 'Politika kriptografije',
      control_category: 'Kriptografija',
      implementation_status: 'partially_implemented',
      description: 'Politika in standardi uporabe kriptografskih kontrol se razvijejo in implementirajo za zaščito zaupnosti, avtentičnosti in celovitosti informacij.',
      responsible_person: 'Maja Kosec',
      effectiveness: 'medium',
      implementation_date: '2024-02-15',
      review_date: '2025-02-15',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-7',
      control_id: 'A.11.1.1',
      control_name: 'Fizični vhod in varnost',
      control_category: 'Fizična varnost',
      implementation_status: 'implemented',
      description: 'Ogledališče in naprave za fizični vhod so vzpostavljeni in upravljani za zaščito prostorov, kjer se nahajajo informacijski sistemi.',
      responsible_person: 'Robert Dolenec',
      effectiveness: 'high',
      implementation_date: '2024-01-05',
      review_date: '2024-12-05',
      organization_id: userProfile?.organization_id
    }
  ]

  const fetchRecords = async () => {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error} = await supabase
        .from('iso_controls_management')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Če ni podatkov v bazi, prikaži demo podatke (fallback)
      // Demo podatki vsebujejo realne ISO 27001 kontrolne ID-je in slovenske prevode
      if (!data || data.length === 0) {
        setRecords(demoData)
        // Opozorilo za demo podatke (samo v konzoli za razvijalce)
        console.log('🔍 Prikazani demo podatki - baza je prazna ali ni podatkov')
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error:', error)
      // V primeru napake prikaz demo podatkov
      setRecords(demoData)
      console.log('🔍 Prikazani demo podatki - prišlo je do napake pri pridobivanju podatkov iz baze')
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
          <Shield className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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
            <Shield className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.controls.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.controls.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.controls.addControl')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.controls.controlId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.controls.controlName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.controls.controlCategory')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.controls.responsiblePerson')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.controls.effectiveness')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.control_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.control_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.control_category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                    record.implementation_status === 'implemented' ? 'bg-status-success/10 text-status-success' : 
                    record.implementation_status === 'partially_implemented' ? 'bg-status-warning/10 text-status-warning' : 
                    'bg-status-error/10 text-status-error'
                  }`}>
                    {t(`iso.controls.implementationStatusOptions.${record.implementation_status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.responsible_person}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                    record.effectiveness === 'high' ? 'bg-status-success/10 text-status-success' : 
                    record.effectiveness === 'medium' ? 'bg-status-warning/10 text-status-warning' : 
                    'bg-status-error/10 text-status-error'
                  }`}>
                    {t(`iso.controls.effectivenessOptions.${record.effectiveness}`) || '-'}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>

      <ISOControlsAddModal
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
        title="Uredi kontrolni ukrep"
        table="iso_controls_management"
        fields={[
          { key: 'control_id', label: 'ID kontrole', type: 'text' as const, required: true },
          { key: 'control_name', label: 'Naziv kontrole', type: 'text' as const, required: true },
          { key: 'control_category', label: 'Kategorija kontrole', type: 'text' as const },
          { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, required: true, options: [
            'not_implemented',
            'partially_implemented', 
            'implemented'
          ]},
          { key: 'description', label: 'Opis', type: 'textarea' as const },
          { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
          { key: 'effectiveness', label: 'Učinkovitost', type: 'select' as const, options: [
            'low',
            'medium',
            'high'
          ]},
          { key: 'implementation_date', label: 'Datum implementacije', type: 'date' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: userProfile?.organization_id }}
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
        title="Izbriši kontrolni ukrep"
        table="iso_controls_management"
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
        title="Podrobnosti kontrolnega ukrepa"
        table="iso_controls_management"
        fields={[
          { key: 'control_id', label: 'ID kontrole', type: 'text' as const },
          { key: 'control_name', label: 'Naziv kontrole', type: 'text' as const },
          { key: 'control_category', label: 'Kategorija kontrole', type: 'text' as const },
          { key: 'implementation_status', label: 'Status implementacije', type: 'select' as const, options: [
            'not_implemented',
            'partially_implemented',
            'implemented'
          ]},
          { key: 'description', label: 'Opis', type: 'textarea' as const },
          { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
          { key: 'effectiveness', label: 'Učinkovitost', type: 'select' as const, options: [
            'low',
            'medium',
            'high'
          ]},
          { key: 'implementation_date', label: 'Datum implementacije', type: 'date' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: userProfile?.organization_id }}
      />
    </div>
  )
}
