import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { FileSearch, Plus } from 'lucide-react'
import { ISOAuditLogAddModal } from '../modals'

export default function ISOAuditLog() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isDemoData, setIsDemoData] = useState(false)

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

  // Demo podatki za ISO 27001 audit log
  const getDemoRecords = () => [
    {
      id: 'demo-1',
      audit_id: 'ISO-2024-001',
      audit_type: 'internal',
      audit_date: '2024-11-05T09:00:00.000Z',
      auditor_name: 'admin@podjetje.si',
      scope: 'Pregled upravljanja dostopov do sistemov in podatkov',
      findings: 'Ugotovljene nepravilnosti pri upravljanju uporabniških pravic. Nekateri uporabniki imajo preveč privilegijev.',
      recommendations: 'Izvesti periodičen pregled uporabniških računov in implementirati princip najmanjših privilegijev.',
      severity: 'medium',
      status: 'in_progress',
      remediation_plan: 'Izvesti revizijo vseh uporabniških računov do 20.11.2024 in odstraniti nepotrebne privilegije.',
      due_date: '2024-11-20T00:00:00.000Z',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-2',
      audit_id: 'ISO-2024-002',
      audit_type: 'security',
      audit_date: '2024-11-02T14:30:00.000Z',
      auditor_name: 'uporabnik1@podjetje.si',
      scope: 'Pregled varnostnih incidentov in odzivnih postopkov',
      findings: 'Zabeleženi varnostni incidenti so ustrezno dokumentirani. Potrebne izboljšave pri času odziva.',
      recommendations: 'Optimizirati postopke odziva na varnostne incidente in izvesti dodatno usposabljanje.',
      severity: 'low',
      status: 'closed',
      remediation_plan: 'Usposabljanje ekipe za incident response načrtovano za december 2024.',
      due_date: '2024-12-15T00:00:00.000Z',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-3',
      audit_id: 'ISO-2024-003',
      audit_type: 'compliance',
      audit_date: '2024-10-28T10:15:00.000Z',
      auditor_name: 'varnost@podjetje.si',
      scope: 'Skladnost z ISO 27001 standardom - upravljanje sredstev',
      findings: 'Inventar sredstev ni popolnoma posodobljen. Manjkajo nekateri informacijski sistemi.',
      recommendations: 'Ažurirati inventar sredstev in dodeliti odgovorne osebe za posamezna sredstva.',
      severity: 'high',
      status: 'open',
      remediation_plan: 'Popolna revizija inventarja sredstev v sodelovanju z IT oddelkom.',
      due_date: '2024-11-30T00:00:00.000Z',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-4',
      audit_id: 'ISO-2024-004',
      audit_type: 'quality',
      audit_date: '2024-10-25T16:45:00.000Z',
      auditor_name: 'kakovost@podjetje.si',
      scope: 'Pregled postopkov upravljanja z dokumentacijo',
      findings: 'Dokumentacija je ustrezno verzionirana in dostopna. Potrebne manjše izboljšave.',
      recommendations: 'Standardizirati format dokumentov in uvesti avtomatsko preverjanje verzij.',
      severity: 'low',
      status: 'resolved',
      remediation_plan: 'Implementacija novih standardov dokumentacije.',
      due_date: '2024-11-10T00:00:00.000Z',
      organization_id: userProfile?.organization_id
    },
    {
      id: 'demo-5',
      audit_id: 'ISO-2024-005',
      audit_type: 'business_continuity',
      audit_date: '2024-10-20T11:20:00.000Z',
      auditor_name: 'admin@podjetje.si',
      scope: 'Pregled načrtov kontinuitete poslovanja',
      findings: 'Načrti kontinuitete potrebujejo posodobitev glede novih sistemov in procesov.',
      recommendations: 'Ažurirati načrte kontinuitete in izvesti testiranje postopkov.',
      severity: 'critical',
      status: 'in_progress',
      remediation_plan: 'Popolna posodobitev BCP dokumentacije in testiranje do konca leta.',
      due_date: '2024-12-31T00:00:00.000Z',
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
        .from('iso_audit_log')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('audit_date', { ascending: false })
      
      if (error) throw error
      
      // Če ni zapisov iz baze, uporabi demo podatke
      const records = data || []
      if (records.length === 0) {
        setRecords(getDemoRecords())
        setIsDemoData(true)
      } else {
        setRecords(records)
        setIsDemoData(false)
      }
    } catch (error) {
      console.error('Error:', error)
      // V primeru napake prikazi demo podatke
      setRecords(getDemoRecords())
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
    setIsDemoData(false) // Reset demo data flag po uspešnem shranjevanju
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
          <FileSearch className="w-12 h-12 text-text-secondary mx-auto mb-3" />
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
            <FileSearch className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.audit.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.audit.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.audit.addAudit')}</span>
        </button>
      </div>

      {isDemoData && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileSearch className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <h4 className="text-body-sm font-medium text-blue-400">Prikazani so demo podatki</h4>
              <p className="text-body-xs text-blue-300 mt-1">
                Trenutno ni na voljo povezava z bazo podatkov. Prikazani so testni zapisi za demonstracijo funkcionalnosti.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.audit.auditId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.audit.auditType')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.audit.auditDate')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.audit.auditorName')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('dashboard.severity')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.audit_id}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{t(`iso.audit.auditTypeOptions.${record.audit_type}`)}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.audit_date).toLocaleDateString('sl-SI')}</td>
                <td className="px-6 py-4 text-body text-text-primary">{record.auditor_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.severity === 'critical' ? 'bg-red-500/20 text-red-400' : record.severity === 'high' ? 'bg-risk-high/20 text-risk-high' : record.severity === 'medium' ? 'bg-risk-medium/20 text-risk-medium' : 'bg-risk-low/20 text-risk-low'}`}>
                    {t(`iso.audit.severityOptions.${record.severity}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.status === 'closed' ? 'bg-status-success/10 text-status-success' : record.status === 'resolved' ? 'bg-accent-primary/10 text-accent-primary' : record.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-status-warning/10 text-status-warning'}`}>
                    {t(`iso.audit.statusOptions.${record.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ISOAuditLogAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
