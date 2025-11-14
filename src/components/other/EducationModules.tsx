import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BookOpen, Plus, Eye, X, Edit, Trash2 } from 'lucide-react'
import EducationModulesAddModal from '../modals/EducationModulesAddModal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import Modal from '../common/Modal'

export default function EducationModules() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    module_name: '',
    category: '',
    duration_minutes: '',
    description: '',
    learning_objectives: '',
    content_url: '',
    mandatory: false,
    completion_rate: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error} = await supabase.from('education_modules').select('*').order('created_at', { ascending: false })
        if (error) throw error
        
        // Če ni podatkov iz baze, uporabimo demo zapise
        if (!data || data.length === 0) {
          const demoData = [
            {
              id: 1,
              module_name: "Osnove kibernetske varnosti",
              category: "Kibernetska varnost",
              duration_minutes: 90,
              description: "Temeljni modul o osnovah kibernetske varnosti, ki vključuje prepoznavanje groženj, varnostnih politik in najboljših praks za zaščito digitalnih sredstev.",
              learning_objectives: "Prepoznavanje groženj, razumevanje varnostnih politik, uporaba varnih gesel, prepoznavanje phishing napadov",
              content_url: "https://standario.example.com/izobrazevanje/kibernetska-varnost",
              mandatory: true,
              completion_rate: 95,
              created_at: "2024-10-15T08:00:00Z",
              updated_at: "2024-11-01T10:30:00Z"
            },
            {
              id: 2,
              module_name: "GDPR in varstvo osebnih podatkov",
              category: "Zakonska ustreznost",
              duration_minutes: 60,
              description: "Poglobljen pregled Splošne uredbe o varstvu podatkov (GDPR), njenih zahtev in implementacije v vsakdanjo prakso organizacije.",
              learning_objectives: "Razumevanje GDPR načel, identifikacija osebnih podatkov, postopki obdelave podatkov, pravice posameznikov",
              content_url: "https://standario.example.com/izobrazevanje/gdpr",
              mandatory: true,
              completion_rate: 88,
              created_at: "2024-10-10T09:15:00Z",
              updated_at: "2024-10-20T14:45:00Z"
            },
            {
              id: 3,
              module_name: "Varno delo na daljavo",
              category: "Delo na daljavo",
              duration_minutes: 45,
              description: "Smernice in protokoli za varno delo izven pisarniških prostorov, vključno z varnimi povezavami, fizično varnostjo in higieno podatkov.",
              learning_objectives: "Vzpostavitev varnega domačega delovnega mesta, varna povezava do podjetniških sistemov, zaščita občutljivih podatkov",
              content_url: "https://standario.example.com/izobrazevanje/delo-na-daljavo",
              mandatory: false,
              completion_rate: 72,
              created_at: "2024-10-05T11:20:00Z",
              updated_at: "2024-10-25T16:10:00Z"
            },
            {
              id: 4,
              module_name: "Socialna varnost in etična uporaba AI",
              category: "Umetna inteligenca",
              duration_minutes: 75,
              description: "Modul o odgovorni uporabi umetne inteligence, etičnih vidikih AI in ukrepih za preprečevanje zlorab v poslovnem okolju.",
              learning_objectives: "Razumevanje etičnih vidikov AI, prepoznavanje pristranosti, varen razvoj AI sistemov, transparentnost algoritmov",
              content_url: "https://standario.example.com/izobrazevanje/ai-etika",
              mandatory: true,
              completion_rate: 81,
              created_at: "2024-09-28T13:45:00Z",
              updated_at: "2024-10-15T09:30:00Z"
            },
            {
              id: 5,
              module_name: "Upravljanje digitalnih identitet",
              category: "Identiteta in dostop",
              duration_minutes: 50,
              description: "Naučite se upravljati digitalne identitete, večfaktorsko avtentikacijo ter varnostne protokole za zaščito uporabniških računov.",
              learning_objectives: "Konfiguracija MFA, upravljanje gesel, razumevanje SSO, zaščita digitalnih sledi",
              content_url: "https://standario.example.com/izobrazevanje/digitalna-identiteta",
              mandatory: false,
              completion_rate: 67,
              created_at: "2024-09-20T15:10:00Z",
              updated_at: "2024-10-05T12:20:00Z"
            }
          ]
          setRecords(demoData)
        } else {
          setRecords(data)
        }
      } catch (error) {
        console.error('Error:', error)
        // V primeru napake, prikažemo demo podatke
        const demoData = [
          {
            id: 1,
            module_name: "Osnove kibernetske varnosti",
            category: "Kibernetska varnost",
            duration_minutes: 90,
            description: "Temeljni modul o osnovah kibernetske varnosti, ki vključuje prepoznavanje groženj, varnostnih politik in najboljših praks za zaščito digitalnih sredstev.",
            learning_objectives: "Prepoznavanje groženj, razumevanje varnostnih politik, uporaba varnih gesel, prepoznavanje phishing napadov",
            content_url: "https://standario.example.com/izobrazevanje/kibernetska-varnost",
            mandatory: true,
            completion_rate: 95,
            created_at: "2024-10-15T08:00:00Z",
            updated_at: "2024-11-01T10:30:00Z"
          },
          {
            id: 2,
            module_name: "GDPR in varstvo osebnih podatkov",
            category: "Zakonska ustreznost",
            duration_minutes: 60,
            description: "Poglobljen pregled Splošne uredbe o varstvu podatkov (GDPR), njenih zahtev in implementacije v vsakdanjo prakso organizacije.",
            learning_objectives: "Razumevanje GDPR načel, identifikacija osebnih podatkov, postopki obdelave podatkov, pravice posameznikov",
            content_url: "https://standario.example.com/izobrazevanje/gdpr",
            mandatory: true,
            completion_rate: 88,
            created_at: "2024-10-10T09:15:00Z",
            updated_at: "2024-10-20T14:45:00Z"
          },
          {
            id: 3,
            module_name: "Varno delo na daljavo",
            category: "Delo na daljavo",
            duration_minutes: 45,
            description: "Smernice in protokoli za varno delo izven pisarniških prostorov, vključno z varnimi povezavami, fizično varnostjo in higieno podatkov.",
            learning_objectives: "Vzpostavitev varnega domačega delovnega mesta, varna povezava do podjetniških sistemov, zaščita občutljivih podatkov",
            content_url: "https://standario.example.com/izobrazevanje/delo-na-daljavo",
            mandatory: false,
            completion_rate: 72,
            created_at: "2024-10-05T11:20:00Z",
            updated_at: "2024-10-25T16:10:00Z"
          },
          {
            id: 4,
            module_name: "Socialna varnost in etična uporaba AI",
            category: "Umetna inteligenca",
            duration_minutes: 75,
            description: "Modul o odgovorni uporabi umetne inteligence, etičnih vidikih AI in ukrepih za preprečevanje zlorab v poslovnem okolju.",
            learning_objectives: "Razumevanje etičnih vidikov AI, prepoznavanje pristranosti, varen razvoj AI sistemov, transparentnost algoritmov",
            content_url: "https://standario.example.com/izobrazevanje/ai-etika",
            mandatory: true,
            completion_rate: 81,
            created_at: "2024-09-28T13:45:00Z",
            updated_at: "2024-10-15T09:30:00Z"
          },
          {
            id: 5,
            module_name: "Upravljanje digitalnih identitet",
            category: "Identiteta in dostop",
            duration_minutes: 50,
            description: "Naučite se upravljati digitalne identitete, večfaktorsko avtentikacijo ter varnostne protokole za zaščito uporabniških računov.",
            learning_objectives: "Konfiguracija MFA, upravljanje gesel, razumevanje SSO, zaščita digitalnih sledi",
            content_url: "https://standario.example.com/izobrazevanje/digitalna-identiteta",
            mandatory: false,
            completion_rate: 67,
            created_at: "2024-09-20T15:10:00Z",
            updated_at: "2024-10-05T12:20:00Z"
          }
        ]
        setRecords(demoData)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const handleSave = async () => {
    // Ponovno naloži podatke po shranjevanju
    const { data, error} = await supabase.from('education_modules').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error:', error)
      return
    }
    setRecords(data || [])
  }

  const handleViewDetails = (education: any) => {
    setSelectedEducation(education)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedEducation(null)
  }

  const handleOpenEditModal = (education: any) => {
    setEditingEducation(education)
    setEditFormData({
      module_name: education.module_name || '',
      category: education.category || '',
      duration_minutes: education.duration_minutes?.toString() || '',
      description: education.description || '',
      learning_objectives: education.learning_objectives || '',
      content_url: education.content_url || '',
      mandatory: education.mandatory || false,
      completion_rate: education.completion_rate?.toString() || ''
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEducation) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('education_modules')
        .update({
          module_name: editFormData.module_name,
          category: editFormData.category,
          duration_minutes: parseInt(editFormData.duration_minutes),
          description: editFormData.description,
          learning_objectives: editFormData.learning_objectives,
          content_url: editFormData.content_url,
          mandatory: editFormData.mandatory,
          completion_rate: parseInt(editFormData.completion_rate)
        })
        .eq('id', editingEducation.id)
      
      if (error) throw error
      
      await handleSave()
      setIsEditModalOpen(false)
      setEditingEducation(null)
    } catch (error) {
      console.error('Error updating education module:', error)
      alert('Napaka pri posodabljanju modula')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (education: any) => {
    setEditingEducation(education)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!editingEducation) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('education_modules')
        .delete()
        .eq('id', editingEducation.id)
      
      if (error) throw error
      
      await handleSave()
      setIsDeleteModalOpen(false)
      setEditingEducation(null)
    } catch (error) {
      console.error('Error deleting education module:', error)
      alert('Napaka pri brisanju modula')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Izobraževalni moduli</h1>
            <p className="text-body-sm text-text-secondary">Varnostno izobraževanje in usposabljanje</p>
          </div>
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">Nov modul</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-pure-black border-b border-border-subtle">
            <tr>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Modul</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Kategorija</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Trajanje</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Obvezno</th>
              <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Zaključenost</th>
              <th className="text-center px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                <td className="px-6 py-4 text-body text-text-primary font-medium">{record.module_name}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.category}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{record.duration_minutes} min</td>
                <td className="px-6 py-4">
                  {record.mandatory ? (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-error/10 text-status-error">Obvezno</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-status-info/10 text-status-info">Opcijsko</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-bg-near-black rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-primary transition-all duration-300"
                        style={{ width: `${record.completion_rate}%` }}
                      />
                    </div>
                    <span className="text-body-sm text-text-secondary font-medium">{record.completion_rate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
                      title="Podrobnosti izobraževanja"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(record)}
                      className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-colors"
                      title="Uredi modul"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(record)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                      title="Izbriši modul"
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

      <EducationModulesAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedEducation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetailModal() }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedEducation.module_name}</h2>
                <p className="text-sm text-gray-400 mt-1">Podrobnosti izobraževalnega modula</p>
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
              {/* Status and Category badges */}
              <div className="flex flex-wrap gap-3">
                {selectedEducation.mandatory ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Obvezno
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Opcijsko
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {selectedEducation.category}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">ID Modula</div>
                  <div className="text-sm text-white font-medium">{selectedEducation.module_id || '-'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Trajanje</div>
                  <div className="text-sm text-white font-medium">{selectedEducation.duration_minutes} minut</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Zaključenost</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${selectedEducation.completion_rate}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">{selectedEducation.completion_rate}%</span>
                  </div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Kategorija</div>
                  <div className="text-sm text-white font-medium">{selectedEducation.category}</div>
                </div>
              </div>

              {/* Description */}
              {selectedEducation.description && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Opis</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedEducation.description}</div>
                </div>
              )}

              {/* Learning Objectives */}
              {selectedEducation.learning_objectives && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Učni cilji</div>
                  <div className="text-sm text-white whitespace-pre-wrap">{selectedEducation.learning_objectives}</div>
                </div>
              )}

              {/* Content URL */}
              {selectedEducation.content_url && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Povezava do vsebine</div>
                  <a 
                    href={selectedEducation.content_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {selectedEducation.content_url}
                  </a>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ID</div>
                    <div className="text-sm text-white font-mono break-all">{selectedEducation.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">
                      {new Date(selectedEducation.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedEducation.updated_at && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                      <div className="text-sm text-white">
                        {new Date(selectedEducation.updated_at).toLocaleString('sl-SI')}
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
      {isEditModalOpen && editingEducation && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Uredi izobraževalni modul">
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="module_name" className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv modula <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="module_name"
                  value={editFormData.module_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, module_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                  Kategorija <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-text-secondary mb-2">
                  Trajanje (minute) <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  value={editFormData.duration_minutes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
                  Opis
                </label>
                <textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="learning_objectives" className="block text-sm font-medium text-text-secondary mb-2">
                  Učni cilji
                </label>
                <textarea
                  id="learning_objectives"
                  value={editFormData.learning_objectives}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, learning_objectives: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="content_url" className="block text-sm font-medium text-text-secondary mb-2">
                  Povezava do vsebine
                </label>
                <input
                  type="url"
                  id="content_url"
                  value={editFormData.content_url}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label htmlFor="completion_rate" className="block text-sm font-medium text-text-secondary mb-2">
                  Zaključenost (%) <span className="text-status-error">*</span>
                </label>
                <input
                  type="number"
                  id="completion_rate"
                  min="0"
                  max="100"
                  value={editFormData.completion_rate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, completion_rate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="mandatory" className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="mandatory"
                    checked={editFormData.mandatory}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, mandatory: e.target.checked }))}
                    className="mr-2 w-4 h-4 bg-bg-near-black border border-border-subtle rounded focus:ring-accent-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary">Obvezno izobraževanje</span>
                </label>
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
        title="Izbriši izobraževalni modul"
        message={`Ali ste prepričani, da želite izbrisati modul "${editingEducation?.module_name}"? Te akcije ni mogoče razveljaviti.`}
        isDeleting={deleting}
      />
    </div>
  )
}
