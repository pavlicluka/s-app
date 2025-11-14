import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { X, ChevronLeft, ChevronRight, User, Calendar, BookOpen, Award, CheckCircle } from 'lucide-react'

interface GDPRUsposabljanjaEvidenceAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editMode?: boolean
  editRecord?: any
}

export default function GDPRUsposabljanjaEvidenceAddModal({ 
  isOpen, 
  onClose, 
  onSave,
  editMode = false,
  editRecord = null
}: GDPRUsposabljanjaEvidenceAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)

  const [formData, setFormData] = useState(() => {
    if (editMode && editRecord) {
      return {
        // Osnovni podatki udeleženca
        participant_name: editRecord.participant_name || '',
        participant_email: editRecord.participant_email || '',
        participant_department: editRecord.participant_department || '',
        
        // Podatki o usposabljanju
        training_title: editRecord.training_title || '',
        training_type: editRecord.training_type || 'gdpr_basic',
        training_date: editRecord.training_date || '',
        training_duration: editRecord.training_duration || 0,
        training_location: editRecord.training_location || '',
        training_format: editRecord.training_format || 'online',
        training_provider: editRecord.training_provider || '',
        training_cost: editRecord.training_cost || 0,
        
        // Inštruktor
        instructor_name: editRecord.instructor_name || '',
        instructor_email: editRecord.instructor_email || '',
        
        // Status dokončanja
        completion_status: editRecord.completion_status || 'planned',
        completion_date: editRecord.completion_date || '',
        
        // Certifikat
        certificate_issued: editRecord.certificate_issued || false,
        certificate_number: editRecord.certificate_number || '',
        certificate_date: editRecord.certificate_date || '',
        certificate_expiry_date: editRecord.certificate_expiry_date || '',
        
        // Ocena
        assessment_type: editRecord.assessment_type || 'none',
        assessment_score: editRecord.assessment_score || 0,
        passed: editRecord.passed || false,
        
        // Vsebina usposabljanja
        training_goals: editRecord.training_goals || '',
        key_topics_covered: editRecord.key_topics_covered || '',
        practical_applications: editRecord.practical_applications || '',
        
        // Sledenje
        follow_up_required: editRecord.follow_up_required || false,
        follow_up_date: editRecord.follow_up_date || '',
        follow_up_description: editRecord.follow_up_description || '',
        
        // GDPR specifično
        dpo_specific_training: editRecord.dpo_specific_training || false,
        dpo_training_content: editRecord.dpo_training_content || '',
        supervisory_authority_contact: editRecord.supervisory_authority_contact || '',
        
        // Skladnost
        compliance_category: editRecord.compliance_category || '',
        legal_requirement: editRecord.legal_requirement || '',
        training_frequency: editRecord.training_frequency || '',
        last_training_date: editRecord.last_training_date || '',
        next_training_due: editRecord.next_training_due || '',
        
        // Dokumentacija
        training_materials_url: editRecord.training_materials_url || '',
        attendance_sheet_url: editRecord.attendance_sheet_url || '',
        certificate_url: editRecord.certificate_url || '',
        additional_documents: editRecord.additional_documents || '',
        
        // Status
        status: editRecord.status || 'active',
        verification_status: editRecord.verification_status || 'pending',
        verified_by: editRecord.verified_by || '',
        verification_date: editRecord.verification_date || '',
        notes: editRecord.notes || '',
        organization_id: editRecord.organization_id || ''
      }
    } else {
      return {
        // Osnovni podatki udeleženca
        participant_name: '',
        participant_email: '',
        participant_department: '',
        
        // Podatki o usposabljanju
        training_title: '',
        training_type: 'gdpr_basic',
        training_date: '',
        training_duration: 0,
        training_location: '',
        training_format: 'online',
        training_provider: '',
        training_cost: 0,
        
        // Inštruktor
        instructor_name: '',
        instructor_email: '',
        
        // Status dokončanja
        completion_status: 'planned',
        completion_date: '',
        
        // Certifikat
        certificate_issued: false,
        certificate_number: '',
        certificate_date: '',
        certificate_expiry_date: '',
        
        // Ocena
        assessment_type: 'none',
        assessment_score: 0,
        passed: false,
        
        // Vsebina usposabljanja
        training_goals: '',
        key_topics_covered: '',
        practical_applications: '',
        
        // Sledenje
        follow_up_required: false,
        follow_up_date: '',
        follow_up_description: '',
        
        // GDPR specifično
        dpo_specific_training: false,
        dpo_training_content: '',
        supervisory_authority_contact: '',
        
        // Skladnost
        compliance_category: '',
        legal_requirement: '',
        training_frequency: '',
        last_training_date: '',
        next_training_due: '',
        
        // Dokumentacija
        training_materials_url: '',
        attendance_sheet_url: '',
        certificate_url: '',
        additional_documents: '',
        
        // Status
        status: 'active',
        verification_status: 'pending',
        verified_by: '',
        verification_date: '',
        notes: '',
        organization_id: ''
      }
    }
  })

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
        
        // Update form data with organization_id for new records only
        if (!editMode && data.organization_id) {
          setFormData(prev => ({
            ...prev,
            organization_id: data.organization_id
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user, isOpen, editMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {}
    
    if (currentStep === 1) {
      if (!formData.participant_name.trim()) {
        errors.participant_name = 'Ime udeleženca je obvezno'
      }
      if (!formData.training_title.trim()) {
        errors.training_title = 'Naslov usposabljanja je obvezen'
      }
      if (!formData.training_date) {
        errors.training_date = 'Datum usposabljanja je obvezen'
      }
      if (formData.training_duration <= 0) {
        errors.training_duration = 'Trajanje mora biti večje od 0'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(4, prev + 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCurrentStep()) {
      return
    }

    setSaving(true)
    try {
      let error
      
      // Validate organization context
      if (!editMode && !userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }
      
      if (editMode && editRecord) {
        // Update existing record
        const updateData = {
          ...formData,
          // Only update organization_id if user has one and record doesn't
          ...(userProfile?.organization_id && !editRecord.organization_id && {
            organization_id: userProfile.organization_id
          })
        }
        
        const result = await supabase
          .from('gdpr_training_evidence')
          .update(updateData)
          .eq('id', editRecord.id)
        error = result.error
      } else {
        // Insert new record with organization_id
        const insertData = {
          ...formData,
          organization_id: userProfile.organization_id
        }
        
        const result = await supabase
          .from('gdpr_training_evidence')
          .insert([insertData])
        error = result.error
      }
      
      if (error) throw error
      
      onSave()
    } catch (error) {
      console.error('Error saving training evidence:', error)
      if (error instanceof Error && error.message.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + error.message)
      } else {
        alert('Napaka pri shranjevanju evidence usposabljanja')
      }
    } finally {
      setSaving(false)
    }
  }

  const trainingTypeOptions = [
    { value: 'gdpr_basic', label: 'GDPR Osnovno' },
    { value: 'gdpr_advanced', label: 'GDPR Napredno' },
    { value: 'zvop2', label: 'ZVOP-2' },
    { value: 'security_awareness', label: 'Varnostna ozaveščenost' },
    { value: 'data_breach_response', label: 'Odziv na kršitve podatkov' },
    { value: 'privacy_by_design', label: 'Varstvo podatkov po zasnovi' },
    { value: 'other', label: 'Drugo' }
  ]

  const completionStatusOptions = [
    { value: 'planned', label: 'Načrtovano' },
    { value: 'in_progress', label: 'V teku' },
    { value: 'completed', label: 'Zaključeno' },
    { value: 'failed', label: 'Neuspešno' },
    { value: 'cancelled', label: 'Preklicano' }
  ]

  const assessmentTypeOptions = [
    { value: 'none', label: 'Brez ocenjevanja' },
    { value: 'quiz', label: 'Kviz' },
    { value: 'practical', label: 'Praktična naloga' },
    { value: 'exam', label: 'Izpit' },
    { value: 'project', label: 'Projekt' }
  ]

  const trainingFormatOptions = [
    { value: 'online', label: 'Spletno' },
    { value: 'in_person', label: 'V živo' },
    { value: 'hybrid', label: 'Hibridno' },
    { value: 'self_study', label: 'Samostojno učenje' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {editMode ? 'Uredi evidenco usposabljanja' : 'Dodaj novo usposabljanje'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Osnovni podatki</span>
            <span>Usposabljanje</span>
            <span>Certifikat</span>
            <span>Skladnost</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Osnovni podatki */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Osnovni podatki</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ime udeleženca *
                  </label>
                  <input
                    type="text"
                    name="participant_name"
                    value={formData.participant_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.participant_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Janez Novak"
                  />
                  {validationErrors.participant_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.participant_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-pošta udeleženca
                  </label>
                  <input
                    type="email"
                    name="participant_email"
                    value={formData.participant_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="janez.novak@podjetje.si"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oddelek
                  </label>
                  <input
                    type="text"
                    name="participant_department"
                    value={formData.participant_department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IT oddelek"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip usposabljanja *
                  </label>
                  <select
                    name="training_type"
                    value={formData.training_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {trainingTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naslov usposabljanja *
                  </label>
                  <input
                    type="text"
                    name="training_title"
                    value={formData.training_title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.training_title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="GDPR osnove za zaposlene"
                  />
                  {validationErrors.training_title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.training_title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum usposabljanja *
                  </label>
                  <input
                    type="date"
                    name="training_date"
                    value={formData.training_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.training_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.training_date && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.training_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trajanje (minute) *
                  </label>
                  <input
                    type="number"
                    name="training_duration"
                    value={formData.training_duration}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.training_duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="120"
                  />
                  {validationErrors.training_duration && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.training_duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format usposabljanja
                  </label>
                  <select
                    name="training_format"
                    value={formData.training_format}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {trainingFormatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokacija usposabljanja
                  </label>
                  <input
                    type="text"
                    name="training_location"
                    value={formData.training_location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Konferenčna dvorana A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ponudnik usposabljanja
                  </label>
                  <input
                    type="text"
                    name="training_provider"
                    value={formData.training_provider}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zunanje podjetje ABC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ime inštruktorja
                  </label>
                  <input
                    type="text"
                    name="instructor_name"
                    value={formData.instructor_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Marija Kranjc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-pošta inštruktorja
                  </label>
                  <input
                    type="email"
                    name="instructor_email"
                    value={formData.instructor_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="marija.kranjc@abc.si"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Status in ocena */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Status in ocena</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status dokončanja
                  </label>
                  <select
                    name="completion_status"
                    value={formData.completion_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {completionStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum dokončanja
                  </label>
                  <input
                    type="date"
                    name="completion_date"
                    value={formData.completion_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip ocenjevanja
                  </label>
                  <select
                    name="assessment_type"
                    value={formData.assessment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {assessmentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocena (%)
                  </label>
                  <input
                    type="number"
                    name="assessment_score"
                    value={formData.assessment_score}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="passed"
                      checked={formData.passed}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Uspešno opravljeno
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cilji usposabljanja
                  </label>
                  <textarea
                    name="training_goals"
                    value={formData.training_goals}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Opis ciljev, ki naj bi jih udeleženec dosegel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ključne teme
                  </label>
                  <textarea
                    name="key_topics_covered"
                    value={formData.key_topics_covered}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seznam ključnih tem, ki so bile obravnavane..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Praktična uporaba
                  </label>
                  <textarea
                    name="practical_applications"
                    value={formData.practical_applications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Opis praktičnih primerov in aplikacij..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Certifikat */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Certifikat in sledenje</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="certificate_issued"
                    checked={formData.certificate_issued}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Certifikat je bil izdan
                  </label>
                </div>

                {formData.certificate_issued && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Številka certifikata
                      </label>
                      <input
                        type="text"
                        name="certificate_number"
                        value={formData.certificate_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CERT-2024-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum izdaje
                      </label>
                      <input
                        type="date"
                        name="certificate_date"
                        value={formData.certificate_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum poteka
                      </label>
                      <input
                        type="date"
                        name="certificate_expiry_date"
                        value={formData.certificate_expiry_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="follow_up_required"
                    checked={formData.follow_up_required}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Zahtevano je nadaljnje usposabljanje
                  </label>
                </div>

                {formData.follow_up_required && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum nadaljnjega usposabljanja
                      </label>
                      <input
                        type="date"
                        name="follow_up_date"
                        value={formData.follow_up_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opis nadaljnjega usposabljanja
                      </label>
                      <input
                        type="text"
                        name="follow_up_description"
                        value={formData.follow_up_description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Letno osvežitveno usposabljanje"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Skladnost */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">GDPR skladnost in dodatne informacije</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="dpo_specific_training"
                    checked={formData.dpo_specific_training}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    DPO-specifično usposabljanje (GDPR člen 39)
                  </label>
                </div>

                {formData.dpo_specific_training && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vsebina DPO usposabljanja
                    </label>
                    <textarea
                      name="dpo_training_content"
                      value={formData.dpo_training_content}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Specifične teme za DPO usposabljanje..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorija skladnosti
                    </label>
                    <input
                      type="text"
                      name="compliance_category"
                      value={formData.compliance_category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="GDPR člen 39, člen 47..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pravna zahteva
                    </label>
                    <input
                      type="text"
                      name="legal_requirement"
                      value={formData.legal_requirement}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="GDPR člen 47 - Prenos podatkov"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pogostost usposabljanja
                    </label>
                    <input
                      type="text"
                      name="training_frequency"
                      value={formData.training_frequency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Letno, na 2 leti..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Naslednje usposabljanje
                    </label>
                    <input
                      type="date"
                      name="next_training_due"
                      value={formData.next_training_due}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opombe
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dodatne opombe ali komentarji..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prejšnja
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Prekliči
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  Naslednja
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? 'Shranjujem...' : (editMode ? 'Posodobi' : 'Shrani')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}