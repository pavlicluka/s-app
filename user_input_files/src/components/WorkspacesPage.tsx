// Page component for Workspaces
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Device } from '../lib/supabase'
import Badge from './Badge'
import { Shield, MapPin, X, Download, FileText, Plus, Edit, Trash2, Eye, Upload } from 'lucide-react'
import DeviceAddModal from './modals/DeviceAddModal'
import DeleteConfirmModal from './common/DeleteConfirmModal'
import Modal from './common/Modal'
import CSVImportModal from './common/CSVImportModal'

export default function WorkspacesPage() {
  const { t } = useTranslation()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [editFormData, setEditFormData] = useState({
    manufacturer: '',
    model: '',
    device_type: '',
    location: '',
    risk_level: 'Low',
    status: 'active',
    last_check: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    loadDevices()
    
    // Setup real-time subscription
    const channel = supabase
      .channel('devices-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'devices' }, 
        () => {
          loadDevices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  async function loadDevices() {
    setLoading(true)
    try {
      let query = supabase.from('devices').select('*').order('created_at', { ascending: false })
      
      if (filter !== 'all') {
        query = query.eq('risk_level', filter.charAt(0).toUpperCase() + filter.slice(1))
      }
      
      const { data } = await query
      setDevices(data || [])
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedDevice(null)
  }

  const handleOpenEditModal = (device: Device) => {
    setEditingDevice(device)
    setEditFormData({
      manufacturer: device.manufacturer,
      model: device.model,
      device_type: device.device_type,
      location: device.location,
      risk_level: device.risk_level,
      status: device.status,
      last_check: device.last_check ? new Date(device.last_check).toISOString().slice(0, 16) : ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDevice) return
    
    setSaving(true)
    try {
      const updateData: any = {
        manufacturer: editFormData.manufacturer,
        model: editFormData.model,
        device_type: editFormData.device_type,
        location: editFormData.location,
        risk_level: editFormData.risk_level,
        status: editFormData.status
      }
      
      if (editFormData.last_check) {
        updateData.last_check = editFormData.last_check
      }
      
      const { error } = await supabase
        .from('devices')
        .update(updateData)
        .eq('id', editingDevice.id)
      
      if (error) throw error
      
      await loadDevices()
      setIsEditModalOpen(false)
      setEditingDevice(null)
    } catch (error) {
      console.error('Error updating device:', error)
      alert(t('forms.updateError'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (device: Device) => {
    setEditingDevice(device)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingDevice) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', editingDevice.id)
      
      if (error) throw error
      
      await loadDevices()
      setIsDeleteModalOpen(false)
      setEditingDevice(null)
    } catch (error) {
      console.error('Error deleting device:', error)
      alert(t('forms.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    setIsExportingCSV(true)
    try {
      // CSV header
      const headers = ['ID', 'Manufacturer', 'Model', 'Device Type', 'Location', 'Risk Level', 'Status', 'Last Check', 'Created At']
      
      // CSV rows from devices
      const rows = devices.map(device => [
        device.id,
        device.manufacturer,
        device.model,
        device.device_type,
        device.location,
        device.risk_level,
        device.status,
        device.last_check ? new Date(device.last_check).toLocaleString('sl-SI') : 'Nikoli',
        new Date(device.created_at).toLocaleString('sl-SI')
      ])

      // Create CSV content with semicolon separator for Excel compatibility
      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]
      link.download = `Workspaces_naprave_${date}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('CSV export error:', error)
      alert(t('forms.csvExportError'))
    } finally {
      setIsExportingCSV(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-workspaces-pdf', {
        body: { devices }
      })

      if (error) throw error

      // Create blob from HTML and trigger download with print-to-PDF
      const blob = new Blob([data], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Open in new window for printing to PDF
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
      }

      // Alternative: Direct HTML download
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Workspaces_naprave_${date}.html`
      
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = fileName
      downloadLink.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export error:', error)
      alert(t('forms.pdfExportError'))
    } finally {
      setIsExportingPDF(false)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('workspaces.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('workspaces.subtitle')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['High', 'Medium', 'Low', 'Total'].map((level, index) => {
          const count = level === 'Total' 
            ? devices.length 
            : devices.filter(d => d.risk_level === level).length
          
          const displayLevel = level === 'Total' ? t('common.all') : 
                              t(`dashboard.${level.toLowerCase()}`)
          
          return (
            <div key={level} className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
              <div className="text-caption text-text-secondary mb-2">{displayLevel} {level === 'Total' ? '' : t('workspaces.subtitle').includes('tveganja') ? '' : 'tveganja'}</div>
              <div className="text-display-lg font-bold text-text-primary">{count}</div>
            </div>
          )
        })}
      </div>

      {/* Add Device Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-green-600/25"
        >
          <Upload className="w-5 h-5" />
          {t('workspaces.importCSV')}
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary-hover text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-accent-primary/25"
        >
          <Plus className="w-5 h-5" />
          {t('workspaces.addDevice')}
        </button>
      </div>

      {/* Filter Buttons and Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          {(['all', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-all duration-200
                ${filter === f 
                  ? 'bg-accent-primary text-white' 
                  : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
                }`}
            >
              {f === 'all' ? t('workspaces.filters.all') : t(`dashboard.${f}`)}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV || isExportingPDF || devices.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25"
          >
            <Download className="w-4 h-4" />
            {isExportingCSV ? t('workspaces.exporting') : t('workspaces.exportCSV')}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExportingCSV || isExportingPDF || devices.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-600/25"
          >
            <FileText className="w-4 h-4" />
            {isExportingPDF ? t('workspaces.preparing') : t('workspaces.exportPDF')}
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-bg-surface p-6 rounded-lg border border-border-subtle">
        <h3 className="text-heading-md font-semibold text-text-primary mb-6">{t('workspaces.devices')} ({devices.length})</h3>
        
        <div className="border border-border-subtle rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-near-black border-b border-border-moderate">
                <tr>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('workspaces.table.manufacturer')}</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('workspaces.table.location')}</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('workspaces.table.riskLevel')}</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('common.status')}</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('workspaces.table.lastCheck')}</th>
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr
                    key={device.id}
                    className={`border-b border-border-subtle hover:bg-bg-surface-hover transition-colors duration-200 ${
                      index === devices.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-text-primary">{device.manufacturer} {device.model}</div>
                      <div className="text-caption text-text-tertiary">{device.device_type}</div>
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-primary">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-text-tertiary" />
                        <span>{device.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-primary">
                      <Badge type="risk" value={device.risk_level} />
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-primary">
                      <Badge type="status" value={device.status} />
                    </td>
                    <td className="px-4 py-4 text-body-sm text-text-primary">
                      {device.last_check ? new Date(device.last_check).toLocaleString('sl-SI') : 'Nikoli'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(device)}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                          title="Podrobnosti naprave"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(device)}
                          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                          title="Uredi napravo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(device)}
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
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <DeviceAddModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={loadDevices}
      />

      {/* Edit Modal */}
      {isEditModalOpen && editingDevice && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi napravo">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-text-secondary mb-2">
                  Proizvajalec <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  value={editFormData.manufacturer}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-text-secondary mb-2">
                  Model <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="model"
                  value={editFormData.model}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, model: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="device_type" className="block text-sm font-medium text-text-secondary mb-2">
                  Tip naprave <span className="text-status-error">*</span>
                </label>
                <select
                  id="device_type"
                  value={editFormData.device_type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, device_type: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">Izberite...</option>
                  <option value="server">server</option>
                  <option value="workstation">workstation</option>
                  <option value="laptop">laptop</option>
                  <option value="mobile_device">mobile_device</option>
                  <option value="network_device">network_device</option>
                  <option value="printer">printer</option>
                  <option value="storage_device">storage_device</option>
                  <option value="security_device">security_device</option>
                  <option value="iot_device">iot_device</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">
                  Lokacija <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="risk_level" className="block text-sm font-medium text-text-secondary mb-2">
                  Nivo tveganja <span className="text-status-error">*</span>
                </label>
                <select
                  id="risk_level"
                  value={editFormData.risk_level}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, risk_level: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="Low">{t('dashboard.low')}</option>
                  <option value="Medium">{t('dashboard.medium')}</option>
                  <option value="High">{t('dashboard.high')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="last_check" className="block text-sm font-medium text-text-secondary mb-2">
                  Zadnji pregled
                </label>
                <input
                  type="datetime-local"
                  id="last_check"
                  value={editFormData.last_check}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, last_check: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
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
        message={`Ali ste prepričani, da želite izbrisati napravo ${editingDevice?.manufacturer} ${editingDevice?.model}? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadDevices}
        tableName="devices"
        title="Uvozi naprave iz CSV"
        columns={['manufacturer', 'model', 'device_type', 'location', 'risk_level', 'status']}
        sampleData={`manufacturer;model;device_type;location;risk_level;status
Dell;PowerEdge R740;server;Ljubljana;High;active
HP;EliteBook 850;laptop;Maribor;Medium;active
Cisco;Catalyst 9200;network_device;Celje;High;active`}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleCloseDetailModal}>
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t('workspaces.deviceDetails')}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDevice.manufacturer} {selectedDevice.model}
                </p>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Status and Risk Level */}
              <div className="flex flex-wrap gap-3">
                <Badge type="risk" value={selectedDevice.risk_level} />
                <Badge type="status" value={selectedDevice.status} />
              </div>

              {/* Device Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Manufacturer</div>
                  <div className="text-sm text-white font-medium">{selectedDevice.manufacturer}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('workspaces.table.model')}</div>
                  <div className="text-sm text-white font-medium">{selectedDevice.model}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Device Type</div>
                  <div className="text-sm text-white font-medium">{selectedDevice.device_type}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Location</div>
                  <div className="flex items-center gap-2 text-sm text-white font-medium">
                    <MapPin className="w-4 h-4 text-text-tertiary" />
                    {selectedDevice.location}
                  </div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                  <div className="text-sm text-white font-medium">{selectedDevice.risk_level}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('common.status')}</div>
                  <div className="text-sm text-white font-medium">{selectedDevice.status}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">{t('workspaces.table.lastCheck')}</div>
                  <div className="text-sm text-white font-medium">
                    {selectedDevice.last_check ? new Date(selectedDevice.last_check).toLocaleString('sl-SI') : 'Nikoli'}
                  </div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Created At</div>
                  <div className="text-sm text-white font-medium">
                    {new Date(selectedDevice.created_at).toLocaleString('sl-SI')}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Device ID</div>
                    <div className="text-sm text-white font-mono">{selectedDevice.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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
