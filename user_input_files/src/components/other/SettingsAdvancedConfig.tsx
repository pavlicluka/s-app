import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Settings, Plus } from 'lucide-react'
import SettingsAdvancedConfigAddModal from '../modals/SettingsAdvancedConfigAddModal'

export default function SettingsAdvancedConfig() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error} = await supabase.from('settings_advanced_config').select('*').order('setting_category', { ascending: true })
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
    const { data, error} = await supabase.from('settings_advanced_config').select('*').order('setting_category', { ascending: true })
    if (error) {
      console.error('Error:', error)
      return
    }
    setRecords(data || [])
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Advanced Settings</h1>
            <p className="text-body-sm text-text-secondary">Sistemske konfiguracije</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Nova nastavitev</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Ključ</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Vrednost</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Kategorija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip podatkov</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Občutljivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-mono">{record.setting_key}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.is_sensitive ? '********' : record.setting_value}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-caption font-medium bg-accent-primary/10 text-accent-primary">
                    {record.setting_category}
                  </span>
                </td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.data_type}</td>
                <td className="px-6 py-4">
                  {record.is_sensitive ? (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-error/10 text-status-error">Da</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-success/10 text-status-success">Ne</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SettingsAdvancedConfigAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />
    </div>
  )
}
