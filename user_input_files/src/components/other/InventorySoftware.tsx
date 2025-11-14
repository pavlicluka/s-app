import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Package, Plus, Eye, X, Edit, Trash2, Download, AlertTriangle } from 'lucide-react'
import InventorySoftwareAddModal from '../modals/InventorySoftwareAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import Modal from '../common/Modal'

export default function InventorySoftware() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSoftware, setSelectedSoftware] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSoftware, setEditingSoftware] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    software_id: '',
    software_name: '',
    vendor: '',
    version: '',
    license_type: 'subscription',
    category: '',
    total_licenses: 0,
    licenses_in_use: 0,
    cost_per_license: 0,
    purchase_date: '',
    renewal_date: '',
    support_expiry: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<'all' | 'perpetual' | 'subscription' | 'trial' | 'open_source' | 'freeware'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_software')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = useCallback(() => {
    let filtered = [...records]

    if (licenseTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.license_type === licenseTypeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.software_name?.toLowerCase().includes(query) ||
        r.vendor?.toLowerCase().includes(query) ||
        r.software_id?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query)
      )
    }

    setFilteredRecords(filtered)
  }, [records, licenseTypeFilter, categoryFilter, searchQuery])

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, licenseTypeFilter, categoryFilter, searchQuery, filterRecords])

  // Get unique categories from records
  const getCategories = () => {
    const categories = new Set(records.map(r => r.category).filter(Boolean))
    return Array.from(categories).sort()
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (software: any) => {
    setSelectedSoftware(software)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedSoftware(null)
  }

  const handleOpenEditModal = (software: any) => {
    setEditingSoftware(software)
    setEditFormData({
      software_id: software.software_id || '',
      software_name: software.software_name || '',
      vendor: software.vendor || '',
      version: software.version || '',
      license_type: software.license_type || 'subscription',
      category: software.category || '',
      total_licenses: software.total_licenses || 0,
      licenses_in_use: software.licenses_in_use || 0,
      cost_per_license: software.cost_per_license || 0,
      purchase_date: software.purchase_date ? new Date(software.purchase_date).toISOString().split('T')[0] : '',
      renewal_date: software.renewal_date ? new Date(software.renewal_date).toISOString().split('T')[0] : '',
      support_expiry: software.support_expiry ? new Date(software.support_expiry).toISOString().split('T')[0] : '',
      notes: software.notes || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSoftware) return

    setSaving(true)
    try {
      const updateData: any = {
        software_id: editFormData.software_id,
        software_name: editFormData.software_name,
        vendor: editFormData.vendor,
        version: editFormData.version,
        license_type: editFormData.license_type,
        category: editFormData.category,
        total_licenses: editFormData.total_licenses,
        licenses_in_use: editFormData.licenses_in_use,
        cost_per_license: editFormData.cost_per_license,
        notes: editFormData.notes
      }

      if (editFormData.purchase_date) updateData.purchase_date = editFormData.purchase_date
      if (editFormData.renewal_date) updateData.renewal_date = editFormData.renewal_date
      if (editFormData.support_expiry) updateData.support_expiry = editFormData.support_expiry

      const { error } = await supabase
        .from('inventory_software')
        .update(updateData)
        .eq('id', editingSoftware.id)

      if (error) throw error

      await handleSave()
      setIsEditModalOpen(false)
      setEditingSoftware(null)
    } catch (error) {
      console.error('Error updating software:', error)
      alert('Napaka pri posodabljanju programske opreme')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (software: any) => {
    setEditingSoftware(software)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingSoftware) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('inventory_software')
        .delete()
        .eq('id', editingSoftware.id)

      if (error) throw error

      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingSoftware(null)
    } catch (error) {
      console.error('Error deleting software:', error)
      alert('Napaka pri brisanju programske opreme')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Software ID', 'Software Name', 'Vendor', 'Version', 'License Type', 'Category', 'Total Licenses', 'In Use', 'Cost Per License', 'Purchase Date', 'Renewal Date', 'Support Expiry', 'Notes', 'Created At']

    const rows = filteredRecords.map(record => [
      record.software_id,
      record.software_name,
      record.vendor || '-',
      record.version || '-',
      record.license_type,
      record.category || '-',
      record.total_licenses || 0,
      record.licenses_in_use || 0,
      record.cost_per_license ? `€${record.cost_per_license.toFixed(2)}` : '-',
      record.purchase_date ? new Date(record.purchase_date).toLocaleDateString('sl-SI') : '-',
      record.renewal_date ? new Date(record.renewal_date).toLocaleDateString('sl-SI') : '-',
      record.support_expiry ? new Date(record.support_expiry).toLocaleDateString('sl-SI') : '-',
      record.notes || '-',
      new Date(record.created_at).toLocaleString('sl-SI')
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(';'))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Inventory_Software_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const getLicenseTypeBadge = (licenseType: string) => {
    const badges: Record<string, string> = {
      'perpetual': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'subscription': 'bg-green-500/20 text-green-400 border-green-500/30',
      'trial': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'open_source': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'freeware': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return badges[licenseType] || badges['subscription']
  }

  const getCategoryBadge = (category: string) => {
    return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  }

  const calculateUsagePercentage = (inUse: number, total: number) => {
    if (!total || total === 0) return 0
    return Math.round((inUse / total) * 100)
  }

  const isRenewalSoon = (renewalDate: string | null) => {
    if (!renewalDate) return false
    const renewal = new Date(renewalDate)
    const now = new Date()
    const daysUntilRenewal = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilRenewal <= 30 && daysUntilRenewal >= 0
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('modules.inventorySoftware.title')}</h1>
            <p className="text-body-sm text-text-secondary">Upravljanje licenc in programov</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-body-sm font-medium">Izvozi CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('modules.inventorySoftware.addSoftware')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-body-sm text-text-secondary self-center mr-2">Tip licence:</span>
          {(['all', 'perpetual', 'subscription', 'trial', 'open_source', 'freeware'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setLicenseTypeFilter(filter)}
              className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors duration-150
                ${licenseTypeFilter === filter
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover border border-border-subtle'
                }`}
            >
              {filter === 'all' ? t('modules.inventoryLicenses.filters.all') : t(`modules.inventorySoftware.licenseTypeOptions.${filter}`)}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-sm text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">Vse kategorije</option>
            {getCategories().map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder={t('modules.inventorySoftware.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-bg-surface border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Software ID</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Naziv</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Proizvajalec</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Verzija</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip licence</th>
                <th className="text-right px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Skupaj</th>
                <th className="text-right px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">V uporabi</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Uporaba</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Podaljšanje</th>
                <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => {
                const usagePercent = calculateUsagePercentage(record.licenses_in_use, record.total_licenses)
                const renewalSoon = isRenewalSoon(record.renewal_date)
                
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 text-body text-text-primary font-mono">{record.software_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-body text-text-primary font-bold">{record.software_name}</div>
                      {record.category && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-caption font-medium border ${getCategoryBadge(record.category)}`}>
                          {record.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.vendor || '-'}</td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.version || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getLicenseTypeBadge(record.license_type)}`}>
                        {record.license_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary text-right">{record.total_licenses || 0}</td>
                    <td className="px-6 py-4 text-body text-text-secondary text-right">{record.licenses_in_use || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              usagePercent >= 90 ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-caption font-medium ${
                          usagePercent >= 90 ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {usagePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.renewal_date ? (
                        <div className="flex items-center gap-2">
                          {renewalSoon && (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={`text-body ${renewalSoon ? 'text-yellow-400 font-medium' : 'text-text-secondary'}`}>
                            {new Date(record.renewal_date).toLocaleDateString('sl-SI')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-body text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                          title="Podrobnosti programske opreme"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title="Uredi programsko opremo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                          title="Izbriši programsko opremo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            Ni najdene programske opreme
          </div>
        )}
      </div>

      {/* Add Modal */}
      <InventorySoftwareAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* Edit Modal */}
      {isEditModalOpen && editingSoftware && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi programsko opremo">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="software_id" className="block text-sm font-medium text-text-secondary mb-2">
                  ID programske opreme <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="software_id"
                  value={editFormData.software_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, software_id: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="software_name" className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="software_name"
                  value={editFormData.software_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, software_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-text-secondary mb-2">
                  Proizvajalec
                </label>
                <input
                  type="text"
                  id="vendor"
                  value={editFormData.vendor}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-text-secondary mb-2">
                  Verzija
                </label>
                <input
                  type="text"
                  id="version"
                  value={editFormData.version}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="license_type" className="block text-sm font-medium text-text-secondary mb-2">
                  Tip licence <span className="text-status-error">*</span>
                </label>
                <select
                  id="license_type"
                  value={editFormData.license_type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, license_type: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="perpetual">{t('modules.inventorySoftware.licenseTypeOptions.perpetual')}</option>
                  <option value="subscription">{t('modules.inventorySoftware.licenseTypeOptions.subscription')}</option>
                  <option value="trial">{t('modules.inventorySoftware.licenseTypeOptions.trial')}</option>
                  <option value="open_source">{t('modules.inventorySoftware.licenseTypeOptions.open_source')}</option>
                  <option value="freeware">{t('modules.inventorySoftware.licenseTypeOptions.freeware')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  Kategorija
                </label>
                <input
                  type="text"
                  id="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="total_licenses" className="block text-sm font-medium text-text-secondary mb-2">
                  Skupaj licenc <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="total_licenses"
                  value={editFormData.total_licenses}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, total_licenses: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="licenses_in_use" className="block text-sm font-medium text-text-secondary mb-2">
                  V uporabi <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="licenses_in_use"
                  value={editFormData.licenses_in_use}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, licenses_in_use: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="cost_per_license" className="block text-sm font-medium text-text-secondary mb-2">
                  Cena na licenco (€)
                </label>
                <input
                  type="number"
                  id="cost_per_license"
                  value={editFormData.cost_per_license}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, cost_per_license: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-text-secondary mb-2">
                  Datum nakupa
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  value={editFormData.purchase_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="renewal_date" className="block text-sm font-medium text-text-secondary mb-2">
                  Datum podaljšanja
                </label>
                <input
                  type="date"
                  id="renewal_date"
                  value={editFormData.renewal_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, renewal_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="support_expiry" className="block text-sm font-medium text-text-secondary mb-2">
                  Podpora do
                </label>
                <input
                  type="date"
                  id="support_expiry"
                  value={editFormData.support_expiry}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, support_expiry: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-2">
                  Opombe
                </label>
                <textarea
                  id="notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
              >
                Prekliči
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? t('forms.saving') : t('forms.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Izbriši programsko opremo"
        message={`Ali ste prepričani, da želite izbrisati programsko opremo "${editingSoftware?.software_name}"? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedSoftware && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetailModal() }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSoftware.software_name}</h2>
                <p className="text-sm text-gray-400 mt-1">Podrobnosti programske opreme</p>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLicenseTypeBadge(selectedSoftware.license_type)}`}>
                  {selectedSoftware.license_type}
                </span>
                {selectedSoftware.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryBadge(selectedSoftware.category)}`}>
                    {selectedSoftware.category}
                  </span>
                )}
                {isRenewalSoon(selectedSoftware.renewal_date) && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Podaljšanje kmalu
                  </span>
                )}
              </div>

              {/* License Usage */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Uporaba licenc</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-white mb-2">
                      <span>{selectedSoftware.licenses_in_use || 0} / {selectedSoftware.total_licenses || 0}</span>
                      <span className="font-medium">{calculateUsagePercentage(selectedSoftware.licenses_in_use, selectedSoftware.total_licenses)}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          calculateUsagePercentage(selectedSoftware.licenses_in_use, selectedSoftware.total_licenses) >= 90 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(calculateUsagePercentage(selectedSoftware.licenses_in_use, selectedSoftware.total_licenses), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Software ID</div>
                  <div className="text-sm text-white font-mono">{selectedSoftware.software_id}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Proizvajalec</div>
                  <div className="text-sm text-white">{selectedSoftware.vendor || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Verzija</div>
                  <div className="text-sm text-white">{selectedSoftware.version || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Cena na licenco</div>
                  <div className="text-sm text-white font-medium">
                    {selectedSoftware.cost_per_license ? `€${selectedSoftware.cost_per_license.toFixed(2)}` : '-'}
                  </div>
                </div>
                {selectedSoftware.purchase_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum nakupa</div>
                    <div className="text-sm text-white">{new Date(selectedSoftware.purchase_date).toLocaleDateString('sl-SI')}</div>
                  </div>
                )}
                {selectedSoftware.renewal_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum podaljšanja</div>
                    <div className={`text-sm font-medium ${isRenewalSoon(selectedSoftware.renewal_date) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(selectedSoftware.renewal_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
                {selectedSoftware.support_expiry && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Podpora do</div>
                    <div className="text-sm text-white">{new Date(selectedSoftware.support_expiry).toLocaleDateString('sl-SI')}</div>
                  </div>
                )}
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Skupni stroški</div>
                  <div className="text-sm text-white font-bold">
                    {selectedSoftware.cost_per_license && selectedSoftware.total_licenses 
                      ? `€${(selectedSoftware.cost_per_license * selectedSoftware.total_licenses).toFixed(2)}`
                      : '-'
                    }
                  </div>
                </div>
              </div>

              {selectedSoftware.notes && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Opombe</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedSoftware.notes}</div>
                </div>
              )}

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">UUID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedSoftware.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">{new Date(selectedSoftware.created_at).toLocaleString('sl-SI')}</div>
                  </div>
                  {selectedSoftware.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">{new Date(selectedSoftware.updated_at).toLocaleString('sl-SI')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700/50 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Zapri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
