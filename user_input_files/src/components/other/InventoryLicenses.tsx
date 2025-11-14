import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Key, Plus, Eye, X, Edit, Trash2, Download, AlertTriangle, Copy, Check } from 'lucide-react'
import InventoryLicensesAddModal from '../modals/InventoryLicensesAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import Modal from '../common/Modal'

export default function InventoryLicenses() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    license_key: '',
    software_name: '',
    license_type: 'subscription',
    seats: 0,
    seats_used: 0,
    assigned_to: '',
    purchase_date: '',
    expiry_date: '',
    renewal_cost: 0,
    status: 'active',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'expiring_soon'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, statusFilter, searchQuery])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_licenses')
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

  const filterRecords = () => {
    let filtered = [...records]

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (statusFilter === 'active') {
      filtered = filtered.filter(r => r.status === 'active')
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(r => r.status === 'expired' || (r.expiry_date && new Date(r.expiry_date) < now))
    } else if (statusFilter === 'expiring_soon') {
      filtered = filtered.filter(r => 
        r.expiry_date && 
        new Date(r.expiry_date) >= now && 
        new Date(r.expiry_date) <= thirtyDaysFromNow
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.software_name?.toLowerCase().includes(query) ||
        r.license_key?.toLowerCase().includes(query) ||
        r.assigned_to?.toLowerCase().includes(query) ||
        r.license_type?.toLowerCase().includes(query)
      )
    }

    setFilteredRecords(filtered)
  }

  const maskLicenseKey = (key: string) => {
    if (!key) return '-'
    if (key.length <= 4) return key
    return `${'*'.repeat(key.length - 4)}${key.slice(-4)}`
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (license: any) => {
    setSelectedLicense(license)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedLicense(null)
  }

  const handleOpenEditModal = (license: any) => {
    setEditingLicense(license)
    setEditFormData({
      license_key: license.license_key || '',
      software_name: license.software_name || '',
      license_type: license.license_type || 'subscription',
      seats: license.seats || 0,
      seats_used: license.seats_used || 0,
      assigned_to: license.assigned_to || '',
      purchase_date: license.purchase_date ? new Date(license.purchase_date).toISOString().split('T')[0] : '',
      expiry_date: license.expiry_date ? new Date(license.expiry_date).toISOString().split('T')[0] : '',
      renewal_cost: license.renewal_cost || 0,
      status: license.status || 'active',
      notes: license.notes || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLicense) return

    setSaving(true)
    try {
      const updateData: any = {
        license_key: editFormData.license_key,
        software_name: editFormData.software_name,
        license_type: editFormData.license_type,
        seats: editFormData.seats,
        seats_used: editFormData.seats_used,
        assigned_to: editFormData.assigned_to,
        renewal_cost: editFormData.renewal_cost,
        status: editFormData.status,
        notes: editFormData.notes
      }

      if (editFormData.purchase_date) updateData.purchase_date = editFormData.purchase_date
      if (editFormData.expiry_date) updateData.expiry_date = editFormData.expiry_date

      const { error } = await supabase
        .from('inventory_licenses')
        .update(updateData)
        .eq('id', editingLicense.id)

      if (error) throw error

      await handleSave()
      setIsEditModalOpen(false)
      setEditingLicense(null)
    } catch (error) {
      console.error('Error updating license:', error)
      alert('Napaka pri posodabljanju licence')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (license: any) => {
    setEditingLicense(license)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingLicense) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('inventory_licenses')
        .delete()
        .eq('id', editingLicense.id)

      if (error) throw error

      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingLicense(null)
    } catch (error) {
      console.error('Error deleting license:', error)
      alert('Napaka pri brisanju licence')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['License Key', 'Software Name', 'License Type', 'Seats', 'Seats Used', 'Assigned To', 'Purchase Date', 'Expiry Date', 'Renewal Cost', 'Status', 'Notes', 'Created At']

    const rows = filteredRecords.map(record => [
      record.license_key,
      record.software_name,
      record.license_type,
      record.seats || 0,
      record.seats_used || 0,
      record.assigned_to || '-',
      record.purchase_date ? new Date(record.purchase_date).toLocaleDateString('sl-SI') : '-',
      record.expiry_date ? new Date(record.expiry_date).toLocaleDateString('sl-SI') : '-',
      record.renewal_cost ? `€${record.renewal_cost.toFixed(2)}` : '-',
      record.status,
      record.notes || '-',
      new Date(record.created_at).toLocaleString('sl-SI')
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(';'))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Inventory_Licenses_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const getStatusBadge = (status: string, expiryDate?: string) => {
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    
    const badges: Record<string, string> = {
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'expired': 'bg-red-500/20 text-red-400 border-red-500/30',
      'suspended': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return badges[status] || badges['active']
  }

  const getLicenseTypeBadge = (licenseType: string) => {
    const badges: Record<string, string> = {
      'perpetual': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'subscription': 'bg-green-500/20 text-green-400 border-green-500/30',
      'trial': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return badges[licenseType] || badges['subscription']
  }

  const calculateSeatsPercentage = (used: number, total: number) => {
    if (!total || total === 0) return 0
    return Math.round((used / total) * 100)
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Licence</h1>
            <p className="text-body-sm text-text-secondary">Upravljanje licenčnih ključev</p>
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
            <span className="text-body-sm font-medium">Nova licenca</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {(['all', 'active', 'expired', 'expiring_soon'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors duration-150
                ${statusFilter === filter
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover border border-border-subtle'
                }`}
            >
              {t(`modules.inventoryLicenses.filters.${filter === 'expiring_soon' ? 'expiringSoon' : filter}`)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Iskanje po programu, ključu, dodeljeno..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-bg-surface border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Licenčni ključ</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Program</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip</th>
                <th className="text-right px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Sedeži</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Uporaba</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dodeljeno</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Poteče</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
                <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.map((record) => {
                const seatsPercent = calculateSeatsPercentage(record.seats_used, record.seats)
                const expiringSoon = isExpiringSoon(record.expiry_date)
                
                return (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-body text-text-primary font-mono">{maskLicenseKey(record.license_key)}</span>
                        <button
                          onClick={() => copyToClipboard(record.license_key, record.id)}
                          className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                          title="Kopiraj celoten ključ"
                        >
                          {copiedKey === record.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-body text-text-primary font-medium">{record.software_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getLicenseTypeBadge(record.license_type)}`}>
                        {record.license_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary text-right">
                      {record.seats_used || 0} / {record.seats || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden w-24">
                          <div
                            className={`h-full transition-all duration-300 ${
                              seatsPercent >= 90 ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(seatsPercent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-caption font-medium ${
                          seatsPercent >= 90 ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {seatsPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body text-text-secondary">{record.assigned_to || '-'}</td>
                    <td className="px-6 py-4">
                      {record.expiry_date ? (
                        <div className="flex items-center gap-2">
                          {expiringSoon && (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={`text-body ${expiringSoon ? 'text-yellow-400 font-medium' : 'text-text-secondary'}`}>
                            {new Date(record.expiry_date).toLocaleDateString('sl-SI')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-body text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusBadge(record.status, record.expiry_date)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                          title="Podrobnosti licence"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title="Uredi licenco"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(record)}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                          title="Izbriši licenco"
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
            Ni najdenih licenc
          </div>
        )}
      </div>

      {/* Add Modal */}
      <InventoryLicensesAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* Edit Modal */}
      {isEditModalOpen && editingLicense && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi licenco">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="license_key" className="block text-sm font-medium text-text-secondary mb-2">
                  Licenčni ključ <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="license_key"
                  value={editFormData.license_key}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, license_key: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="software_name" className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv programa <span className="text-status-error">*</span>
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
                  <option value="perpetual">Perpetual</option>
                  <option value="subscription">Subscription</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div>
                <label htmlFor="seats" className="block text-sm font-medium text-text-secondary mb-2">
                  Sedeži <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="seats"
                  value={editFormData.seats}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="seats_used" className="block text-sm font-medium text-text-secondary mb-2">
                  Uporabljeni sedeži <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="seats_used"
                  value={editFormData.seats_used}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, seats_used: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-text-secondary mb-2">
                  Dodeljeno
                </label>
                <input
                  type="text"
                  id="assigned_to"
                  value={editFormData.assigned_to}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
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
                <label htmlFor="expiry_date" className="block text-sm font-medium text-text-secondary mb-2">
                  Datum poteka
                </label>
                <input
                  type="date"
                  id="expiry_date"
                  value={editFormData.expiry_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="renewal_cost" className="block text-sm font-medium text-text-secondary mb-2">
                  Strošek podaljšanja (€)
                </label>
                <input
                  type="number"
                  id="renewal_cost"
                  value={editFormData.renewal_cost}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, renewal_cost: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                  Status <span className="text-status-error">*</span>
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
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
                {saving ? 'Shranjujem...' : 'Shrani'}
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
        title="Izbriši licenco"
        message={`Ali ste prepričani, da želite izbrisati licenco za "${editingLicense?.software_name}"? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedLicense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetailModal() }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedLicense.software_name}</h2>
                <p className="text-sm text-gray-400 mt-1">Podrobnosti licence</p>
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLicenseTypeBadge(selectedLicense.license_type)}`}>
                  {selectedLicense.license_type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedLicense.status, selectedLicense.expiry_date)}`}>
                  Status: {selectedLicense.status}
                </span>
                {isExpiringSoon(selectedLicense.expiry_date) && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Poteče kmalu
                  </span>
                )}
              </div>

              {/* License Key with Copy */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-2">Licenčni ključ</div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm text-white font-mono bg-gray-900/50 px-3 py-2 rounded border border-gray-600/30">
                    {selectedLicense.license_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedLicense.license_key, `detail-${selectedLicense.id}`)}
                    className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors flex items-center gap-2"
                  >
                    {copiedKey === `detail-${selectedLicense.id}` ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Kopirano</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Kopiraj</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Seats Usage */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Uporaba sedežev</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-white mb-2">
                      <span>{selectedLicense.seats_used || 0} / {selectedLicense.seats || 0}</span>
                      <span className="font-medium">{calculateSeatsPercentage(selectedLicense.seats_used, selectedLicense.seats)}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          calculateSeatsPercentage(selectedLicense.seats_used, selectedLicense.seats) >= 90 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(calculateSeatsPercentage(selectedLicense.seats_used, selectedLicense.seats), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Dodeljeno</div>
                  <div className="text-sm text-white">{selectedLicense.assigned_to || '-'}</div>
                </div>
                {selectedLicense.purchase_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum nakupa</div>
                    <div className="text-sm text-white">{new Date(selectedLicense.purchase_date).toLocaleDateString('sl-SI')}</div>
                  </div>
                )}
                {selectedLicense.expiry_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum poteka</div>
                    <div className={`text-sm font-medium ${isExpiringSoon(selectedLicense.expiry_date) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(selectedLicense.expiry_date).toLocaleDateString('sl-SI')}
                    </div>
                  </div>
                )}
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Strošek podaljšanja</div>
                  <div className="text-sm text-white font-medium">
                    {selectedLicense.renewal_cost ? `€${selectedLicense.renewal_cost.toFixed(2)}` : '-'}
                  </div>
                </div>
              </div>

              {selectedLicense.notes && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Opombe</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedLicense.notes}</div>
                </div>
              )}

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">UUID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedLicense.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">{new Date(selectedLicense.created_at).toLocaleString('sl-SI')}</div>
                  </div>
                  {selectedLicense.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">{new Date(selectedLicense.updated_at).toLocaleString('sl-SI')}</div>
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
