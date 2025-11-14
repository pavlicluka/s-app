// Support page
import { HelpCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, SupportRequest } from '../lib/supabase'
import DataTable from './DataTable'
import Badge from './Badge'

export default function SupportPage() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()

    const channel = supabase
      .channel('support-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'support_requests' }, 
        () => {
          loadRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadRequests() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading support requests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('support.title')}
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje podpornih zahtevkov
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      <DataTable
        title="Vsi podporni zahtevki"
        columns={[
          { key: 'ticket_id', header: 'ID' },
          { 
            key: 'created_at', 
            header: 'Datum in Ura',
            render: (item) => new Date(item.created_at).toLocaleString('sl-SI')
          },
          { key: 'full_name', header: 'Ime in Priimek' },
          { key: 'subject', header: 'Zadeva' },
          { 
            key: 'priority', 
            header: 'Prioriteta',
            render: (item) => <Badge type="priority" value={item.priority} />
          },
          { 
            key: 'status', 
            header: 'Status',
            render: (item) => <Badge type="status" value={item.status} />
          }
        ]}
        data={requests}
        onViewItem={(item) => console.log('View request:', item)}
      />
    </div>
  )
}
