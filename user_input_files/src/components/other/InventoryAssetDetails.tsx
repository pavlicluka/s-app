import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Archive, Plus, Eye, X, Package, Calendar, Shield, Wrench, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import InventoryAssetDetailsAddModal from '../modals/InventoryAssetDetailsAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import Modal from '../common/Modal'

export default function InventoryAssetDetails() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    asset_id: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    supplier: '',
    maintenance_schedule: '',
    last_maintenance: '',
    specifications: '',
    criticality_level: 'medium',
    backup_asset_id: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error} = await supabase.from('inventory_asset_details').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setRecords(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const handleSave = async () => {
    // Ponovno naloži podatke po shranjevanju
    const { data, error} = await supabase.from('inventory_asset_details').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error:', error)
      return
    }
    setRecords(data || [])
  }

  const handleViewDetails = (asset: any) => {
    setSelectedAsset(asset)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedAsset(null)
  }

  const handleOpenEditModal = (asset: any) => {
    setEditingAsset(asset)
    setEditFormData({
      asset_id: asset.asset_id || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : '',
      warranty_expiry: asset.warranty_expiry ? new Date(asset.warranty_expiry).toISOString().split('T')[0] : '',
      supplier: asset.supplier || '',
      maintenance_schedule: asset.maintenance_schedule || '',
      last_maintenance: asset.last_maintenance ? new Date(asset.last_maintenance).toISOString().split('T')[0] : '',
      specifications: asset.specifications || '',
      criticality_level: asset.criticality_level || 'medium',
      backup_asset_id: asset.backup_asset_id || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset) return
    
    setSaving(true)
    try {
      const updateData: any = {
        asset_id: editFormData.asset_id,
        serial_number: editFormData.serial_number,
        supplier: editFormData.supplier,
        criticality_level: editFormData.criticality_level
      }
      
      if (editFormData.purchase_date) updateData.purchase_date = editFormData.purchase_date
      if (editFormData.warranty_expiry) updateData.warranty_expiry = editFormData.warranty_expiry
      if (editFormData.maintenance_schedule) updateData.maintenance_schedule = editFormData.maintenance_schedule
      if (editFormData.last_maintenance) updateData.last_maintenance = editFormData.last_maintenance
      if (editFormData.specifications) updateData.specifications = editFormData.specifications
      if (editFormData.backup_asset_id) updateData.backup_asset_id = editFormData.backup_asset_id
      
      const { error } = await supabase
        .from('inventory_asset_details')
        .update(updateData)
        .eq('id', editingAsset.id)
      
      if (error) throw error
      
      await handleSave()
      setIsEditModalOpen(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Error updating asset:', error)
      alert('Napaka pri posodabljanju sredstva')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (asset: any) => {
    setEditingAsset(asset)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingAsset) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('inventory_asset_details')
        .delete()
        .eq('id', editingAsset.id)
      
      if (error) throw error
      
      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Napaka pri brisanju sredstva')
    } finally {
      setDeleting(false)
    }
  }

  const getCriticalityBadge = (level: string) => {
    const badges: Record<string, string> = {
      'critical': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'low': 'bg-green-500/20 text-green-400 border border-green-500/30'
    }
    return badges[level?.toLowerCase()] || badges['medium']
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Archive className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Asset Details</h1>
            <p className="text-body-sm text-text-secondary">Podrobnosti inventarja sredstev</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Dodaj sredstvo</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Asset ID</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Serijska št.</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dobavitelj</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Garancija do</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Kritičnost</th>
              <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.asset_id}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.serial_number}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.supplier}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.warranty_expiry ? new Date(record.warranty_expiry).toLocaleDateString('sl-SI') : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-caption font-medium ${record.criticality_level === 'critical' ? 'bg-risk-critical/20 text-risk-critical' : record.criticality_level === 'high' ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-medium/20 text-risk-medium'}`}>
                    {record.criticality_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                      title="Podrobnosti asseta"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(record)}
                      className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                      title="Uredi asset"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(record)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                      title="Izbriši asset"
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

      <InventoryAssetDetailsAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedAsset && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleCloseDetailModal}
        >
          <div 
            className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-400" />
                  {selectedAsset.asset_id || 'Asset Details'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Podrobnosti inventarnega sredstva</p>
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
              {/* Criticality Badge */}
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getCriticalityBadge(selectedAsset.criticality_level)}`}>
                  <Shield className="w-4 h-4" />
                  {selectedAsset.criticality_level || 'medium'}
                </span>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Osnovne informacije
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Asset ID</div>
                    <div className="text-sm text-white font-medium font-mono">{selectedAsset.asset_id || '-'}</div>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Serijska številka</div>
                    <div className="text-sm text-white font-medium">{selectedAsset.serial_number || '-'}</div>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Dobavitelj</div>
                    <div className="text-sm text-white font-medium">{selectedAsset.supplier || '-'}</div>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-xs text-gray-400 mb-1">Kritičnost</div>
                    <div className="text-sm text-white font-medium capitalize">{selectedAsset.criticality_level || '-'}</div>
                  </div>
                  {selectedAsset.backup_asset_id && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="text-xs text-gray-400 mb-1">Backup Asset ID</div>
                      <div className="text-sm text-white font-medium font-mono">{selectedAsset.backup_asset_id}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase & Warranty Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datumi in garancija
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAsset.purchase_date && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="text-xs text-gray-400 mb-1">Datum nakupa</div>
                      <div className="text-sm text-white font-medium">
                        {new Date(selectedAsset.purchase_date).toLocaleDateString('sl-SI')}
                      </div>
                    </div>
                  )}
                  {selectedAsset.warranty_expiry && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="text-xs text-gray-400 mb-1">Garancija do</div>
                      <div className="text-sm text-white font-medium">
                        {new Date(selectedAsset.warranty_expiry).toLocaleDateString('sl-SI')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Vzdrževanje
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedAsset.last_maintenance && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="text-xs text-gray-400 mb-1">Zadnje vzdrževanje</div>
                      <div className="text-sm text-white font-medium">
                        {new Date(selectedAsset.last_maintenance).toLocaleDateString('sl-SI')}
                      </div>
                    </div>
                  )}
                  {selectedAsset.maintenance_schedule && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="text-xs text-gray-400 mb-2">Urnik vzdrževanja</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedAsset.maintenance_schedule}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications */}
              {selectedAsset.specifications && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Specifikacije</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedAsset.specifications}</div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">UUID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedAsset.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">
                      {new Date(selectedAsset.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedAsset.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">
                        {new Date(selectedAsset.updated_at).toLocaleString('sl-SI')}
                      </div>
                    </div>
                  )}
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

      {/* Edit Modal */}

      {/* Edit Modal */}
      {isEditModalOpen && editingAsset && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi inventarno sredstvo">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="asset_id" className="block text-sm font-medium text-text-secondary mb-2">
                  Asset ID <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="asset_id"
                  value={editFormData.asset_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, asset_id: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="serial_number" className="block text-sm font-medium text-text-secondary mb-2">
                  Serijska številka <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="serial_number"
                  value={editFormData.serial_number}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-text-secondary mb-2">
                  Dobavitelj <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="supplier"
                  value={editFormData.supplier}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="criticality_level" className="block text-sm font-medium text-text-secondary mb-2">
                  Kritičnost <span className="text-status-error">*</span>
                </label>
                <select
                  id="criticality_level"
                  value={editFormData.criticality_level}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, criticality_level: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
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
                <label htmlFor="warranty_expiry" className="block text-sm font-medium text-text-secondary mb-2">
                  Garancija do
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
                <label htmlFor="last_maintenance" className="block text-sm font-medium text-text-secondary mb-2">
                  Zadnje vzdrževanje
                </label>
                <input
                  type="date"
                  id="last_maintenance"
                  value={editFormData.last_maintenance}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, last_maintenance: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="backup_asset_id" className="block text-sm font-medium text-text-secondary mb-2">
                  Backup Asset ID
                </label>
                <input
                  type="text"
                  id="backup_asset_id"
                  value={editFormData.backup_asset_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, backup_asset_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="maintenance_schedule" className="block text-sm font-medium text-text-secondary mb-2">
                  Urnik vzdrževanja
                </label>
                <textarea
                  id="maintenance_schedule"
                  value={editFormData.maintenance_schedule}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, maintenance_schedule: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="specifications" className="block text-sm font-medium text-text-secondary mb-2">
                  Specifikacije
                </label>
                <textarea
                  id="specifications"
                  value={editFormData.specifications}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, specifications: e.target.value }))}
                  rows={4}
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
        title="Izbriši inventarno sredstvo"
        message={`Ali ste prepričani, da želite izbrisati sredstvo ${editingAsset?.asset_id}? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />
    </div>
  )
}
