import { useEffect, useState } from 'react'
import { Plus, FileText, Search, Filter, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase, NIS2Documentation } from '../lib/supabase'
import DataTable from './DataTable'
import NIS2DocumentationModal from './modals/NIS2DocumentationModal'
import Badge from './Badge'

interface NIS2DocumentationPageProps {
  setCurrentPage: (page: string) => void
}

export default function NIS2DocumentationPage({ setCurrentPage }: NIS2DocumentationPageProps) {
  const { t } = useTranslation()
  const [documentation, setDocumentation] = useState<NIS2Documentation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDocumentation, setSelectedDocumentation] = useState<NIS2Documentation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    loadDocumentation()

    // Setup real-time subscription
    const channel = supabase
      .channel('documentation-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'nis2_documentation' }, 
        () => {
          loadDocumentation()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadDocumentation() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('nis2_documentation')
        .select('*')
        .order('created_at', { ascending: false })
      setDocumentation(data || [])
    } catch (error) {
      console.error('Error loading documentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedDocumentation(null)
    setShowModal(true)
  }

  const handleView = (doc: NIS2Documentation) => {
    setSelectedDocumentation(doc)
    setShowModal(true)
  }

  const handleEdit = (doc: NIS2Documentation) => {
    setSelectedDocumentation(doc)
    setShowModal(true)
  }

  const handleDelete = async (doc: NIS2Documentation) => {
    if (confirm(`Ali ste prepričani, da želite izbrisati dokument "${doc.title}"?`)) {
      try {
        // First delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('nis2-documents')
          .remove([doc.file_path])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
        }

        // Then delete the record from database
        const { error: dbError } = await supabase
          .from('nis2_documentation')
          .delete()
          .eq('id', doc.id)

        if (dbError) {
          console.error('Error deleting documentation record:', dbError)
          alert('Napaka pri brisanju dokumenta.')
        } else {
          // Reload the data
          loadDocumentation()
          alert('Dokument je bil uspešno izbrisan.')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Prišlo je do napake pri brisanju dokumenta.')
      }
    }
  }

  const handleDownload = async (doc: NIS2Documentation) => {
    try {
      const { data, error } = await supabase.storage
        .from('nis2-documents')
        .download(doc.file_path)

      if (error) {
        console.error('Error downloading file:', error)
        alert('Napaka pri prenosu datoteke.')
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error:', error)
      alert('Prišlo je do napake pri prenosu datoteke.')
    }
  }

  // Filter and search logic
  const filteredDocumentation = documentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || doc.category === filterCategory
    const matchesStatus = !filterStatus || doc.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = [...new Set(documentation.map(doc => doc.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  const stats = {
    total: documentation.length,
    active: documentation.filter(d => d.status === 'active').length,
    draft: documentation.filter(d => d.status === 'draft').length,
    archived: documentation.filter(d => d.status === 'archived').length,
    confidential: documentation.filter(d => d.is_confidential).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('navigation.nis2')} {t('nis2Documentation.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('nis2Documentation.description')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('nis2Documentation.addDocument')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">{t('nis2Documentation.stats.totalDocuments')}</div>
          <div className="text-display-lg font-bold text-text-primary">{stats.total}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">{t('nis2Documentation.stats.active')}</div>
          <div className="text-display-lg font-bold text-risk-low">{stats.active}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">{t('nis2Documentation.stats.drafts')}</div>
          <div className="text-display-lg font-bold text-risk-medium">{stats.draft}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">{t('nis2Documentation.stats.archived')}</div>
          <div className="text-display-lg font-bold text-text-tertiary">{stats.archived}</div>
        </div>
        <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
          <div className="text-caption text-text-secondary mb-2">{t('nis2Documentation.stats.confidential')}</div>
          <div className="text-display-lg font-bold text-risk-high">{stats.confidential}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder={t('nis2Documentation.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">{t('nis2Documentation.filters.allCategories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
          >
            <option value="">{t('nis2Documentation.filters.allStatuses')}</option>
            <option value="draft">{t('nis2Documentation.filters.draft')}</option>
            <option value="active">{t('nis2Documentation.filters.active')}</option>
            <option value="archived">{t('nis2Documentation.filters.archived')}</option>
          </select>
        </div>
      </div>

      {/* Documentation Table */}
      <DataTable
        title={`Dokumenti (${filteredDocumentation.length})`}
        columns={[
          { 
            key: 'title', 
            header: 'Naslov',
            render: (item) => (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-text-tertiary" />
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
            key: 'document_type', 
            header: 'Tip',
            render: (item) => (
              <Badge 
                type="status" 
                value={item.document_type.toUpperCase()} 
              />
            )
          },
          { 
            key: 'category', 
            header: 'Kategorija',
            render: (item) => (
              <span className="text-text-secondary">
                {item.category || '-'}
              </span>
            )
          },
          { 
            key: 'file_size', 
            header: 'Velikost',
            render: (item) => {
              const sizeInMB = (item.file_size / (1024 * 1024)).toFixed(2)
              return `${sizeInMB} MB`
            }
          },
          { 
            key: 'status', 
            header: 'Status',
            render: (item) => {
              const statusConfig = {
                draft: { color: 'text-risk-medium', label: 'Osnutek' },
                active: { color: 'text-risk-low', label: 'Aktiven' },
                archived: { color: 'text-text-tertiary', label: 'Arhiviran' }
              }
              const config = statusConfig[item.status as keyof typeof statusConfig]
              return <span className={config.color}>{config.label}</span>
            }
          },
          { 
            key: 'is_confidential', 
            header: 'Zaupnost',
            render: (item) => (
              <span className={item.is_confidential ? 'text-risk-high font-medium' : 'text-text-tertiary'}>
                {item.is_confidential ? 'Zaupno' : 'Javno'}
              </span>
            )
          },
          { 
            key: 'created_at', 
            header: 'Naloženo',
            render: (item) => new Date(item.created_at).toLocaleDateString('sl-SI')
          }
        ]}
        data={filteredDocumentation}
        onViewItem={handleView}
        onEditItem={handleEdit}
        onDeleteItem={handleDelete}
        customActions={(item: NIS2Documentation) => (
          <button
            onClick={() => handleDownload(item)}
            className="h-8 w-8 p-0 text-green-600 border border-green-600 rounded-sm
                       hover:bg-green-600 hover:text-white transition-all duration-200 flex items-center justify-center"
            title={t('common.export')}
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      />

      {/* Documentation Modal */}
      <NIS2DocumentationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedDocumentation(null)
        }}
        documentation={selectedDocumentation}
        onSuccess={() => {
          loadDocumentation()
          setShowModal(false)
          setSelectedDocumentation(null)
        }}
      />
    </div>
  )
}