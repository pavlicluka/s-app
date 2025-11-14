import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import { supabase, NIS2Documentation } from '../../lib/supabase'

interface NIS2DocumentationModalProps {
  isOpen: boolean
  onClose: () => void
  documentation?: NIS2Documentation | null
  onSuccess: () => void
}

export default function NIS2DocumentationModal({ 
  isOpen, 
  onClose, 
  documentation, 
  onSuccess 
}: NIS2DocumentationModalProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    document_type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'csv'
    category: string
    tags: string
    is_confidential: boolean
    version: string
    status: 'draft' | 'active' | 'archived'
  }>({
    title: '',
    description: '',
    document_type: 'pdf',
    category: '',
    tags: '',
    is_confidential: false,
    version: '',
    status: 'draft'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]

  const fileTypeLabels = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/csv': 'CSV'
  }

  const documentTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'csv', label: 'CSV' }
  ]

  const statuses = [
    { value: 'draft', label: 'Osnutek' },
    { value: 'active', label: 'Aktiven' },
    { value: 'archived', label: 'Arhiviran' }
  ]

  useEffect(() => {
    if (documentation) {
      setFormData({
        title: documentation.title,
        description: documentation.description || '',
        document_type: documentation.document_type,
        category: documentation.category || '',
        tags: documentation.tags?.join(', ') || '',
        is_confidential: documentation.is_confidential,
        version: documentation.version || '',
        status: documentation.status
      })
    } else {
      setFormData({
        title: '',
        description: '',
        document_type: 'pdf',
        category: '',
        tags: '',
        is_confidential: false,
        version: '',
        status: 'draft'
      })
    }
    setSelectedFile(null)
    setError('')
  }, [documentation, isOpen])

  const handleFileSelect = (file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      setError('Nepodprt tip datoteke. Dovoljeni so: PDF, DOC, DOCX, XLS, XLSX, CSV')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('Datoteka je prevelika. Največja dovoljena velikost je 50MB.')
      return
    }

    setSelectedFile(file)
    setError('')

    // Auto-detect document type from file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension) {
      const matchingType = documentTypes.find(type => type.value === extension)
      if (matchingType) {
        setFormData(prev => ({ ...prev, document_type: matchingType.value as any }))
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documentation && !selectedFile) {
      setError('Izberite datoteko za nalaganje.')
      return
    }

    if (!formData.title.trim()) {
      setError('Vnesite naslov dokumenta.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Uporabnik ni prijavljen.')
      }

      let filePath = documentation?.file_path || ''
      let fileName = documentation?.file_name || ''

      // Upload file if new file selected
      if (selectedFile) {
        const timestamp = Date.now()
        const userFolder = user.id
        const fileExtension = selectedFile.name.split('.').pop()
        const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        fileName = sanitizedFileName
        filePath = `${userFolder}/${timestamp}_${sanitizedFileName}`

        const { error: uploadError } = await supabase.storage
          .from('nis2-documents')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Napaka pri nalaganju datoteke: ${uploadError.message}`)
        }
      }

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Prepare documentation data
      const documentationData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        document_type: formData.document_type,
        file_name: fileName,
        file_path: filePath,
        file_size: selectedFile ? selectedFile.size : (documentation?.file_size || 0),
        uploaded_by: user.id,
        category: formData.category.trim() || null,
        tags: tags.length > 0 ? tags : null,
        is_confidential: formData.is_confidential,
        version: formData.version.trim() || null,
        status: formData.status
      }

      let result
      if (documentation) {
        // Update existing documentation
        result = await supabase
          .from('nis2_documentation')
          .update(documentationData)
          .eq('id', documentation.id)
      } else {
        // Create new documentation
        result = await supabase
          .from('nis2_documentation')
          .insert([documentationData])
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error saving documentation:', error)
      setError(error.message || 'Prišlo je do napake pri shranjevanju dokumenta.')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  const modalTitle = documentation ? 'Uredi dokument' : 'Dodaj nov dokument'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-heading-lg font-semibold text-text-primary">
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-risk-high/15 border border-risk-high/30 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0" />
              <span className="text-text-primary">{error}</span>
            </div>
          )}

          {/* File Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-primary">
              Datoteka {!documentation && '*'}
            </label>
            
            {!documentation && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-accent-primary bg-accent-primary/5' 
                    : 'border-border-subtle hover:border-border-medium'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-accent-primary mx-auto" />
                    <div className="text-text-primary font-medium">{selectedFile.name}</div>
                    <div className="text-text-secondary text-sm">
                      Velikost: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        fileInputRef.current?.click()
                      }}
                      className="text-accent-primary hover:text-accent-primary/80 text-sm"
                    >
                      Zamenjaj datoteko
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-8 h-8 text-text-tertiary mx-auto" />
                    <div>
                      <div className="text-text-primary font-medium mb-2">
                        Povlecite datoteko sem ali kliknite za izbiro
                      </div>
                      <div className="text-text-secondary text-sm">
                        Podprti formati: PDF, DOC, DOCX, XLS, XLSX, CSV (max 50MB)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Izberi datoteko
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Naslov *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="Vnesite naslov dokumenta"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary resize-none"
                placeholder="Kratek opis dokumenta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tip dokumenta
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => handleInputChange('document_type', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Kategorija
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="npr. Politike, Postopki, Evidence"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Oznake (ločene z vejico)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="npr. varnost, GDPR, upravljanje"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Verzija
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="npr. v1.0, 2024-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.is_confidential}
                  onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                  className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary focus:ring-2"
                />
                <span className="text-text-primary">Zaupni dokument</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={uploading}
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Shranjevanje...
                </>
              ) : (
                documentation ? 'Posodobi' : 'Shrani'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}