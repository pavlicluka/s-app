import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Headphones, Plus } from 'lucide-react'
import SupportTicketManagementAddModal from '../modals/SupportTicketManagementAddModal'

export default function SupportTicketManagement() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Demo podatki za prikaz funkcionalnosti
  const demoRecords = [
    {
      id: 1,
      ticket_id: 'ZD-2024-001',
      subject: 'Težava z dostopom do sistema',
      description: 'Uporabnik ne more dostopati do aplikacije po zadnji posodobitvi.',
      priority: 'high',
      status: 'in_progress',
      category: 'technical_issue',
      assigned_to: 'Janez Novak',
      requester_name: 'Marija Kovač',
      requester_email: 'marija.kovac@podjetje.si',
      created_date: '2024-11-08T10:30:00Z',
      resolved_date: null,
      resolution_notes: null,
      satisfaction_rating: null
    },
    {
      id: 2,
      ticket_id: 'ZD-2024-002',
      subject: 'Pozabljeno geslo',
      description: 'Potrebujem ponastavitev gesla za spletno aplikacijo.',
      priority: 'medium',
      status: 'resolved',
      category: 'password_reset',
      assigned_to: 'Ana Lipar',
      requester_name: 'Peter Horvat',
      requester_email: 'peter.horvat@podjetje.si',
      created_date: '2024-11-07T14:15:00Z',
      resolved_date: '2024-11-07T15:20:00Z',
      resolution_notes: 'Geslo je bilo uspešno ponastavljeno. Uporabnik je prejel nova navodila.',
      satisfaction_rating: 5
    },
    {
      id: 3,
      ticket_id: 'ZD-2024-003',
      subject: 'Varnostni incident - sum vdora',
      description: 'Opažen sumljiv dostop do sistema iz neznane lokacije.',
      priority: 'critical',
      status: 'open',
      category: 'security_incident',
      assigned_to: 'Tomaž Bergant',
      requester_name: 'Security Team',
      requester_email: 'security@podjetje.si',
      created_date: '2024-11-09T08:00:00Z',
      resolved_date: null,
      resolution_notes: null,
      satisfaction_rating: null
    },
    {
      id: 4,
      ticket_id: 'ZD-2024-004',
      subject: 'Zahteva za usposabljanje',
      description: 'Potrebujemo usposabljanje za novo programsko opremo.',
      priority: 'low',
      status: 'waiting_for_customer',
      category: 'training_request',
      assigned_to: 'Maja Virtič',
      requester_name: 'Oddelek prodaje',
      requester_email: 'prodaja@podjetje.si',
      created_date: '2024-11-06T16:45:00Z',
      resolved_date: null,
      resolution_notes: 'Čakamo na potrditev terminov za usposabljanje.',
      satisfaction_rating: null
    },
    {
      id: 5,
      ticket_id: 'ZD-2024-005',
      subject: 'Težava s tiskalnikom',
      description: 'Tiskalnik v pisarni 205 ne deluje pravilno.',
      priority: 'medium',
      status: 'closed',
      category: 'hardware_issue',
      assigned_to: 'Robert Kosec',
      requester_name: 'Finance Oddelek',
      requester_email: 'finance@podjetje.si',
      created_date: '2024-11-05T09:20:00Z',
      resolved_date: '2024-11-05T11:30:00Z',
      resolution_notes: 'Zamenjana je bila kartuša. Tiskalnik deluje normalno.',
      satisfaction_rating: 4
    }
  ]

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error} = await supabase.from('support_ticket_management').select('*').order('created_date', { ascending: false })
        if (error) throw error
        setRecords(data && data.length > 0 ? data : demoRecords)
      } catch (error) {
        console.error('Error:', error)
        // Če pride do napake ali ni podatkov, prikaži demo podatke
        setRecords(demoRecords)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const handleSave = async () => {
    // Ponovno naloži podatke po shranjevanju
    const { data, error} = await supabase.from('support_ticket_management').select('*').order('created_date', { ascending: false })
    if (error) {
      console.error('Error:', error)
      return
    }
    setRecords(data || [])
  }

  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'open': 'Odprto',
      'in_progress': 'V teku',
      'waiting_for_customer': 'Čakanje na stranko',
      'resolved': 'Rešeno',
      'closed': 'Zaprto'
    }
    return statusMap[status] || status
  }

  const translatePriority = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'low': 'Nizka',
      'medium': 'Srednja',
      'high': 'Visoka',
      'urgent': 'Nujna',
      'critical': 'Kritična'
    }
    return priorityMap[priority] || priority
  }

  const translateCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'technical_issue': 'Tehnična težava',
      'access_request': 'Zahteva za dostop',
      'password_reset': 'Ponastavitev gesla',
      'software_install': 'Namestitev programske opreme',
      'hardware_issue': 'Težava s strojno opremo',
      'network_problem': 'Težava z omrežjem',
      'security_incident': 'Varnostni incident',
      'compliance_question': 'Vprašanje o skladnosti',
      'training_request': 'Zahteva za usposabljanje',
      'other': 'Drugo'
    }
    return categoryMap[category] || category
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Zahtevki za podporo</h1>
            <p className="text-body-sm text-text-secondary">Napredno upravljanje podpornih zahtevkov</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Oddaj nov zahtevek</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Zahtevek za podporo</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Zadeva</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Uporabnik</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Prioriteta</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Kategorija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dodeljen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.ticket_id}</td>
                <td className="px-6 py-4 text-body text-text-primary font-medium max-w-xs truncate">{record.subject}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.requester_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.priority === 'critical' ? 'bg-risk-critical/20 text-risk-critical' : record.priority === 'high' || record.priority === 'urgent' ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-low/20 text-risk-low'}`}>
                    {translatePriority(record.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{translateCategory(record.category)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.status === 'closed' || record.status === 'resolved' ? 'bg-status-success/10 text-status-success' : record.status === 'in_progress' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-error/10 text-status-error'}`}>
                    {translateStatus(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.assigned_to || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupportTicketManagementAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />
    </div>
  )
}
