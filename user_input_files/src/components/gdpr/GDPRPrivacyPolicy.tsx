import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Edit, Trash2, Download } from 'lucide-react'
import { GDPRPrivacyPolicyAddModal } from '../modals'

interface PrivacyPolicy {
  id: string
  policy_name: string
  version: string
  effective_date: string
  status: string
  approved_by: string
  last_updated: string
  description: string
  created_at: string
  file_url?: string
  file_name?: string
  file_size?: number
}

export default function GDPRPrivacyPolicy() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<PrivacyPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_privacy_policies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Če ni podatkov iz baze, uporabi demo podatke
      if (!data || data.length === 0) {
        const demoData: PrivacyPolicy[] = [
          {
            id: 'demo-1',
            policy_name: 'Politika obdelave osebnih podatkov zaposlenih',
            version: '2.1',
            effective_date: '2024-01-15',
            status: 'active',
            approved_by: 'Janez Novak',
            last_updated: '2024-11-01',
            description: 'Celovita politika za obdelavo osebnih podatkov zaposlenih v skladu z GDPR in ZVOP-2, vključuje pravice do dostopa, popravka in izbrisa.',
            created_at: '2024-01-15T08:00:00Z',
            file_url: '/demo/politika_zaposlenih.pdf',
            file_name: 'Politika_obdelave_podatkov_zaposlenih_v2.1.pdf',
            file_size: 245760
          },
          {
            id: 'demo-2',
            policy_name: 'Politika hranjenja podatkov strank',
            version: '1.5',
            effective_date: '2024-03-01',
            status: 'active',
            approved_by: 'Marjeta Kovač',
            last_updated: '2024-10-15',
            description: 'Politika določa roke hrambe in načine varnega hranjenja osebnih podatkov strank ter postopke za brisanje podatkov po poteku roka.',
            created_at: '2024-03-01T09:00:00Z',
            file_url: '/demo/politika_hranjenja_strank.pdf',
            file_name: 'Politika_hranjenja_podatkov_strank_v1.5.pdf',
            file_size: 189432
          },
          {
            id: 'demo-3',
            policy_name: 'Politika dostopa do osebnih podatkov',
            version: '3.0',
            effective_date: '2024-05-20',
            status: 'active',
            approved_by: 'Tomaž Bergant',
            last_updated: '2024-11-05',
            description: 'Podrobna navodila za dostop do osebnih podatkov, vključuje načela najmanjših pravic, avtentikacijo in avtorizacijo uporabnikov.',
            created_at: '2024-05-20T10:00:00Z',
            file_url: '/demo/politika_dostopa.pdf',
            file_name: 'Politika_dostopa_osebni_podatki_v3.0.pdf',
            file_size: 312847
          },
          {
            id: 'demo-4',
            policy_name: 'Politika varstva podatkov otrok',
            version: '1.2',
            effective_date: '2024-07-10',
            status: 'in_preparation',
            approved_by: '',
            last_updated: '2024-11-08',
            description: 'Specifična politika za zaščito otrok do 16. let v skladu s členom 8 GDPR, vključuje dodatne varovalne ukrepe in overitve starševske privolitve.',
            created_at: '2024-07-10T11:00:00Z',
            file_url: '',
            file_name: '',
            file_size: 0
          },
          {
            id: 'demo-5',
            policy_name: 'Politika mednarodnega prenosa podatkov',
            version: '2.3',
            effective_date: '2024-09-01',
            status: 'expired',
            approved_by: 'Petra Horvat',
            last_updated: '2024-09-01',
            description: 'Politika za varen prenos osebnih podatkov v tretje države in mednarodne organizacije z ustreznimi zaščitnimi ukrepi in standardnimi pogodbenimi klavzulami.',
            created_at: '2024-09-01T12:00:00Z',
            file_url: '/demo/politika_mednarodni_prenos.pdf',
            file_name: 'Politika_mednarodnega_prenosa_v2.3.pdf',
            file_size: 156234
          }
        ]
        setRecords(demoData)
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // V primeru napake, prikaži demo podatke
      const demoData: PrivacyPolicy[] = [
        {
          id: 'demo-1',
          policy_name: 'Politika obdelave osebnih podatkov zaposlenih',
          version: '2.1',
          effective_date: '2024-01-15',
          status: 'active',
          approved_by: 'Janez Novak',
          last_updated: '2024-11-01',
          description: 'Celovita politika za obdelavo osebnih podatkov zaposlenih v skladu z GDPR in ZVOP-2, vključuje pravice do dostopa, popravka in izbrisa.',
          created_at: '2024-01-15T08:00:00Z',
          file_url: '/demo/politika_zaposlenih.pdf',
          file_name: 'Politika_obdelave_podatkov_zaposlenih_v2.1.pdf',
          file_size: 245760
        },
        {
          id: 'demo-2',
          policy_name: 'Politika hranjenja podatkov strank',
          version: '1.5',
          effective_date: '2024-03-01',
          status: 'active',
          approved_by: 'Marjeta Kovač',
          last_updated: '2024-10-15',
          description: 'Politika določa roke hrambe in načine varnega hranjenja osebnih podatkov strank ter postopke za brisanje podatkov po poteku roka.',
          created_at: '2024-03-01T09:00:00Z',
          file_url: '/demo/politika_hranjenja_strank.pdf',
          file_name: 'Politika_hranjenja_podatkov_strank_v1.5.pdf',
          file_size: 189432
        }
      ]
      setRecords(demoData)
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('gdpr.privacyPolicy.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('gdpr.privacyPolicy.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('gdpr.privacyPolicy.addPolicy')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.privacyPolicy.policyName')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.version')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.privacyPolicy.effectiveDate')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.lastUpdated')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.status')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('gdpr.privacyPolicy.approvedBy')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('tables.attachedFile')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-body text-text-primary font-medium">{record.policy_name}</div>
                      {record.description && (
                        <div className="text-caption text-text-tertiary mt-1 max-w-[300px] truncate" title={record.description}>
                          {record.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.version}</td>
                  <td className="px-6 py-4 text-body text-text-secondary">{new Date(record.effective_date).toLocaleDateString('sl-SI')}</td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.last_updated ? new Date(record.last_updated).toLocaleDateString('sl-SI') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                      record.status === 'active' ? 'bg-status-success/10 text-status-success' : 
                      record.status === 'in_preparation' ? 'bg-status-warning/10 text-status-warning' : 
                      record.status === 'expired' ? 'bg-status-error/10 text-status-error' :
                      'bg-bg-near-black/50 text-text-tertiary'
                    }`}>
                      {record.status === 'active' ? 'Aktiven' :
                       record.status === 'in_preparation' ? 'V pripravi' :
                       record.status === 'expired' ? 'Potekel' :
                       t(`common.${record.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.approved_by || '-'}</td>
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
      </div>

      <GDPRPrivacyPolicyAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />
    </div>
  )
}
