import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ClipboardList, Edit, Filter, BarChart3, Search, Plus, Eye } from 'lucide-react'
import { SoAControlModal } from '../modals'

interface SoAControl {
  id: string
  control_id: string
  control_name: string
  control_category: string
  status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'planned'
  justification: string
  isms_scope_reference?: string
  risk_reference?: string
  legal_requirements?: string
  policy_references?: string
  control_owner?: string
  implementation_date?: string
  last_review_date: string
  related_controls?: string
  evidence?: string
  created_at: string
  updated_at: string
}

export default function ISOStatementApplicability() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [controls, setControls] = useState<SoAControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedControl, setSelectedControl] = useState<SoAControl | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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

  const fetchControls = async () => {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error} = await supabase
        .from('soa_controls')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('control_id', { ascending: true })
      
      if (error) throw error
      setControls(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    fetchControls()
    setIsModalOpen(false)
    setSelectedControl(null)
  }

  const openEditModal = (control: SoAControl) => {
    setSelectedControl(control)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openViewModal = (control: SoAControl) => {
    setSelectedControl(control)
    setModalMode('view')
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchControls()
    }
  }, [userProfile])

  // Filter controls based on search and filters
  const filteredControls = controls.filter(control => {
    const matchesSearch = !searchTerm || 
      control.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.control_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryFilter || control.control_category === categoryFilter
    const matchesStatus = !statusFilter || control.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get statistics
  const stats = {
    total: controls.length,
    implemented: controls.filter(c => c.status === 'implemented').length,
    partiallyImplemented: controls.filter(c => c.status === 'partially_implemented').length,
    notImplemented: controls.filter(c => c.status === 'not_implemented').length,
    planned: controls.filter(c => c.status === 'planned').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800'
      case 'partially_implemented':
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'not_implemented':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'Implementirano'
      case 'partially_implemented':
        return 'Delno implementirano'
      case 'planned':
        return 'Načrtovano'
      case 'not_implemented':
        return 'Ni implementirano'
      default:
        return status
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        <p className="text-body-sm text-text-secondary">Nalagam kontrole...</p>
      </div>
    </div>
  )

  if (!userProfile?.organization_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <h3 className="text-heading-md font-semibold text-text-primary mb-2">
            Organizacija je potrebna
          </h3>
          <p className="text-body text-text-secondary">
            Za dostop do ISO 27001 SoA funkcionalnosti potrebujete organizacijski račun.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              ISO 27001:2022 Statement of Applicability
            </h1>
            <p className="text-body text-text-secondary">
              Upravljanje vseh 93 kontrolnih ukrepov iz Annex A standarda
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-text-secondary" />
            <span className="text-body-sm text-text-secondary">Skupaj</span>
          </div>
          <p className="text-heading-lg font-semibold text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-body-sm text-text-secondary">Implementirano</span>
          </div>
          <p className="text-heading-lg font-semibold text-green-600 mt-1">{stats.implemented}</p>
        </div>
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-body-sm text-text-secondary">Delno</span>
          </div>
          <p className="text-heading-lg font-semibold text-yellow-600 mt-1">{stats.partiallyImplemented}</p>
        </div>
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-body-sm text-text-secondary">Načrtovano</span>
          </div>
          <p className="text-heading-lg font-semibold text-blue-600 mt-1">{stats.planned}</p>
        </div>
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-body-sm text-text-secondary">Ni implementirano</span>
          </div>
          <p className="text-heading-lg font-semibold text-red-600 mt-1">{stats.notImplemented}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Iskanje po ID kontrole ali imenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-body bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-body bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Vsi kategoriji</option>
              <option value="Organizacijske">Organizacijske</option>
              <option value="Ljudi">Ljudi</option>
              <option value="Fizične">Fizične</option>
              <option value="Tehnološke">Tehnološke</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-body bg-bg-pure-black border border-border-subtle rounded-md focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Vsi statusi</option>
              <option value="implemented">Implementirano</option>
              <option value="partially_implemented">Delno implementirano</option>
              <option value="planned">Načrtovano</option>
              <option value="not_implemented">Ni implementirano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls Table */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Kontrola</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Kategorija</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Lastnik</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Zadnji pregled</th>
                <th className="text-left px-4 py-3 text-caption text-text-secondary uppercase tracking-wide">Dejanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredControls.map((control) => (
                <tr key={control.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-4 py-3 text-body text-text-primary font-mono text-sm">
                    {control.control_id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <p className="text-body text-text-primary font-medium">{control.control_name}</p>
                      {control.justification && (
                        <p className="text-caption text-text-secondary mt-1 truncate">
                          {control.justification}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-caption font-medium bg-gray-100 text-gray-800 rounded-full">
                      {control.control_category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-caption font-medium rounded-full ${getStatusColor(control.status)}`}>
                      {getStatusText(control.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body text-text-secondary">
                    {control.control_owner || '-'}
                  </td>
                  <td className="px-4 py-3 text-body text-text-secondary">
                    {new Date(control.last_review_date).toLocaleDateString('sl-SI')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openViewModal(control)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title="Poglej podrobnosti"
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openEditModal(control)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title="Uredi kontrolo"
                      >
                        <Edit className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No results */}
      {filteredControls.length === 0 && !loading && (
        <div className="text-center py-8">
          <Filter className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <h3 className="text-heading-md font-semibold text-text-primary mb-2">
            Ni najdenih kontrol
          </h3>
          <p className="text-body text-text-secondary">
            Poskusite z drugačnimi iskalnimi kriteriji ali filtri.
          </p>
        </div>
      )}

      {/* Modal */}
      <SoAControlModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedControl(null)
        }}
        onSave={handleModalSuccess}
        control={selectedControl}
        organizationId={userProfile?.organization_id}
        mode={modalMode}
      />
    </div>
  )
}