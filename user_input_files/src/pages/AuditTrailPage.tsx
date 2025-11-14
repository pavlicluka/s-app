import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { FileText, ArrowLeft, Filter, Search, Calendar } from 'lucide-react'

interface AuditLog {
  id: string
  action_type: string
  action_description: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface AuditTrailPageProps {
  onNavigate?: (page: string) => void
}

export default function AuditTrailPage({ onNavigate }: AuditTrailPageProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  useEffect(() => {
    loadAuditLogs()
  }, [user])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, selectedType])

  async function loadAuditLogs() {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLogs(data || [])
    } catch (error) {
      console.error('Napaka pri nalaganju revizijske sledi:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterLogs() {
    let filtered = [...logs]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.action_type === selectedType)
    }

    setFilteredLogs(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  function getActionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      login: 'Prijava',
      logout: 'Odjava',
      profile_edit: 'Urejanje profila',
      password_change: 'Sprememba gesla',
      data_export: 'Izvoz podatkov',
      settings_change: 'Sprememba nastavitev',
      view_page: 'Ogled strani'
    }
    return labels[type] || type
  }

  function getActionTypeColor(type: string): string {
    const colors: Record<string, string> = {
      login: 'bg-status-success/20 text-status-success',
      logout: 'bg-text-secondary/20 text-text-secondary',
      profile_edit: 'bg-accent-primary/20 text-accent-primary',
      password_change: 'bg-status-warning/20 text-status-warning',
      data_export: 'bg-blue-500/20 text-blue-400',
      settings_change: 'bg-purple-500/20 text-purple-400',
      view_page: 'bg-text-secondary/10 text-text-secondary'
    }
    return colors[type] || 'bg-text-secondary/20 text-text-secondary'
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Get unique action types for filter
  const actionTypes = Array.from(new Set(logs.map(log => log.action_type)))

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Revizijska sled</h1>
          <p className="text-body-sm text-text-secondary mt-1">Pregled aktivnosti vašega računa</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Išči po opisu aktivnosti..."
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                       focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                       focus:outline-none focus:border-accent-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Vse aktivnosti</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{getActionTypeLabel(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-body-sm text-text-secondary">
        Prikazujem {filteredLogs.length} {filteredLogs.length === 1 ? 'rezultat' : filteredLogs.length > 4 ? 'rezultatov' : 'rezultate'}
      </div>

      {/* Logs Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        {currentLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-body-md text-text-secondary">Ni najdenih aktivnosti</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-near-black">
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Datum in čas
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary">Tip aktivnosti</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary">Opis</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary">IP naslov</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr 
                    key={log.id}
                    className={`border-b border-border-subtle hover:bg-bg-surface-hover transition-colors ${
                      index === currentLogs.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-body-sm text-text-primary whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-body-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                        {getActionTypeLabel(log.action_type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-secondary">
                      {log.action_description}
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-secondary">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border-subtle rounded-lg text-body-sm text-text-primary
                     hover:bg-bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prejšnja
          </button>
          
          <span className="px-4 py-2 text-body-sm text-text-secondary">
            Stran {currentPage} od {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border-subtle rounded-lg text-body-sm text-text-primary
                     hover:bg-bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Naslednja
          </button>
        </div>
      )}
    </div>
  )
}
