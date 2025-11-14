import { useEffect, useState } from 'react'
import { Plus, Shield, Search, Filter, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase, NIS2Control } from '../lib/supabase'
import DataTable from './DataTable'
import NIS2ControlsModal from './modals/NIS2ControlsModal'
import Badge from './Badge'

interface NIS2ControlsPageProps {
  setCurrentPage: (page: string) => void
}

export default function NIS2ControlsPage({ setCurrentPage }: NIS2ControlsPageProps) {
  const [controls, setControls] = useState<NIS2Control[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedControl, setSelectedControl] = useState<NIS2Control | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    loadControls()

    // Setup real-time subscription
    const channel = supabase
      .channel('controls-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'nis2_controls' }, 
        () => {
          loadControls()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadControls() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('nis2_controls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setControls(data || [])
    } catch (error) {
      console.error('Error loading controls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedControl(null)
    setShowModal(true)
  }

  const handleView = (control: NIS2Control) => {
    setSelectedControl(control)
    setShowModal(true)
  }

  const handleDelete = async (control: NIS2Control) => {
    if (confirm(`Ali ste prepričani, da želite izbrisati kontrolo "${control.title}"?`)) {
      try {
        const { error } = await supabase
          .from('nis2_controls')
          .update({ is_active: false })
          .eq('id', control.id)

        if (error) {
          console.error('Error deactivating control:', error)
          alert('Napaka pri brisanju kontrole.')
        } else {
          loadControls()
          alert('Kontrola je bila uspešno izbrisana.')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Prišlo je do napake pri brisanju kontrole.')
      }
    }
  }

  // Filter and search logic
  const filteredControls = controls.filter(control => {
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.owner?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || control.control_type === filterType
    const matchesCategory = !filterCategory || control.control_category === filterCategory
    const matchesStatus = !filterStatus || control.status === filterStatus
    const matchesPriority = !filterPriority || control.priority === filterPriority

    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPriority
  })

  // Get unique values for filters
  const controlTypes = [...new Set(controls.map(c => c.control_type))]
  const controlCategories = [...new Set(controls.map(c => c.control_category))]
  const controlStatuses = [...new Set(controls.map(c => c.status))]
  const controlPriorities = [...new Set(controls.map(c => c.priority))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  const stats = {
    total: controls.length,
    preventive: controls.filter(c => c.control_type === 'preventive').length,
    corrective: controls.filter(c => c.control_type === 'corrective').length,
    detective: controls.filter(c => c.control_type === 'detective').length,
    responsive: controls.filter(c => c.control_type === 'responsive').length,
    implemented: controls.filter(c => c.status === 'implemented').length,
    inProgress: controls.filter(c => c.status === 'in_progress').length,
    planned: controls.filter(c => c.status === 'planned').length,
    highPriority: controls.filter(c => c.priority === 'high').length,
    effective: controls.filter(c => c.compliance_status === 'compliant').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-risk-low" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-risk-medium" />
      case 'planned':
        return <AlertCircle className="w-4 h-4 text-risk-medium" />
      case 'deprecated':
        return <XCircle className="w-4 h-4 text-risk-high" />
      default:
        return <Shield className="w-4 h-4 text-text-tertiary" />
    }
  }

  const getControlTypeLabel = (type: string) => {
    const labels = {
      preventive: 'Preventivni',
      corrective: 'Korektivni',
      detective: 'Detektivni',
      responsive: 'Odzivni'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getControlCategoryLabel = (category: string) => {
    const labels = {
      technical: 'Tehnični',
      organizational: 'Organizacijski',
      physical: 'Fizični',
      legal: 'Pravni'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      planned: 'Načrtovan',
      in_progress: 'V izvedbi',
      implemented: 'Implementiran',
      verified: 'Preverjen',
      maintenance: 'Vzdrževanje',
      deprecated: 'Opuščen'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: 'Visoka',
      medium: 'Srednja',
      low: 'Nizka'
    }
    return labels[priority as keyof typeof labels] || priority
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Evidentiranje kontrol in ukrepov
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje varnostnih kontrol in ukrepov v skladu z NIS2 direktivo
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Dodaj kontrolo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Skupno kontrol</div>
          <div className="text-display-lg font-bold text-text-primary">{stats.total}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Preventivne</div>
          <div className="text-display-lg font-bold text-risk-low">{stats.preventive}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Korektivne</div>
          <div className="text-display-lg font-bold text-accent-primary">{stats.corrective}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Implementirane</div>
          <div className="text-display-lg font-bold text-risk-low">{stats.implemented}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">V izvedbi</div>
          <div className="text-display-lg font-bold text-risk-medium">{stats.inProgress}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">Visoka prioriteta</div>
          <div className="text-display-lg font-bold text-risk-high">{stats.highPriority}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Išči po naslovu, opisu ali odgovorni osebi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">Vsi tipi</option>
            {controlTypes.map(type => (
              <option key={type} value={type}>{getControlTypeLabel(type)}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">Vse kategorije</option>
            {controlCategories.map(category => (
              <option key={category} value={category}>{getControlCategoryLabel(category)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">Vsi statusi</option>
            {controlStatuses.map(status => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">Vse prioritete</option>
            {controlPriorities.map(priority => (
              <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls Table */}
      <DataTable
        title={`Kontrolni ukrepi (${filteredControls.length})`}
        columns={[
          { 
            key: 'title', 
            header: 'Naziv kontrole',
            render: (item) => (
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <div className="font-medium text-text-primary">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-text-tertiary truncate max-w-xs">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            )
          },
          { 
            key: 'control_type', 
            header: 'Tip',
            render: (item) => (
              <span className="text-accent-primary font-medium">
                {getControlTypeLabel(item.control_type)}
              </span>
            )
          },
          { 
            key: 'control_category', 
            header: 'Kategorija',
            render: (item) => (
              <span className="text-text-secondary">
                {getControlCategoryLabel(item.control_category)}
              </span>
            )
          },
          { 
            key: 'priority', 
            header: 'Prioriteta',
            render: (item) => {
              const priorityColors = {
                high: 'text-risk-high',
                medium: 'text-risk-medium',
                low: 'text-risk-low'
              }
              return (
                <span className={priorityColors[item.priority as keyof typeof priorityColors]}>
                  {getPriorityLabel(item.priority)}
                </span>
              )
            }
          },
          { 
            key: 'status', 
            header: 'Status',
            render: (item) => (
              <Badge 
                type="status" 
                value={getStatusLabel(item.status)} 
              />
            )
          },
          { 
            key: 'responsible_person', 
            header: 'Odgovorna oseba',
            render: (item) => (
              <div className="text-text-primary">{item.owner}</div>
            )
          },
          { 
            key: 'implementation_date', 
            header: 'Implementacija',
            render: (item) => (
              <span className="text-text-secondary">
                {item.implementation_date ? new Date(item.implementation_date).toLocaleDateString('sl-SI') : '-'}
              </span>
            )
          },
          { 
            key: 'effectiveness_rating', 
            header: 'Skladnost',
            render: (item) => {
              const complianceColors = {
                compliant: 'text-status-success',
                partially_compliant: 'text-risk-medium',
                non_compliant: 'text-status-error',
                not_assessed: 'text-text-tertiary'
              }
              const complianceLabels = {
                compliant: 'Skladno',
                partially_compliant: 'Delno skladno',
                non_compliant: 'Neskladno',
                not_assessed: 'Ne ocenjeno'
              }
              return (
                <span className={complianceColors[item.compliance_status as keyof typeof complianceColors]}>
                  {complianceLabels[item.compliance_status as keyof typeof complianceLabels] || '-'}
                </span>
              )
            }
          }
        ]}
        data={filteredControls}
        onViewItem={handleView}
        onDeleteItem={handleDelete}
      />

      {/* Controls Modal */}
      <NIS2ControlsModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedControl(null)
        }}
        control={selectedControl}
        onSuccess={() => {
          loadControls()
          setShowModal(false)
          setSelectedControl(null)
        }}
      />
    </div>
  )
}