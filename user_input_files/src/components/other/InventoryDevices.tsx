import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Monitor, Plus, Eye, X, Edit, Trash2, Download, Filter } from 'lucide-react'
import InventoryDevicesAddModal from '../modals/InventoryDevicesAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import Modal from '../common/Modal'

export default function InventoryDevices() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    device_id: '',
    device_name: '',
    device_type: 'server',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    department: '',
    assigned_to: '',
    purchase_date: '',
    warranty_expiry: '',
    status: 'active',
    condition: 'good',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'retired'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, statusFilter, searchQuery])

  const fetchRecords = async () => {
    try {
      // Demo podatki - fallback, če je baza podatkov prazna
      // Ti podatki se uporabijo samo, če ni najdenih zapisov v tabeli inventory_devices
      const { data, error } = await supabase
        .from('inventory_devices')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      
      // Če ni podatkov v bazi, uporabi demo zapise kot fallback
      if (!data || data.length === 0) {
        const demoDevices = [
          {
            id: 'demo-1',
            device_id: 'SRV-001',
            device_name: 'Glavni strežnik SRV-001',
            device_type: 'server',
            manufacturer: 'Dell Technologies',
            model: 'PowerEdge R740',
            serial_number: 'SRV001234567',
            location: 'Podatkovni center A',
            department: 'IT oddelek',
            assigned_to: 'Janez Novak',
            purchase_date: '2023-03-15',
            warranty_expiry: '2026-03-15',
            status: 'active',
            condition: 'excellent',
            notes: 'Produkcijski strežnik za ključne aplikacije',
            created_at: '2023-03-15T10:00:00Z',
            updated_at: '2024-11-01T14:30:00Z'
          },
          {
            id: 'demo-2',
            device_id: 'LAP-123',
            device_name: 'Prenosni računalnik LAP-123',
            device_type: 'laptop',
            manufacturer: 'Lenovo',
            model: 'ThinkPad T14',
            serial_number: 'LAP123456789',
            location: 'Pisarna 201',
            department: 'Razvoj',
            assigned_to: 'Ana Kovač',
            purchase_date: '2024-01-10',
            warranty_expiry: '2026-01-10',
            status: 'active',
            condition: 'good',
            notes: 'Uporablja se za razvoj programske opreme',
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-11-05T11:15:00Z'
          },
          {
            id: 'demo-3',
            device_id: 'PRT-456',
            device_name: 'Barvni tiskalnik PRT-456',
            device_type: 'printer',
            manufacturer: 'HP',
            model: 'LaserJet Pro 400',
            serial_number: 'PRT456789123',
            location: 'Pisarna 105',
            department: 'Administracija',
            assigned_to: 'Marjeta Horvat',
            purchase_date: '2022-11-20',
            warranty_expiry: '2025-11-20',
            status: 'maintenance',
            condition: 'fair',
            notes: 'Potrebna menjava tonerja, načrtovano vzdrževanje',
            created_at: '2022-11-20T13:00:00Z',
            updated_at: '2024-11-08T16:20:00Z'
          },
          {
            id: 'demo-4',
            device_id: 'TAB-789',
            device_name: 'Tablica TAB-789',
            device_type: 'tablet',
            manufacturer: 'Apple',
            model: 'iPad Pro 12.9"',
            serial_number: 'TAB789456123',
            location: 'Skladišče',
            department: 'Prodaja',
            assigned_to: 'Peter Pavlin',
            purchase_date: '2024-06-15',
            warranty_expiry: '2025-06-15',
            status: 'inactive',
            condition: 'excellent',
            notes: 'Rezervna naprava, ni v uporabi',
            created_at: '2024-06-15T10:30:00Z',
            updated_at: '2024-11-02T08:45:00Z'
          },
          {
            id: 'demo-5',
            device_id: 'MOB-321',
            device_name: 'Mobilni telefon MOB-321',
            device_type: 'mobile',
            manufacturer: 'Samsung',
            model: 'Galaxy S24',
            serial_number: 'MOB321789456',
            location: 'Direktorjeva pisarna',
            department: 'Vodstvo',
            assigned_to: 'Direktor Janez',
            purchase_date: '2024-02-28',
            warranty_expiry: '2026-02-28',
            status: 'active',
            condition: 'excellent',
            notes: 'Poslovni telefon direktorja',
            created_at: '2024-02-28T14:00:00Z',
            updated_at: '2024-11-07T10:10:00Z'
          }
        ]
        setRecords(demoDevices)
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error:', error)
      // Če je napaka pri nalaganju iz baze, še vedno pokaži demo zapise
      const fallbackDevices = [
        {
          id: 'fallback-1',
          device_id: 'NET-555',
          device_name: 'Omrežno stikalo NET-555',
          device_type: 'network_device',
          manufacturer: 'Cisco',
          model: 'Catalyst 2960X',
          serial_number: 'NET555123789',
          location: 'IT omora',
          department: 'IT oddelek',
          assigned_to: 'IT ekipa',
          purchase_date: '2023-08-10',
          warranty_expiry: '2026-08-10',
          status: 'active',
          condition: 'good',
          notes: 'Glavno omrežno stikalo',
          created_at: '2023-08-10T11:00:00Z',
          updated_at: '2024-11-09T09:30:00Z'
        }
      ]
      setRecords(fallbackDevices)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.device_name?.toLowerCase().includes(query) ||
        r.manufacturer?.toLowerCase().includes(query) ||
        r.model?.toLowerCase().includes(query) ||
        r.device_id?.toLowerCase().includes(query)
      )
    }

    setFilteredRecords(filtered)
  }

  const handleSave = async () => {
    await fetchRecords()
  }

  const handleViewDetails = (device: any) => {
    setSelectedDevice(device)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedDevice(null)
  }

  const handleOpenEditModal = (device: any) => {
    setEditingDevice(device)
    setEditFormData({
      device_id: device.device_id || '',
      device_name: device.device_name || '',
      device_type: device.device_type || 'server',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      serial_number: device.serial_number || '',
      location: device.location || '',
      department: device.department || '',
      assigned_to: device.assigned_to || '',
      purchase_date: device.purchase_date ? new Date(device.purchase_date).toISOString().split('T')[0] : '',
      warranty_expiry: device.warranty_expiry ? new Date(device.warranty_expiry).toISOString().split('T')[0] : '',
      status: device.status || 'active',
      condition: device.condition || 'good',
      notes: device.notes || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDevice) return

    setSaving(true)
    try {
      const updateData: any = {
        device_id: editFormData.device_id,
        device_name: editFormData.device_name,
        device_type: editFormData.device_type,
        manufacturer: editFormData.manufacturer,
        model: editFormData.model,
        serial_number: editFormData.serial_number,
        location: editFormData.location,
        department: editFormData.department,
        assigned_to: editFormData.assigned_to,
        status: editFormData.status,
        condition: editFormData.condition,
        notes: editFormData.notes
      }

      if (editFormData.purchase_date) updateData.purchase_date = editFormData.purchase_date
      if (editFormData.warranty_expiry) updateData.warranty_expiry = editFormData.warranty_expiry

      const { error } = await supabase
        .from('inventory_devices')
        .update(updateData)
        .eq('id', editingDevice.id)

      if (error) throw error

      await handleSave()
      setIsEditModalOpen(false)
      setEditingDevice(null)
    } catch (error) {
      console.error('Error updating device:', error)
      alert('Napaka pri posodabljanju naprave')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (device: any) => {
    setEditingDevice(device)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingDevice) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('inventory_devices')
        .delete()
        .eq('id', editingDevice.id)

      if (error) throw error

      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingDevice(null)
    } catch (error) {
      console.error('Error deleting device:', error)
      alert('Napaka pri brisanju naprave')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Device ID', 'Device Name', 'Type', 'Manufacturer', 'Model', 'Serial Number', 'Location', 'Department', 'Assigned To', 'Status', 'Condition', 'Created At']

    const rows = filteredRecords.map(record => [
      record.device_id,
      record.device_name,
      record.device_type || '-',
      record.manufacturer || '-',
      record.model || '-',
      record.serial_number || '-',
      record.location || '-',
      record.department || '-',
      record.assigned_to || '-',
      record.status,
      record.condition || '-',
      new Date(record.created_at).toLocaleString('sl-SI')
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(';'))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Inventory_Devices_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'inactive': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'maintenance': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'retired': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return badges[status] || badges['inactive']
  }

  const getConditionBadge = (condition: string) => {
    const badges: Record<string, string> = {
      'excellent': 'bg-green-500/20 text-green-400 border-green-500/30',
      'good': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'fair': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'poor': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return badges[condition] || badges['good']
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('modules.inventoryDevices.title')}</h1>
            <p className="text-body-sm text-text-secondary">Upravljanje strojne opreme</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('workspaces.exportCSV')}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-body-sm font-medium">{t('modules.inventoryDevices.addDevice')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'maintenance', 'retired'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors duration-150
                ${statusFilter === filter
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover border border-border-subtle'
                }`}
            >
              {t(`modules.inventoryDevices.statusFilters.${filter}`)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t('modules.inventoryDevices.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-bg-surface border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('modules.inventoryDevices.table.deviceId')}</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Naprava</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Proizvajalec</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Serijska št.</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Lokacija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.device_id}</td>
                <td className="px-6 py-4">
                  <div className="text-body text-text-primary font-medium">{record.device_name}</div>
                  <div className="text-caption text-text-tertiary">{record.model || '-'}</div>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.device_type}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.manufacturer || '-'}</td>
                <td className="px-6 py-4 text-body text-text-secondary font-mono">{record.serial_number || '-'}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.location || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium border ${getStatusBadge(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                      title="Podrobnosti naprave"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(record)}
                      className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                      title="Uredi napravo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(record)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                      title="Izbriši napravo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            {statusFilter === 'all' && !searchQuery ? 
              'Ni najdenih naprav. Dodajte novo napravo ali preverite povezavo z bazo podatkov.' :
              'Ni najdenih naprav, ki ustrezajo izbranim filtrom.'
            }
          </div>
        )}
      </div>

      {/* Add Modal */}
      <InventoryDevicesAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* Edit Modal */}
      {isEditModalOpen && editingDevice && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi napravo">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="device_id" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.deviceId')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="device_id"
                  value={editFormData.device_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, device_id: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="device_name" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.deviceName')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="device_name"
                  value={editFormData.device_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, device_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="device_type" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.deviceType')} <span className="text-status-error">*</span>
                </label>
                <select
                  id="device_type"
                  value={editFormData.device_type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, device_type: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="server">{t('modules.inventoryDevices.deviceTypeOptions.server')}</option>
                  <option value="laptop">{t('modules.inventoryDevices.deviceTypeOptions.laptop')}</option>
                  <option value="desktop">{t('modules.inventoryDevices.deviceTypeOptions.desktop')}</option>
                  <option value="mobile">{t('modules.inventoryDevices.deviceTypeOptions.mobile')}</option>
                  <option value="tablet">{t('modules.inventoryDevices.deviceTypeOptions.tablet')}</option>
                  <option value="network_device">{t('modules.inventoryDevices.deviceTypeOptions.network_device')}</option>
                  <option value="printer">{t('modules.inventoryDevices.deviceTypeOptions.printer')}</option>
                  <option value="storage">{t('modules.inventoryDevices.deviceTypeOptions.storage')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.manufacturer')}
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  value={editFormData.manufacturer}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.model')}
                </label>
                <input
                  type="text"
                  id="model"
                  value={editFormData.model}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="serial_number" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.serialNumber')}
                </label>
                <input
                  type="text"
                  id="serial_number"
                  value={editFormData.serial_number}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.department')}
                </label>
                <input
                  type="text"
                  id="department"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.assignedTo')}
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
                  {t('modals.add.common.purchaseDate')}
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
                <label htmlFor="warranty_expiry" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.warrantyExpiry')}
                </label>
                <input
                  type="date"
                  id="warranty_expiry"
                  value={editFormData.warranty_expiry}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.status')} <span className="text-status-error">*</span>
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="active">Aktiven</option>
                  <option value="inactive">Neaktiven</option>
                  <option value="maintenance">V vzdrževanju</option>
                  <option value="retired">Upokojeni</option>
                </select>
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.condition')}
                </label>
                <select
                  id="condition"
                  value={editFormData.condition}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="excellent">{t('modals.add.condition.excellent')}</option>
                  <option value="good">{t('modals.add.condition.good')}</option>
                  <option value="fair">{t('modals.add.condition.fair')}</option>
                  <option value="poor">{t('modals.add.condition.poor')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('modals.add.common.notes')}
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
        title="Izbriši napravo"
        message={`Ali ste prepričani, da želite izbrisati napravo "${editingDevice?.device_name}"? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetailModal() }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedDevice.device_name}</h2>
                <p className="text-sm text-gray-400 mt-1">Podrobnosti naprave</p>
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedDevice.status)}`}>
                  Status: {selectedDevice.status}
                </span>
                {selectedDevice.condition && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionBadge(selectedDevice.condition)}`}>
                    Stanje: {selectedDevice.condition}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Device ID</div>
                  <div className="text-sm text-white font-mono">{selectedDevice.device_id}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Tip naprave</div>
                  <div className="text-sm text-white">{selectedDevice.device_type}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Proizvajalec</div>
                  <div className="text-sm text-white">{selectedDevice.manufacturer || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Model</div>
                  <div className="text-sm text-white">{selectedDevice.model || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Serijska št.</div>
                  <div className="text-sm text-white font-mono break-all">{selectedDevice.serial_number || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Lokacija</div>
                  <div className="text-sm text-white">{selectedDevice.location || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Oddelek</div>
                  <div className="text-sm text-white">{selectedDevice.department || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Dodeljeno</div>
                  <div className="text-sm text-white">{selectedDevice.assigned_to || '-'}</div>
                </div>
                {selectedDevice.purchase_date && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Datum nakupa</div>
                    <div className="text-sm text-white">{new Date(selectedDevice.purchase_date).toLocaleDateString('sl-SI')}</div>
                  </div>
                )}

                {selectedDevice.warranty_expiry && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Garancija do</div>
                    <div className="text-sm text-white">{new Date(selectedDevice.warranty_expiry).toLocaleDateString('sl-SI')}</div>
                  </div>
                )}

                <div className="md:col-span-2 bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Opombe</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedDevice.notes || '-'}</div>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
                >
                  Zapri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
