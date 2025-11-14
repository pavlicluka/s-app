import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle,
  Calendar,
  Upload,
  XCircle,
  CheckCircle,
  File
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

interface Dokumentacija {
  id: string
  naziv_dokumentacije: string
  datum_dokumenta: string
  datum_veljavnosti: string | null
  opis_dokumentacije: string | null
  pot_do_dokumenta: string | null
  created_at: string
  updated_at: string
}

export default function ZZPriDokumentacijaPage() {
  const { t } = useTranslation()
  const [dokumenti, setDokumenti] = useState<Dokumentacija[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDokument, setSelectedDokument] = useState<Dokumentacija | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    naziv_dokumentacije: '',
    datum_dokumenta: '',
    datum_veljavnosti: '',
    opis_dokumentacije: ''
  })

  const [formErrors, setFormErrors] = useState({
    naziv_dokumentacije: '',
    datum_dokumenta: ''
  })

  useEffect(() => {
    loadDokumenti()
  }, [])

  const loadDokumenti = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('zzzpri_dokumenti_splosni')
        .select('*')
        .order('datum_dokumenta', { ascending: false })

      if (error) throw error
      setDokumenti(data || [])
    } catch (err) {
      console.error('Napaka pri nalaganju dokumentacije:', err)
      setError('Napaka pri nalaganju dokumentacije')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('sl-SI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const validateForm = () => {
    const errors = {
      naziv_dokumentacije: '',
      datum_dokumenta: ''
    }
    let isValid = true

    if (!formData.naziv_dokumentacije.trim()) {
      errors.naziv_dokumentacije = 'Naziv dokumentacije je obvezen'
      isValid = false
    }

    if (!formData.datum_dokumenta) {
      errors.datum_dokumenta = 'Datum dokumenta je obvezen'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      let filePath = null

      // Upload file if present
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        filePath = `zzzpri-dokumenti/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, uploadedFile)

        if (uploadError) {
          console.error('Napaka pri nalaganju datoteke:', uploadError)
          setError('Napaka pri nalaganju datoteke')
          return
        }
      }

      const dataToSave = {
        naziv_dokumentacije: formData.naziv_dokumentacije,
        datum_dokumenta: formData.datum_dokumenta,
        datum_veljavnosti: formData.datum_veljavnosti || null,
        opis_dokumentacije: formData.opis_dokumentacije || null,
        pot_do_dokumenta: filePath
      }

      if (isEditMode && selectedDokument) {
        const { error } = await supabase
          .from('zzzpri_dokumenti_splosni')
          .update(dataToSave)
          .eq('id', selectedDokument.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('zzzpri_dokumenti_splosni')
          .insert([dataToSave])

        if (error) throw error
      }

      await loadDokumenti()
      resetForm()
      setShowModal(false)
    } catch (err) {
      console.error('Napaka pri shranjevanju:', err)
      setError('Napaka pri shranjevanju dokumentacije')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati ta dokument?')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('zzzpri_dokumenti_splosni')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadDokumenti()
    } catch (err) {
      console.error('Napaka pri brisanju:', err)
      setError('Napaka pri brisanju dokumentacije')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      naziv_dokumentacije: '',
      datum_dokumenta: '',
      datum_veljavnosti: '',
      opis_dokumentacije: ''
    })
    setFormErrors({
      naziv_dokumentacije: '',
      datum_dokumenta: ''
    })
    setUploadedFile(null)
    setIsEditMode(false)
    setSelectedDokument(null)
  }

  const handleEdit = (dokument: Dokumentacija) => {
    setSelectedDokument(dokument)
    setFormData({
      naziv_dokumentacije: dokument.naziv_dokumentacije,
      datum_dokumenta: dokument.datum_dokumenta,
      datum_veljavnosti: dokument.datum_veljavnosti || '',
      opis_dokumentacije: dokument.opis_dokumentacije || ''
    })
    setIsEditMode(true)
    setShowModal(true)
  }

  const handleView = (dokument: Dokumentacija) => {
    setSelectedDokument(dokument)
    setShowViewModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const filteredDokumenti = dokumenti.filter(dok => 
    dok.naziv_dokumentacije.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dok.opis_dokumentacije && dok.opis_dokumentacije.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && dokumenti.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Dokumentacija ZZPri
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje dokumentacije v zvezi z ZZPri zakonom
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Dodaj dokument
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Išči po nazivu ali opisu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-body-sm text-text-secondary">
        Prikazano {filteredDokumenti.length} od {dokumenti.length} dokumentov
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover border-b border-border-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Naziv</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Datum dokumenta</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Datum veljavnosti</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Opis</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Datoteka</th>
                <th className="px-6 py-3 text-left text-body-sm font-semibold text-text-secondary">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredDokumenti.map((dokument) => (
                <tr key={dokument.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent-primary" />
                      <span className="text-body-sm text-text-primary font-medium">{dokument.naziv_dokumentacije}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-text-tertiary" />
                      <span className="text-body-sm text-text-secondary">{formatDate(dokument.datum_dokumenta)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-body-sm text-text-secondary">{formatDate(dokument.datum_veljavnosti)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-body-sm text-text-secondary line-clamp-2">
                      {dokument.opis_dokumentacije || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {dokument.pot_do_dokumenta ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
                        <File className="w-3 h-3 text-green-400" />
                        <span className="text-body-xs text-green-400">Naloženo</span>
                      </div>
                    ) : (
                      <span className="text-body-xs text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleView(dokument)}
                        className="p-2 text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(dokument)}
                        className="p-2 text-text-tertiary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dokument.id)}
                        className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
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

      {filteredDokumenti.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-heading-md font-medium text-text-primary mb-2">Ni dokumentov</h3>
          <p className="text-body text-text-secondary mb-6">
            {searchTerm 
              ? 'Ni dokumentov, ki bi ustrezali iskalnemu nizu.'
              : 'Še ni bilo dodanih dokumentov.'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  {isEditMode ? 'Uredi dokument' : 'Dodaj dokument'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Naziv dokumentacije */}
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Naziv dokumentacije <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.naziv_dokumentacije}
                    onChange={(e) => setFormData({ ...formData, naziv_dokumentacije: e.target.value })}
                    className={`w-full px-3 py-2 bg-bg-surface border ${formErrors.naziv_dokumentacije ? 'border-red-500' : 'border-border-subtle'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary`}
                    placeholder="Vnesite naziv dokumentacije"
                  />
                  {formErrors.naziv_dokumentacije && (
                    <p className="mt-1 text-body-xs text-red-400">{formErrors.naziv_dokumentacije}</p>
                  )}
                </div>

                {/* Datum dokumenta */}
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Datum dokumenta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.datum_dokumenta}
                    onChange={(e) => setFormData({ ...formData, datum_dokumenta: e.target.value })}
                    className={`w-full px-3 py-2 bg-bg-surface border ${formErrors.datum_dokumenta ? 'border-red-500' : 'border-border-subtle'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary`}
                  />
                  {formErrors.datum_dokumenta && (
                    <p className="mt-1 text-body-xs text-red-400">{formErrors.datum_dokumenta}</p>
                  )}
                </div>

                {/* Datum veljavnosti */}
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Datum veljavnosti
                  </label>
                  <input
                    type="date"
                    value={formData.datum_veljavnosti}
                    onChange={(e) => setFormData({ ...formData, datum_veljavnosti: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                {/* Opis dokumentacije */}
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Opis dokumentacije
                  </label>
                  <textarea
                    value={formData.opis_dokumentacije}
                    onChange={(e) => setFormData({ ...formData, opis_dokumentacije: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                    placeholder="Vnesite podrobnejši opis dokumentacije"
                  />
                </div>

                {/* Naloži dokument */}
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Naloži dokument
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-surface-active transition-colors duration-200 cursor-pointer text-text-secondary">
                      <Upload className="w-4 h-4" />
                      <span className="text-body-sm">Izberi datoteko</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                      />
                    </label>
                    {uploadedFile && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-body-sm text-text-secondary">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-body-xs text-text-tertiary">
                    Podprte vrste datotek: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Shranjujem...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {isEditMode ? 'Posodobi' : 'Shrani'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-surface-active transition-colors duration-200 text-text-secondary"
                  >
                    Prekliči
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDokument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  Podrobnosti dokumenta
                </h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Naziv dokumentacije</label>
                  <p className="text-body text-text-primary mt-1">{selectedDokument.naziv_dokumentacije}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum dokumenta</label>
                    <p className="text-body text-text-primary mt-1">{formatDate(selectedDokument.datum_dokumenta)}</p>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-text-secondary">Datum veljavnosti</label>
                    <p className="text-body text-text-primary mt-1">{formatDate(selectedDokument.datum_veljavnosti)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Opis dokumentacije</label>
                  <p className="text-body text-text-primary mt-1">{selectedDokument.opis_dokumentacije || '-'}</p>
                </div>

                <div>
                  <label className="text-body-sm font-medium text-text-secondary">Status datoteke</label>
                  <div className="mt-1">
                    {selectedDokument.pot_do_dokumenta ? (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                        <File className="w-4 h-4 text-green-400" />
                        <span className="text-body-sm text-green-400">Datoteka naložena</span>
                      </div>
                    ) : (
                      <span className="text-body text-text-tertiary">Datoteka ni naložena</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
