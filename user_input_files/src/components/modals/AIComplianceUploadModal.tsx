import { useState, useEffect } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface AIComplianceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function AIComplianceUploadModal({ isOpen, onClose, onSave }: AIComplianceUploadModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    ai_system: '',
    status: 'draft',
    version: 'v1.0',
    expiry_date: '',
    file_name: '',
    file_size: 0,
    file_url: '',
    created_date: new Date().toISOString().split('T')[0],
    organization_id: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)
  const [aiSystems, setAiSystems] = useState<Array<{id: number, name: string}>>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        document_type: '',
        ai_system: '',
        status: 'draft',
        version: 'v1.0',
        expiry_date: '',
        file_name: '',
        file_size: 0,
        file_url: '',
        created_date: new Date().toISOString().split('T')[0],
        organization_id: userProfile?.organization_id || ''
      })
      setValidationErrors({})
      setSelectedFile(null)
    }
  }, [isOpen, userProfile?.organization_id])

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !isOpen) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user, isOpen])

  // Load AI systems for dropdown
  useEffect(() => {
    const loadAISystems = async () => {
      if (!userProfile?.organization_id) return
      
      try {
        // For now, use mock data since we don't have a real AI systems table structure
        const mockSystems = [
          { id: 1, name: 'Chatbot za podporo strankam' },
          { id: 2, name: 'Sistem za razpoznavanje obrazov' },
          { id: 3, name: 'Priporočilni sistem' },
          { id: 4, name: 'Sistem za ocenjevanje tveganj' }
        ]
        setAiSystems(mockSystems)
      } catch (error) {
        console.error('Error loading AI systems:', error)
      }
    }

    loadAISystems()
  }, [userProfile?.organization_id])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Naslov dokumenta je obvezno polje'
    }
    
    if (!formData.document_type.trim()) {
      errors.document_type = 'Tip dokumenta je obvezno polje'
    }
    
    if (!formData.ai_system.trim()) {
      errors.ai_system = 'AI sistem je obvezno polje'
    }
    
    if (!formData.expiry_date.trim()) {
      errors.expiry_date = 'Datum poteka je obvezno polje'
    }
    
    if (!selectedFile) {
      errors.file = 'Datoteka je obvezna'
    }
    
    // Validate expiry date is in the future
    if (formData.expiry_date && new Date(formData.expiry_date) <= new Date()) {
      errors.expiry_date = 'Datum poteka mora biti v prihodnosti'
    }
    
    // Validate file size (max 10MB)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      errors.file = 'Datoteka je prevelika (maksimalno 10MB)'
    }
    
    // Validate organization context
    const orgId = formData.organization_id || userProfile?.organization_id || ''
    if (!orgId.trim()) {
      errors.organization_id = 'ID organizacije je obvezno polje'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setFormData(prev => ({
      ...prev,
      file_name: file.name,
      file_size: file.size
    }))
    
    // Clear file validation error
    if (validationErrors.file) {
      setValidationErrors(prev => ({ ...prev, file: '' }))
    }

    // Auto-fill title from file name (without extension)
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({ ...prev, title: nameWithoutExt }))
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('application/') || 
          file.type.startsWith('text/') || 
          file.type === 'application/pdf') {
        handleFileSelect(file)
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          file: 'Nepodprt tip datoteke. Podprti formati: PDF, DOC, DOCX, TXT' 
        }))
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setUploading(true)

    try {
      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      // Upload file to storage (simulated for now)
      let fileUrl = ''
      if (selectedFile) {
        // In real implementation, this would upload to Supabase storage:
        // const fileExt = selectedFile.name.split('.').pop()
        // const fileName = `${Date.now()}.${fileExt}`
        // const { data, error } = await supabase.storage
        //   .from('compliance-documents')
        //   .upload(fileName, selectedFile)
        // if (error) throw error
        // fileUrl = data.path

        // For now, just simulate upload
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload time
        fileUrl = `documents/${selectedFile.name}`
      }

      const submissionData = {
        ...formData,
        organization_id: userProfile.organization_id,
        file_url: fileUrl,
        last_updated: new Date().toISOString().split('T')[0]
      }
      
      // For now, just log the data since we don't have a real table structure
      console.log('AI Compliance Document uploaded:', submissionData)
      
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Napaka pri nalaganju:', error)
      const errorMessage = error.message || 'Napaka pri nalaganju podatkov'
      if (errorMessage.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Naloži dokument skladnosti</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Izbor datoteke
            </h3>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-accent-primary bg-accent-primary/5' 
                    : 'border-border-subtle hover:border-accent-primary/50'
                }`}
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <p className="text-text-primary mb-2">
                  Povlecite datoteko sem ali kliknite za izbiro
                </p>
                <p className="text-text-secondary text-sm mb-4">
                  Podprti formati: PDF, DOC, DOCX, TXT (maksimalno 10MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 cursor-pointer transition-colors duration-150 inline-block"
                >
                  Izberite datoteko
                </label>
              </div>
            ) : (
              <div className="border border-border-subtle rounded-lg p-4 bg-bg-near-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-accent-primary" />
                    <div>
                      <p className="text-text-primary font-medium">{selectedFile.name}</p>
                      <p className="text-text-secondary text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setFormData(prev => ({
                        ...prev,
                        file_name: '',
                        file_size: 0
                      }))
                    }}
                    className="text-text-tertiary hover:text-status-error transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            {validationErrors.file && (
              <p className="text-status-error text-xs mt-2">{validationErrors.file}</p>
            )}
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Osnovne informacije
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Naslov dokumenta *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="Vnesite naslov dokumenta"
                  required
                />
                {validationErrors.title && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tip dokumenta *
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => handleChange('document_type', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  required
                >
                  <option value="">Izberite tip dokumenta</option>
                  <option value="Technical Documentation">Tehnična dokumentacija</option>
                  <option value="Risk Assessment">Ocena tveganja</option>
                  <option value="Legal Compliance">Pravna skladnost</option>
                  <option value="Compliance Certificate">Skladnostni certifikat</option>
                  <option value="GDPR Impact Assessment">GDPR ocena vpliva</option>
                  <option value="AI Risk Assessment">AI ocena tveganja</option>
                  <option value="Data Protection Impact">Vpliv na varstvo podatkov</option>
                  <option value="Ethics Assessment">Etika ocena</option>
                </select>
                {validationErrors.document_type && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.document_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  AI sistem *
                </label>
                <select
                  value={formData.ai_system}
                  onChange={(e) => handleChange('ai_system', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  required
                >
                  <option value="">Izberite AI sistem</option>
                  {aiSystems.map(system => (
                    <option key={system.id} value={system.name}>{system.name}</option>
                  ))}
                </select>
                {validationErrors.ai_system && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.ai_system}</p>
                )}
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Podrobnosti dokumenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="draft">Osnutek</option>
                  <option value="under_review">V pregledu</option>
                  <option value="compliant">Skladen</option>
                  <option value="needs_update">Potrebuje posodobitev</option>
                  <option value="expired">Potečen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Verzija
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="v1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Datum objave
                </label>
                <input
                  type="date"
                  value={formData.created_date}
                  onChange={(e) => handleChange('created_date', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Datum poteka *
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  required
                />
                {validationErrors.expiry_date && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.expiry_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Opis dokumenta
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary resize-none"
              placeholder="Podroben opis vsebine in namena dokumenta skladnosti..."
            />
          </div>

          {/* Organization ID validation error */}
          {validationErrors.organization_id && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-status-error text-sm">{validationErrors.organization_id}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface-hover transition-colors duration-150 disabled:opacity-50"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {uploading ? 'Nalagam datoteko...' : 'Shranjujem...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Naloži dokument
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}