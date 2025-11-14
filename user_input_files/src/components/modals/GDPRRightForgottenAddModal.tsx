import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface GDPRRightForgottenAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editMode?: boolean
  editRecord?: any
}

export default function GDPRRightForgottenAddModal({ isOpen, onClose, onSave, editMode = false, editRecord = null }: GDPRRightForgottenAddModalProps) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState(() => {
    if (editMode && editRecord) {
      return {
        // Osnovna identifikacija
        request_id: editRecord.request_id || `GDPR-${Date.now()}`,
        subject_name: editRecord.subject_name || '',
        subject_email: editRecord.subject_email || '',
        subject_phone: editRecord.subject_phone || '',
        subject_address: editRecord.subject_address || '',
        subject_birth_date: editRecord.subject_birth_date || '',
        subject_type: editRecord.subject_type || 'individual',
        
        // Verifikacija identitete
        identity_verification_status: editRecord.identity_verification_status || 'unverified',
        identity_document_type: editRecord.identity_document_type || '',
        identity_document_number: editRecord.identity_document_number || '',
        identity_document_issued: editRecord.identity_document_issued || '',
        identity_document_valid_until: editRecord.identity_document_valid_until || '',
        
        // GDPR člen 17(1) pravne podlage
        legal_basis_17_a: editRecord.legal_basis_17_a || false,
        legal_basis_17_b: editRecord.legal_basis_17_b || false,
        legal_basis_17_c: editRecord.legal_basis_17_c || false,
        legal_basis_17_d: editRecord.legal_basis_17_d || false,
        legal_basis_17_e: editRecord.legal_basis_17_e || false,
        legal_basis_17_f: editRecord.legal_basis_17_f || false,
        legal_basis_description: editRecord.legal_basis_description || '',
        
        // Kategorije in opis podatkov
        data_categories: editRecord.data_categories || [],
        data_description: editRecord.data_description || '',
        data_processing_period_from: editRecord.data_processing_period_from || '',
        data_processing_period_to: editRecord.data_processing_period_to || '',
        data_system_location: editRecord.data_system_location || '',
        data_processing_type: editRecord.data_processing_type || 'automatic',
        
        // ZVOP-2 specifična polja
        organization_type: editRecord.organization_type || 'private_sector',
        organization_id: editRecord.organization_id || '',
        contact_person: editRecord.contact_person || '',
        data_processing_log: editRecord.data_processing_log || false,
        risk_assessment: editRecord.risk_assessment || 'low',
        dpo_notified: editRecord.dpo_notified || false,
        ip_guidelines_compliance: editRecord.ip_guidelines_compliance !== false,
        
        // Datum in status
        request_date: editRecord.request_date || new Date().toISOString(),
        status: editRecord.status || 'received',
        notes: editRecord.notes || '',
        
        // Rokovnik (avtomatsko izračunano)
        deadline_days: editRecord.deadline_days || 30,
        response_deadline: editRecord.response_deadline || '',
        
        // Izjeme
        exceptions_applied: editRecord.exceptions_applied || [],
        rejection_reason: editRecord.rejection_reason || ''
      }
    }
    
    return {
      // Osnovna identifikacija
      request_id: `GDPR-${Date.now()}`,
      subject_name: '',
      subject_email: '',
      subject_phone: '',
      subject_address: '',
      subject_birth_date: '',
      subject_type: 'individual',
      
      // Verifikacija identitete
      identity_verification_status: 'unverified',
      identity_document_type: '',
      identity_document_number: '',
      identity_document_issued: '',
      identity_document_valid_until: '',
      
      // GDPR člen 17(1) pravne podlage
      legal_basis_17_a: false, // Podatki niso več potrebni
      legal_basis_17_b: false, // Preklic soglasja
      legal_basis_17_c: false, // Nasprotovanje obdelavi
      legal_basis_17_d: false, // Nezakonita obdelava
      legal_basis_17_e: false, // Pravna obveznost izbrisanja
      legal_basis_17_f: false, // Otrokovi podatki
      legal_basis_description: '',
      
      // Kategorije in opis podatkov
      data_categories: [] as string[],
      data_description: '',
      data_processing_period_from: '',
      data_processing_period_to: '',
      data_system_location: '',
      data_processing_type: 'automatic',
      
      // ZVOP-2 specifična polja
      organization_type: 'private_sector',
      organization_id: '',
      contact_person: '',
      data_processing_log: false,
      risk_assessment: 'low',
      dpo_notified: false,
      ip_guidelines_compliance: true,
      
      // Datum in status
      request_date: new Date().toISOString(),
      status: 'received',
      notes: '',
      
      // Rokovnik (avtomatsko izračunano)
      deadline_days: 30,
      response_deadline: '',
      
      // Izjeme
      exceptions_applied: [] as string[],
      rejection_reason: ''
    }
  })

  
  // Izračun rokovnika na podlagi tipa organizacije
  const calculateDeadline = (orgType: string) => {
    const days = orgType === 'public_sector' ? 15 : 30
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + days)
    setFormData(prev => ({
      ...prev,
      deadline_days: days,
      response_deadline: deadline.toISOString()
    }))
  }

  // Koraki obrazca
  const steps = [
    { id: 1, title: 'Identifikacija in kontakt', required: ['subject_name', 'subject_email', 'subject_address'] },
    { id: 2, title: 'Verifikacija identitete', required: ['identity_document_type'] },
    { id: 3, title: 'Pravna podlaga za izbris', required: ['legal_basis_description'] },
    { id: 4, title: 'Opis podatkov za izbris', required: ['data_categories', 'data_description'] },
    { id: 5, title: 'Potrditev in dodatne informacije', required: [] }
  ]

  // Validacija trenutnega koraka
  const validateCurrentStep = (): boolean => {
    const currentStepData = steps[currentStep - 1]
    const errors: Record<string, string> = {}
    
    currentStepData.required.forEach(field => {
      if (field === 'data_categories') {
        if (formData.data_categories.length === 0) {
          errors[field] = 'Izberite vsaj eno kategorijo podatkov'
        }
      } else if (!formData[field as keyof typeof formData] || 
                 (typeof formData[field as keyof typeof formData] === 'string' && 
                  (formData[field as keyof typeof formData] as string).trim() === '')) {
        errors[field] = 'To polje je obvezno'
      }
    })

    // Dodatne validacije po korakih
    if (currentStep === 2 && selectedFiles.length === 0) {
      errors['identity_files'] = 'Priložite vsaj en identifikacijski dokument'
    }
    
    if (currentStep === 3) {
      const legalBasisSelected = Object.keys(formData).some(key => 
        key.startsWith('legal_basis_17_') && formData[key as keyof typeof formData]
      )
      if (!legalBasisSelected) {
        errors['legal_basis'] = 'Izberite vsaj eno pravno podlago'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Nalaganje datotek
  const uploadFiles = async (files: File[]): Promise<{ url: string; name: string; size: number }[]> => {
    const uploadedFiles = []
    
    for (const file of files) {
      if (file.size > 10485760) { // 10MB max
        alert(`Datoteka ${file.name} je prevelika (max 10MB)`)
        continue
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `identity-docs/${fileName}`

      try {
        const { data, error } = await supabase.storage
          .from('gdpr-attachments')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('gdpr-attachments')
          .getPublicUrl(filePath)

        uploadedFiles.push({
          url: publicUrl,
          name: file.name,
          size: file.size
        })
      } catch (error) {
        console.error('Napaka pri nalaganju datoteke:', error)
        alert(`Napaka pri nalaganju datoteke ${file.name}`)
      }
    }
    
    return uploadedFiles
  }

  // Pošiljanje obrazca
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep < steps.length) {
      // Preveri trenutni korak in pojdi na naslednji
      if (validateCurrentStep()) {
        setCurrentStep(prev => prev + 1)
        
        // Avtomatski izračun rokovnika ob prehodu na zadnji korak
        if (currentStep === steps.length - 1) {
          calculateDeadline(formData.organization_type)
        }
      }
      return
    }

    // Končno pošiljanje (korak 5)
    setSaving(true)

    try {
      // Naložimo datoteke
      const uploadedFiles = await uploadFiles(selectedFiles)
      
      // Pripravimo podatke za bazo
      const submissionData = {
        ...formData,
        // Upravljanje z datotekami
        ...(uploadedFiles.length > 0 && {
          file_url: uploadedFiles[0].url,
          file_name: uploadedFiles[0].name,
          file_size: uploadedFiles[0].size,
        }),
        // Avtomatsko nastavi status verifikacije če so naloženi dokumenti
        identity_verification_status: uploadedFiles.length > 0 ? 'pending' : 'unverified',
      }

      if (editMode && editRecord) {
        // Urejanje obstoječega zapisa
        const { error } = await supabase
          .from('gdpr_right_forgotten')
          .update(submissionData)
          .eq('id', editRecord.id)

        if (error) throw error
      } else {
        // Dodajanje novega zapisa
        const { error } = await supabase
          .from('gdpr_right_forgotten')
          .insert([submissionData])

        if (error) throw error
      }
      
      onSave()
      onClose()
      if (!editMode) resetForm() // Reset samo pri dodajanju, ne pri urejanju
    } catch (error) {
      console.error('Napaka pri shranjevanju:', error)
      alert('Napaka pri shranjevanju zahtevka. Poskusite znova.')
    } finally {
      setSaving(false)
    }
  }

  // Navigacija korakov
  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Resetiranje obrazca
  const resetForm = () => {
    setCurrentStep(1)
    setSelectedFiles([])
    setValidationErrors({})
    setFormData({
      request_id: `GDPR-${Date.now()}`,
      subject_name: '',
      subject_email: '',
      subject_phone: '',
      subject_address: '',
      subject_birth_date: '',
      subject_type: 'individual',
      identity_verification_status: 'unverified',
      identity_document_type: '',
      identity_document_number: '',
      identity_document_issued: '',
      identity_document_valid_until: '',
      legal_basis_17_a: false,
      legal_basis_17_b: false,
      legal_basis_17_c: false,
      legal_basis_17_d: false,
      legal_basis_17_e: false,
      legal_basis_17_f: false,
      legal_basis_description: '',
      data_categories: [],
      data_description: '',
      data_processing_period_from: '',
      data_processing_period_to: '',
      data_system_location: '',
      data_processing_type: 'automatic',
      organization_type: 'private_sector',
      organization_id: '',
      contact_person: '',
      data_processing_log: false,
      risk_assessment: 'low',
      dpo_notified: false,
      ip_guidelines_compliance: true,
      request_date: new Date().toISOString(),
      status: 'received',
      notes: '',
      deadline_days: 30,
      response_deadline: '',
      exceptions_applied: [],
      rejection_reason: ''
    })
  }

  // Posodobitev posameznega polja
  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Avtomatski izračun rokovnika če se spremeni tip organizacije
    if (key === 'organization_type') {
      calculateDeadline(value)
    }
  }

  // Rokovanje z datotekami
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <h2 className="text-h3 text-text-primary">{editMode ? 'Uredi zahtevo za pozabo' : 'Zahteva za pozabo osebnih podatkov'}</h2>
            <p className="text-sm text-text-secondary mt-1">
              Korak {currentStep} od {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${currentStep > step.id 
                    ? 'bg-status-success text-white' 
                    : currentStep === step.id 
                      ? 'bg-accent-primary text-white' 
                      : 'bg-bg-near-black text-text-secondary border border-border-subtle'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 transition-colors
                    ${currentStep > step.id ? 'bg-status-success' : 'bg-border-subtle'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Korak 1: Identifikacija in kontakt */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Identifikacija in kontaktni podatki</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Ime in priimek <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject_name}
                    onChange={(e) => handleChange('subject_name', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  {validationErrors.subject_name && (
                    <p className="text-status-error text-xs mt-1">{validationErrors.subject_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email naslov <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.subject_email}
                    onChange={(e) => handleChange('subject_email', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  {validationErrors.subject_email && (
                    <p className="text-status-error text-xs mt-1">{validationErrors.subject_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Telefonska številka
                  </label>
                  <input
                    type="tel"
                    value={formData.subject_phone}
                    onChange={(e) => handleChange('subject_phone', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Tip posameznika
                  </label>
                  <select
                    value={formData.subject_type}
                    onChange={(e) => handleChange('subject_type', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="individual">Fizična oseba</option>
                    <option value="legal_representative">Predstavnik pravne osebe</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Naslov prebivališča <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject_address}
                    onChange={(e) => handleChange('subject_address', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  {validationErrors.subject_address && (
                    <p className="text-status-error text-xs mt-1">{validationErrors.subject_address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Datum rojstva
                  </label>
                  <input
                    type="date"
                    value={formData.subject_birth_date}
                    onChange={(e) => handleChange('subject_birth_date', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Korak 2: Verifikacija identitete */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Verifikacija identitete</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Tip identifikacijskega dokumenta <span className="text-status-error">*</span>
                  </label>
                  <select
                    required
                    value={formData.identity_document_type}
                    onChange={(e) => handleChange('identity_document_type', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Izberite dokument</option>
                    <option value="identity_card">Osebna izkaznica</option>
                    <option value="passport">Potni list</option>
                    <option value="drivers_license">Vozniško dovoljenje</option>
                    <option value="other">Drugo</option>
                  </select>
                  {validationErrors.identity_document_type && (
                    <p className="text-status-error text-xs mt-1">{validationErrors.identity_document_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Številka dokumenta (delno skrita)
                  </label>
                  <input
                    type="text"
                    value={formData.identity_document_number}
                    onChange={(e) => handleChange('identity_document_number', e.target.value)}
                    placeholder="Zadnje 4 številke"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Datum izdaje
                  </label>
                  <input
                    type="date"
                    value={formData.identity_document_issued}
                    onChange={(e) => handleChange('identity_document_issued', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Datum veljavnosti
                  </label>
                  <input
                    type="date"
                    value={formData.identity_document_valid_until}
                    onChange={(e) => handleChange('identity_document_valid_until', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Identifikacijski dokumenti <span className="text-status-error">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accent-primary file:text-white hover:file:bg-accent-primary-hover"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Priložite fotografijo ali sken identifikacijskega dokumenta (PDF, JPG, PNG)
                </p>
                {validationErrors.identity_files && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.identity_files}</p>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-bg-near-black rounded">
                        <span className="text-sm text-text-primary flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-status-error hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Korak 3: Pravna podlaga za izbris */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Pravna podlaga za izbris (GDPR člen 17)</h3>
              
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Izberite razlog(e) za izbris osebnih podatkov v skladu z GDPR členom 17(1):
                </p>

                {[
                  { key: 'legal_basis_17_a', text: 'a) Podatki niso več potrebni za namene, za katere so bili zbrani' },
                  { key: 'legal_basis_17_b', text: 'b) Posameznik prekliče soglasje in ni druge pravne podlage' },
                  { key: 'legal_basis_17_c', text: 'c) Posameznik nasprotuje obdelavi na podlagi zakonitega interesa' },
                  { key: 'legal_basis_17_d', text: 'd) Osebni podatki so bili obdelani nezakonito' },
                  { key: 'legal_basis_17_e', text: 'e) Osebni podatki morajo biti izbrisani zaradi pravne obveznosti' },
                  { key: 'legal_basis_17_f', text: 'f) Otrokovi osebni podatki, zbrani v povezavi z informacijskimi storitvami' }
                ].map((basis) => (
                  <label key={basis.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[basis.key as keyof typeof formData] as boolean}
                      onChange={(e) => handleChange(basis.key, e.target.checked)}
                      className="mt-1 w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">{basis.text}</span>
                  </label>
                ))}

                {validationErrors.legal_basis && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.legal_basis}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Podroben opis razloga za izbris <span className="text-status-error">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.legal_basis_description}
                  onChange={(e) => handleChange('legal_basis_description', e.target.value)}
                  placeholder="Opišite zakaj zahtevate izbris vaših osebnih podatkov..."
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                />
                {validationErrors.legal_basis_description && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.legal_basis_description}</p>
                )}
              </div>
            </div>
          )}

          {/* Korak 4: Opis podatkov za izbris */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Opis podatkov za izbris</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Kategorije podatkov <span className="text-status-error">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Kontaktni podatki',
                    'Demografski podatki', 
                    'Podatki o zdravju',
                    'Finančni podatki',
                    'Tehnični podatki',
                    'Podatki o dejavnosti',
                    'Ostalo'
                  ].map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.data_categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('data_categories', [...formData.data_categories, category])
                          } else {
                            handleChange('data_categories', formData.data_categories.filter(c => c !== category))
                          }
                        }}
                        className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary"
                      />
                      <span className="text-sm text-text-primary">{category}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.data_categories && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.data_categories}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Obdobje obdelave - od
                  </label>
                  <input
                    type="date"
                    value={formData.data_processing_period_from}
                    onChange={(e) => handleChange('data_processing_period_from', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Obdobje obdelave - do
                  </label>
                  <input
                    type="date"
                    value={formData.data_processing_period_to}
                    onChange={(e) => handleChange('data_processing_period_to', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sistem/baza kjer se podatki nahajajo
                  </label>
                  <input
                    type="text"
                    value={formData.data_system_location}
                    onChange={(e) => handleChange('data_system_location', e.target.value)}
                    placeholder="npr. CRM sistem, spletna stran, ..."
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Vrsta obdelave
                  </label>
                  <select
                    value={formData.data_processing_type}
                    onChange={(e) => handleChange('data_processing_type', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="automatic">Avtomatska</option>
                    <option value="manual">Ročna</option>
                    <option value="both">Oboje</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Specifičen opis podatkov <span className="text-status-error">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.data_description}
                  onChange={(e) => handleChange('data_description', e.target.value)}
                  placeholder="Podrobno opišite katere osebne podatke zahtevate za izbris..."
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                />
                {validationErrors.data_description && (
                  <p className="text-status-error text-xs mt-1">{validationErrors.data_description}</p>
                )}
              </div>
            </div>
          )}

          {/* Korak 5: Potrditev in dodatne informacije */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Potrditev in dodatne informacije</h3>
              
              {/* ZVOP-2 specifična polja */}
              <div className="space-y-4 p-4 bg-bg-near-black rounded-lg">
                <h4 className="font-medium text-text-primary">ZVOP-2 informacije (Slovenija)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Tip organizacije
                    </label>
                    <select
                      value={formData.organization_type}
                      onChange={(e) => handleChange('organization_type', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                    >
                      <option value="private_sector">Zasebni sektor (30 dni)</option>
                      <option value="public_sector">Javni sektor (15 dni)</option>
                      <option value="government">Državni organ (15 dni)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Ocena tveganja
                    </label>
                    <select
                      value={formData.risk_assessment}
                      onChange={(e) => handleChange('risk_assessment', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                    >
                      <option value="low">Nizko tveganje</option>
                      <option value="medium">Srednje tveganje</option>
                      <option value="high">Visoko tveganje</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Matična številka organizacije
                    </label>
                    <input
                      type="text"
                      value={formData.organization_id}
                      onChange={(e) => handleChange('organization_id', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Kontaktna oseba
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleChange('contact_person', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.data_processing_log}
                      onChange={(e) => handleChange('data_processing_log', e.target.checked)}
                      className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">Vodenje dnevnika obdelave (člen 22 ZVOP-2)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ip_guidelines_compliance}
                      onChange={(e) => handleChange('ip_guidelines_compliance', e.target.checked)}
                      className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">Skladnost z IP smernicami</span>
                  </label>
                </div>
              </div>

              {/* Povzetek zahteve */}
              <div className="space-y-4 p-4 bg-bg-near-black rounded-lg">
                <h4 className="font-medium text-text-primary">Povzetek zahteve</h4>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Zahtevek za podporo:</strong> {formData.request_id}</div>
                  <div><strong>Ime:</strong> {formData.subject_name}</div>
                  <div><strong>Email:</strong> {formData.subject_email}</div>
                  <div><strong>Kategorije podatkov:</strong> {formData.data_categories.join(', ')}</div>
                  <div><strong>Rok za odgovor:</strong> {formData.deadline_days} dni</div>
                  <div><strong>Priloženi dokumenti:</strong> {selectedFiles.length} datoteka(e)</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Dodatne opombe
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Dodatne informacije ali opombe..."
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-text-primary">
                    <p className="font-medium mb-1">Pomembno obvestilo:</p>
                    <p>Z oddajo te zahteve potrjujete, da so vsi navedeni podatki resnični in da imate pravico zahtevati izbris navedenih osebnih podatkov. Zahteva bo obravnavana v zakonsko določenem roku.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigacijski gumbi */}
          <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Nazaj
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
              >
                Prekliči
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors duration-150"
                >
                  Naprej
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-status-success text-white rounded hover:bg-green-600 transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? 'Pošiljam...' : (editMode ? 'Posodobi zahtevo' : 'Pošlji zahtevo')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}