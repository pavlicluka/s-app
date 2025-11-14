import React, { useState, useEffect } from 'react'
import { 
  X, 
  FileText, 
  Upload, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Shield,
  Users,
  Database,
  Lock,
  Globe,
  Scale,
  FileCheck,
  AlertCircle,
  Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from 'react-i18next'

interface GDPRDPIAAdvancedModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Risk Matrix types
interface RiskMatrixCell {
  probability: number
  severity: number
  level: 'low' | 'medium' | 'high' | 'critical'
  color: string
}

// Form data interface
interface DPIAFormData {
  // Step 1: Project Overview
  assessment_id: string
  project_name: string
  project_description: string
  project_purpose: string
  lawful_basis: string
  lawful_basis_details: string
  dpo_involved: boolean
  dpo_consultation_date: string
  dpo_opinion: string
  
  // Step 2: Data Processing Details
  data_types: string[]
  special_categories: boolean
  special_categories_details: string
  criminal_data: boolean
  criminal_data_details: string
  data_subjects: string[]
  data_sources: string[]
  processing_purposes: string[]
  data_recipients: string[]
  third_country_transfers: boolean
  third_country_details: string
  
  // Step 3: Necessity & Proportionality
  necessity_assessment: string
  alternatives_considered: string
  data_minimization_measures: string
  storage_limitation: string
  impact_on_rights: string
  
  // Step 4: Risk Assessment
  risk_scenarios: string[]
  risk_probability: number[]
  risk_severity: number[]
  risk_mitigation_measures: string[]
  residual_risk_levels: string[]
  
  // Step 5: Compliance & Monitoring
  technical_measures: string[]
  organizational_measures: string[]
  privacy_by_design: boolean
  privacy_by_default: boolean
  rights_mechanisms: string[]
  monitoring_plan: string
  review_schedule: string
  
  // ZVOP-2 specific fields
  zvop2_research_purposes: boolean
  zvop2_research_elaborate: string
  zvop2_video_surveillance: boolean
  zvop2_surveillance_details: string
  zvop2_data_pooling: boolean
  zvop2_pooling_details: string
  processing_logs_required: boolean
  special_security_measures: boolean
  special_security_details: string
  
  // General fields
  assessment_date: string
  completion_date: string
  status: 'draft' | 'in_review' | 'approved' | 'rejected'
  approval_authority: string
  approval_date: string
  ip_consultation_required: boolean
  ip_consultation_date: string
  ip_response: string
  
  // File attachments
  attachments: Array<{ name: string; url: string; type: string }>
}

const GDPRDPIAAdvancedModal: React.FC<GDPRDPIAAdvancedModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [contextValidation, setContextValidation] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<DPIAFormData>({
    assessment_id: '',
    project_name: '',
    project_description: '',
    project_purpose: '',
    lawful_basis: '',
    lawful_basis_details: '',
    dpo_involved: false,
    dpo_consultation_date: '',
    dpo_opinion: '',
    data_types: [],
    special_categories: false,
    special_categories_details: '',
    criminal_data: false,
    criminal_data_details: '',
    data_subjects: [],
    data_sources: [],
    processing_purposes: [],
    data_recipients: [],
    third_country_transfers: false,
    third_country_details: '',
    necessity_assessment: '',
    alternatives_considered: '',
    data_minimization_measures: '',
    storage_limitation: '',
    impact_on_rights: '',
    risk_scenarios: [''],
    risk_probability: [1],
    risk_severity: [1],
    risk_mitigation_measures: [''],
    residual_risk_levels: ['medium'],
    technical_measures: [],
    organizational_measures: [],
    privacy_by_design: false,
    privacy_by_default: false,
    rights_mechanisms: [],
    monitoring_plan: '',
    review_schedule: '',
    zvop2_research_purposes: false,
    zvop2_research_elaborate: '',
    zvop2_video_surveillance: false,
    zvop2_surveillance_details: '',
    zvop2_data_pooling: false,
    zvop2_pooling_details: '',
    processing_logs_required: false,
    special_security_measures: false,
    special_security_details: '',
    assessment_date: '',
    completion_date: '',
    status: 'draft',
    approval_authority: '',
    approval_date: '',
    ip_consultation_required: false,
    ip_consultation_date: '',
    ip_response: '',
    attachments: []
  })

  // Risk Assessment Matrix (5x5)
  const riskMatrix: RiskMatrixCell[][] = [
    [
      { probability: 1, severity: 1, level: 'low', color: 'bg-green-500' },
      { probability: 1, severity: 2, level: 'low', color: 'bg-green-500' },
      { probability: 1, severity: 3, level: 'medium', color: 'bg-yellow-500' },
      { probability: 1, severity: 4, level: 'medium', color: 'bg-yellow-500' },
      { probability: 1, severity: 5, level: 'high', color: 'bg-orange-500' }
    ],
    [
      { probability: 2, severity: 1, level: 'low', color: 'bg-green-500' },
      { probability: 2, severity: 2, level: 'low', color: 'bg-green-500' },
      { probability: 2, severity: 3, level: 'medium', color: 'bg-yellow-500' },
      { probability: 2, severity: 4, level: 'high', color: 'bg-orange-500' },
      { probability: 2, severity: 5, level: 'high', color: 'bg-orange-500' }
    ],
    [
      { probability: 3, severity: 1, level: 'low', color: 'bg-green-500' },
      { probability: 3, severity: 2, level: 'medium', color: 'bg-yellow-500' },
      { probability: 3, severity: 3, level: 'medium', color: 'bg-yellow-500' },
      { probability: 3, severity: 4, level: 'high', color: 'bg-orange-500' },
      { probability: 3, severity: 5, level: 'critical', color: 'bg-red-500' }
    ],
    [
      { probability: 4, severity: 1, level: 'low', color: 'bg-green-500' },
      { probability: 4, severity: 2, level: 'medium', color: 'bg-yellow-500' },
      { probability: 4, severity: 3, level: 'high', color: 'bg-orange-500' },
      { probability: 4, severity: 4, level: 'high', color: 'bg-orange-500' },
      { probability: 4, severity: 5, level: 'critical', color: 'bg-red-500' }
    ],
    [
      { probability: 5, severity: 1, level: 'medium', color: 'bg-yellow-500' },
      { probability: 5, severity: 2, level: 'medium', color: 'bg-yellow-500' },
      { probability: 5, severity: 3, level: 'high', color: 'bg-orange-500' },
      { probability: 5, severity: 4, level: 'critical', color: 'bg-red-500' },
      { probability: 5, severity: 5, level: 'critical', color: 'bg-red-500' }
    ]
  ]

  if (!isOpen) return null

  // Generate unique assessment ID
  const generateAssessmentId = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `DPIA-${year}${month}${day}-${hours}${minutes}${seconds}`
  }

  // Constants for validation
  const REQUIRED_FIELDS = {
    1: ['assessment_id', 'project_name', 'project_description', 'lawful_basis', 'lawful_basis_details'],
    2: ['data_types', 'data_subjects', 'processing_purposes'],
    3: ['necessity_assessment', 'data_minimization_measures'],
    4: ['risk_scenarios'],
    5: ['technical_measures', 'organizational_measures']
  }

  const DATA_TYPE_OPTIONS = [
    'Osebni identifikatorji',
    'Kontaktni podatki',
    'Lokacijski podatki',
    'Finančni podatki',
    'Zdravstveni podatki',
    'Biometrični podatki',
    'Genetski podatki',
    'Podatki o političnih nazorih',
    'Religiozni prepričanja',
    'Člani sindikatov',
    'Rasa ali etična pripadnost',
    'Spolna usmerjenost',
    'Kazenske evidence',
    'IP naslovi',
    'Spletni piškotki',
    'Mobilni identifikatorji',
    'Drugo'
  ]

  const DATA_SUBJECT_OPTIONS = [
    'Zaposleni',
    'Stranke/kupci',
    'Bolniki',
    'Študenti',
    'Otroci (mlajši od 16 let)',
    'Ranljive skupine',
    'Kandidati za zaposlitev',
    'Upokojenci',
    'Državljani',
    'Drugo'
  ]

  const PROCESSING_PURPOSES_OPTIONS = [
    'Izvajanje pogodbe',
    'Pravna obveznost',
    'Osebne storitve',
    'Direktni marketing',
    'Servis strank',
    'Varstvo osebja',
    'Preprečevanje goljufij',
    'Zagotavljanje varnosti',
    'Sledenje storitev',
    'Analitika uporabnikov',
    'Raziskave in analize',
    'Priporočni sistemi',
    'Personalizacija vsebine',
    'Komunikacija',
    'Drugo'
  ]

  const LAWFUL_BASIS_OPTIONS = [
    'Privolitev (člen 6(1)(a))',
    'Pogodba (člen 6(1)(b))',
    'Pravna obveznost (člen 6(1)(c))',
    'Javna naloga (člen 6(1)(e))',
    'Zakoniti interes (člen 6(1)(f))',
    'Posebne okoliščine (člen 6(1)(d))'
  ]

  const TECHNICAL_MEASURES_OPTIONS = [
    'Šifriranje podatkov',
    'Psevdonimizacija',
    'Dostopni nadzor',
    'Varnostno kopiranje',
    'Varnostni monitoring',
    'Antivirusna zaščita',
    'Požarni zid',
    'VPN povezave',
    'Dvofaktorska avtentikacija',
    'Redno varnostno testiranje',
    'Varnostna politika gesel',
    'Zaklepanje računov',
    'Beleženje dostopov',
    'Oddelek za varnost',
    'Drugo'
  ]

  const ORGANIZATIONAL_MEASURES_OPTIONS = [
    'Usposabljanje zaposlenih',
    'Politika varstva podatkov',
    'Dostop na podlagi potreb',
    'Klasifikacija podatkov',
    'Pravila hrambe',
    'Protokol incidentov',
    'GDPR usposabljanje',
    'PO vrsta osebja',
    'Varovanje tajnih podatkov',
    'Audit podatkov',
    'Nadzor izvoza',
    'Kodeks ravnanja',
    'Drugo'
  ]

  const RIGHTS_MECHANISMS_OPTIONS = [
    'Portal za dostop do podatkov',
    'Formular za prenosljivost',
    'Portal za izbris podatkov',
    'Opt-out sistem',
    'Kontaktna točka DPO',
    'Informacijska linija',
    'Pritožbeni sistem',
    'Sledljivost zahtevkov'
  ]

  const RISK_SCENARIOS = [
    'Neavtoriziran dostop do osebnih podatkov',
    'Napaka pri prenosu podatkov',
    'Kraja podatkov iz naprav',
    'Škodljiva programska oprema',
    'Kršitev varnosti sistema',
    'Notranja grožnja',
    'Spletni napad',
    'Fizična kraja',
    'Odpuščanje napake',
    'Ogrožanje identitete',
    'Diskriminacija',
    'Finančna škoda',
    'Poškodovanje ugleda',
    'Kršitev pravic posameznikov',
    'Nadzorna sankcija',
    'Tožba',
    'Izguba zaupanja',
    'Napaka v algoritmu'
  ]

  // Context-aware validation rules
  const validateContext = () => {
    const errors: Record<string, string> = {}

    // ZVOP-2 specific validations
    if (formData.zvop2_research_purposes && !formData.zvop2_research_elaborate) {
      errors.zvop2_research_elaborate = 'Za raziskovalne namene je potreben Elaborat po členu 69 ZVOP-2'
    }

    if (formData.zvop2_video_surveillance && !formData.zvop2_surveillance_details) {
      errors.zvop2_surveillance_details = 'Pri videonadzoru cest so potrebni tehnični in organizacijski elementi'
    }

    if (formData.zvop2_data_pooling) {
      if (!formData.zvop2_pooling_details) {
        errors.zvop2_pooling_details = 'Pri povezovanju zbirk je potrebno predhodno posvetovanje z IP'
      }
      formData.ip_consultation_required = true
    }

    // High-risk processing validations
    if (formData.special_categories) {
      if (!formData.special_categories_details) {
        errors.special_categories_details = 'Podroben opis posebnih kategorij podatkov je obvezen'
      }
    }

    if (formData.criminal_data) {
      if (!formData.criminal_data_details) {
        errors.criminal_data_details = 'Podrobne informacije o podatkih kazenskih evidenc so obvezne'
      }
    }

    if (formData.third_country_transfers) {
      if (!formData.third_country_details) {
        errors.third_country_details = 'Pri prenosih v tretje države je potrebna ocena ustreznosti'
      }
    }

    // Privacy by Design validation
    if (formData.risk_probability.some(p => p >= 4) && !formData.privacy_by_design) {
      errors.privacy_by_design = 'Pri visokih tveganjih je potreben Privacy by Design pristop'
    }

    // Data minimization validation
    if (formData.data_types.length > 10 && formData.data_minimization_measures.length < 50) {
      errors.data_minimization_measures = 'Pri obdelavi številnih podatkov je potrebno podrobno utemeljevanje minimizacije'
    }

    setContextValidation(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep = (step: number): boolean => {
    const stepFields = REQUIRED_FIELDS[step as keyof typeof REQUIRED_FIELDS]
    const errors: Record<string, string> = {}

    stepFields?.forEach(field => {
      const value = formData[field as keyof DPIAFormData]
      
      if (!value || (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && !value.trim())) {
        errors[field] = 'To polje je obvezno'
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getRiskLevel = (probability: number, severity: number): { level: string; color: string } => {
    const cell = riskMatrix[probability - 1]?.[severity - 1]
    return cell || { level: 'low', color: 'bg-green-500' }
  }

  const addRiskScenario = () => {
    setFormData(prev => ({
      ...prev,
      risk_scenarios: [...prev.risk_scenarios, ''],
      risk_probability: [...prev.risk_probability, 1],
      risk_severity: [...prev.risk_severity, 1],
      risk_mitigation_measures: [...prev.risk_mitigation_measures, ''],
      residual_risk_levels: [...prev.residual_risk_levels, 'medium']
    }))
  }

  const removeRiskScenario = (index: number) => {
    if (formData.risk_scenarios.length > 1) {
      setFormData(prev => ({
        ...prev,
        risk_scenarios: prev.risk_scenarios.filter((_, i) => i !== index),
        risk_probability: prev.risk_probability.filter((_, i) => i !== index),
        risk_severity: prev.risk_severity.filter((_, i) => i !== index),
        risk_mitigation_measures: prev.risk_mitigation_measures.filter((_, i) => i !== index),
        residual_risk_levels: prev.residual_risk_levels.filter((_, i) => i !== index)
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Datoteka je prevelika (max 10MB)')
        return
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert('Dovoljeni so samo PDF, DOC, DOCX, XLS, XLSX, CSV fajli.')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const uploadFile = async (): Promise<{ url: string; name: string; size: number } | null> => {
    if (!selectedFile) return null
    
    setFileUploading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('gdpr-attachments')
        .upload(fileName, selectedFile)
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('gdpr-attachments')
        .getPublicUrl(fileName)
      
      return {
        url: urlData.publicUrl,
        name: selectedFile.name,
        size: selectedFile.size
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Napaka pri nalaganju datoteke')
      return null
    } finally {
      setFileUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps
    let isValid = true
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        isValid = false
        break
      }
    }

    if (!isValid) return

    // Context validation
    if (!validateContext()) {
      alert('Prosimo, odpravite kontekstne validacijske napake')
      return
    }

    setSaving(true)

    try {
      let fileData = null
      if (selectedFile) {
        fileData = await uploadFile()
        if (!fileData) {
          setSaving(false)
          return
        }
      }

      const attachment = fileData ? {
        name: fileData.name,
        url: fileData.url,
        type: selectedFile?.type || 'unknown'
      } : null

      // Generate assessment_id if not provided
      const finalAssessmentId = formData.assessment_id || generateAssessmentId()

      const finalFormData = {
        ...formData,
        assessment_id: finalAssessmentId,
        data_processing_description: formData.project_description, // Map project_description to data_processing_description
        attachments: attachment ? [attachment] : [],
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        // Ensure all required fields have values
        project_purpose: formData.project_purpose || 'Ni specificiran',
        lawful_basis_details: formData.lawful_basis_details || 'Ni specificiran',
        alternatives_considered: formData.alternatives_considered || 'Ni raziskovane alternative',
        storage_limitation: formData.storage_limitation || 'Standardno hranjenje',
        impact_on_rights: formData.impact_on_rights || 'Ni ocenjenega vpliva',
        dpo_opinion: formData.dpo_opinion || '',
        dpo_consultation_date: formData.dpo_consultation_date || null,
        assessment_date: formData.assessment_date || new Date().toISOString().split('T')[0],
        completion_date: formData.completion_date || null,
        approval_authority: formData.approval_authority || '',
        approval_date: formData.approval_date || null,
        ip_consultation_date: formData.ip_consultation_date || null,
        ip_response: formData.ip_response || ''
      }

      console.log('Final form data being sent:', JSON.stringify(finalFormData, null, 2))
      console.log('Assessment ID:', finalAssessmentId)

      const { error } = await supabase
        .from('gdpr_dpia_assessments')
        .insert([finalFormData])

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving DPIA:', error)
      alert(`Napaka pri shranjevanju DPIA: ${error.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && validateContext()) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const renderTooltip = (text: string) => (
    <div className="relative group">
      <HelpCircle className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            step === currentStep 
              ? 'bg-accent-primary text-white' 
              : step < currentStep 
                ? 'bg-status-success text-white'
                : 'bg-bg-surface text-text-secondary'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-status-success' : 'bg-bg-surface'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-accent-primary" />
        <h3 className="text-lg font-semibold text-text-primary">1. Pregled projekta in pravna podlaga</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            ID ocenjevanja <span className="text-red-500">*</span>
            {renderTooltip('Unikatni identifikator DPIA ocenjevanja (npr. DPIA-2024-001)')}
          </label>
          <input
            type="text"
            value={formData.assessment_id}
            onChange={(e) => setFormData(prev => ({ ...prev, assessment_id: e.target.value }))}
            className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
              validationErrors.assessment_id ? 'border-status-error' : 'border-border-subtle'
            }`}
            placeholder="DPIA-2024-001"
          />
          {validationErrors.assessment_id && (
            <p className="text-status-error text-sm mt-1">{validationErrors.assessment_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Ime projekta <span className="text-red-500">*</span>
            {renderTooltip('Kratko in jasno ime projekta ali obdelave')}
          </label>
          <input
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
            className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
              validationErrors.project_name ? 'border-status-error' : 'border-border-subtle'
            }`}
            placeholder="npr. CRM sistem za upravljanje strank"
          />
          {validationErrors.project_name && (
            <p className="text-status-error text-sm mt-1">{validationErrors.project_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Datum ocenjevanja
          </label>
          <input
            type="date"
            value={formData.assessment_date}
            onChange={(e) => setFormData(prev => ({ ...prev, assessment_date: e.target.value }))}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Opis projekta <span className="text-red-500">*</span>
            {renderTooltip('Podroben opis projekta, vključno z nameni in obsegom')}
          </label>
          <textarea
            value={formData.project_description}
            onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
              validationErrors.project_description ? 'border-status-error' : 'border-border-subtle'
            }`}
            placeholder="Podroben opis projekta..."
          />
          {validationErrors.project_description && (
            <p className="text-status-error text-sm mt-1">{validationErrors.project_description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Pravna podlaga <span className="text-red-500">*</span>
            {renderTooltip('Pravna podlaga za obdelavo osebnih podatkov po členu 6 GDPR')}
          </label>
          <select
            value={formData.lawful_basis}
            onChange={(e) => setFormData(prev => ({ ...prev, lawful_basis: e.target.value }))}
            className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary ${
              validationErrors.lawful_basis ? 'border-status-error' : 'border-border-subtle'
            }`}
          >
            <option value="">Izberite pravno podlago</option>
            {LAWFUL_BASIS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {validationErrors.lawful_basis && (
            <p className="text-status-error text-sm mt-1">{validationErrors.lawful_basis}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.dpo_involved}
              onChange={(e) => setFormData(prev => ({ ...prev, dpo_involved: e.target.checked }))}
              className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
            />
            DPO vključen v proces
          </label>
        </div>

        {formData.dpo_involved && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Datum posvetovanja z DPO
              </label>
              <input
                type="date"
                value={formData.dpo_consultation_date}
                onChange={(e) => setFormData(prev => ({ ...prev, dpo_consultation_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Mnenje DPO
              </label>
              <textarea
                value={formData.dpo_opinion}
                onChange={(e) => setFormData(prev => ({ ...prev, dpo_opinion: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                placeholder="Mnenje in priporočila DPO..."
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Podrobnosti pravne podlage <span className="text-red-500">*</span>
            {renderTooltip('Podrobna utemeljitev izbrane pravne podlage')}
          </label>
          <textarea
            value={formData.lawful_basis_details}
            onChange={(e) => setFormData(prev => ({ ...prev, lawful_basis_details: e.target.value }))}
            rows={3}
            className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
              validationErrors.lawful_basis_details ? 'border-status-error' : 'border-border-subtle'
            }`}
            placeholder="Utemeljitev pravne podlage..."
          />
          {validationErrors.lawful_basis_details && (
            <p className="text-status-error text-sm mt-1">{validationErrors.lawful_basis_details}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-status-success" />
        <h3 className="text-lg font-semibold text-text-primary">2. Podrobnosti obdelave podatkov</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Vrste osebnih podatkov <span className="text-red-500">*</span>
            {renderTooltip('Izberite vse vrste osebnih podatkov, ki se obdelujejo')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DATA_TYPE_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.data_types.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        data_types: [...prev.data_types, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        data_types: prev.data_types.filter(t => t !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.data_types && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.data_types}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.special_categories}
              onChange={(e) => setFormData(prev => ({ ...prev, special_categories: e.target.checked }))}
              className="rounded border-border-subtle text-status-error focus:ring-status-error bg-bg-near-black"
            />
            Posebne kategorije podatkov (člen 9 GDPR)
            {renderTooltip('Obdelava posebnih kategorij podatkov - zdravje, biometrija, itd.')}
          </label>
        </div>

        {formData.special_categories && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Podrobnosti posebnih kategorij <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.special_categories_details}
              onChange={(e) => setFormData(prev => ({ ...prev, special_categories_details: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
                validationErrors.special_categories_details ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Opis posebnih kategorij podatkov..."
            />
            {validationErrors.special_categories_details && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.special_categories_details}</p>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.criminal_data}
              onChange={(e) => setFormData(prev => ({ ...prev, criminal_data: e.target.checked }))}
              className="rounded border-border-subtle text-status-error focus:ring-status-error bg-bg-near-black"
            />
            Podatki o kazenskih obsodbah (člen 10 GDPR)
          </label>
        </div>

        {formData.criminal_data && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Podrobnosti kazenskih podatkov <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.criminal_data_details}
              onChange={(e) => setFormData(prev => ({ ...prev, criminal_data_details: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary placeholder-text-secondary ${
                validationErrors.criminal_data_details ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Opis podatkov o kazenskih obsodbah..."
            />
            {validationErrors.criminal_data_details && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.criminal_data_details}</p>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Kategorije posameznikov <span className="text-red-500">*</span>
            {renderTooltip('Izberite kategorije posameznikov, katerih podatki se obdelujejo')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DATA_SUBJECT_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.data_subjects.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        data_subjects: [...prev.data_subjects, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        data_subjects: prev.data_subjects.filter(t => t !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.data_subjects && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.data_subjects}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Namen obdelave podatkov <span className="text-red-500">*</span>
            {renderTooltip('Izberite vse namene, za katere se obdelujejo osebni podatki')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROCESSING_PURPOSES_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.processing_purposes.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        processing_purposes: [...prev.processing_purposes, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        processing_purposes: prev.processing_purposes.filter(p => p !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.processing_purposes && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.processing_purposes}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.third_country_transfers}
              onChange={(e) => setFormData(prev => ({ ...prev, third_country_transfers: e.target.checked }))}
              className="rounded border-border-subtle text-status-warning focus:ring-status-warning bg-bg-near-black"
            />
            Prenosi v tretje države
            {renderTooltip('Ali se podatki prenašajo v države zunaj EU/EEA')}
          </label>
        </div>

        {formData.third_country_transfers && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Podrobnosti prenosov <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.third_country_details}
              onChange={(e) => setFormData(prev => ({ ...prev, third_country_details: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.third_country_details ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Države in mehanizmi prenosov..."
            />
            {validationErrors.third_country_details && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.third_country_details}</p>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Prejemniki podatkov
          </label>
          <textarea
            value={formData.data_recipients.join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              data_recipients: e.target.value.split('\n').filter(r => r.trim()) 
            }))}
            rows={3}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="En prejemnik na vrstico..."
          />
        </div>
        
        {/* Context Validation Errors for Step 2 */}
        {Object.keys(contextValidation).length > 0 && (
          <div className="md:col-span-2">
            <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-status-error" />
                <h4 className="font-medium text-status-error">Opozorila za napredovanje</h4>
              </div>
              <div className="space-y-2">
                {Object.entries(contextValidation).map(([field, error]) => (
                  <p key={field} className="text-status-error text-sm">
                    • {error}
                  </p>
                ))}
              </div>
              <p className="text-status-error text-xs mt-3">
                Prosimo, izpolnite zahtevana polja za nadaljevanje.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-6 h-6 text-accent-primary" />
        <h3 className="text-lg font-semibold text-text-primary">3. Nujnost in sorazmernost</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Ocena nujnosti <span className="text-red-500">*</span>
            {renderTooltip('Zakaj je obdelava podatkov nujna za doseganje namena')}
          </label>
          <textarea
            value={formData.necessity_assessment}
            onChange={(e) => setFormData(prev => ({ ...prev, necessity_assessment: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.necessity_assessment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Podrobna ocena nujnosti obdelave..."
          />
          {validationErrors.necessity_assessment && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.necessity_assessment}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Upoštevane alternative <span className="text-red-500">*</span>
            {renderTooltip('Katere alternative so bile presojane in zakaj niso primerne')}
          </label>
          <textarea
            value={formData.alternatives_considered}
            onChange={(e) => setFormData(prev => ({ ...prev, alternatives_considered: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="Opis alternativnih rešitev..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Ukrepi minimizacije podatkov <span className="text-red-500">*</span>
            {renderTooltip('Katere ukrepe izvajate za zmanjšanje količine obdelovanih podatkov')}
          </label>
          <textarea
            value={formData.data_minimization_measures}
            onChange={(e) => setFormData(prev => ({ ...prev, data_minimization_measures: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.data_minimization_measures ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ukrepi za zmanjšanje količine podatkov..."
          />
          {validationErrors.data_minimization_measures && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.data_minimization_measures}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Omejitev hranjenja
            {renderTooltip('Roki hrambe in razlogi za te roke')}
          </label>
          <textarea
            value={formData.storage_limitation}
            onChange={(e) => setFormData(prev => ({ ...prev, storage_limitation: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="Roki hrambe in politika brisanja..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Vpliv na pravice posameznikov
            {renderTooltip('Kako obdelava vpliva na pravice posameznikov')}
          </label>
          <textarea
            value={formData.impact_on_rights}
            onChange={(e) => setFormData(prev => ({ ...prev, impact_on_rights: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="Vpliv na pravice posameznikov..."
          />
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-status-warning" />
        <h3 className="text-lg font-semibold text-text-primary">4. Ocena tveganj</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Identificirajte vsa možna tveganja in jih ocenite glede na verjetnost in resnost.
          Uporabite matriko tveganj za določanje ravni tveganja.
        </p>

        {/* Risk Assessment Matrix */}
        <div className="bg-bg-surface p-4 rounded-lg mb-6 border border-border-subtle">
          <h4 className="font-medium text-gray-900 mb-3">Matrica tveganj (5×5)</h4>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-6 gap-1 text-xs">
                <div className="font-medium text-center">Verjetnost\Resnost</div>
                <div className="font-medium text-center">1</div>
                <div className="font-medium text-center">2</div>
                <div className="font-medium text-center">3</div>
                <div className="font-medium text-center">4</div>
                <div className="font-medium text-center">5</div>
                
                {riskMatrix.map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="font-medium text-center py-2">{i + 1}</div>
                    {row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`${cell.color} text-white text-center py-2 rounded text-xs font-medium`}
                      >
                        {cell.level === 'low' ? 'N' : 
                         cell.level === 'medium' ? 'S' : 
                         cell.level === 'high' ? 'V' : 'K'}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-xs mt-3">
            <span><span className="w-3 h-3 inline-block bg-green-500 rounded mr-1"></span>Nizko (N)</span>
            <span><span className="w-3 h-3 inline-block bg-yellow-500 rounded mr-1"></span>Srednje (S)</span>
            <span><span className="w-3 h-3 inline-block bg-orange-500 rounded mr-1"></span>Visoko (V)</span>
            <span><span className="w-3 h-3 inline-block bg-red-500 rounded mr-1"></span>Kritično (K)</span>
          </div>
        </div>
      </div>

      {formData.risk_scenarios.map((scenario, index) => (
        <div key={index} className="border border-border-subtle rounded-lg p-4 space-y-4 bg-bg-surface">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">Tveganje {index + 1}</h4>
            {formData.risk_scenarios.length > 1 && (
              <button
                type="button"
                onClick={() => removeRiskScenario(index)}
                className="text-status-error hover:text-status-error/80 text-sm"
              >
                Odstrani
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Scenarij tveganja
            </label>
            <select
              value={scenario}
              onChange={(e) => {
                const newScenarios = [...formData.risk_scenarios]
                newScenarios[index] = e.target.value
                setFormData(prev => ({ ...prev, risk_scenarios: newScenarios }))
              }}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            >
              <option value="">Izberite scenarij tveganja</option>
              {RISK_SCENARIOS.map(scenario => (
                <option key={scenario} value={scenario}>{scenario}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Verjetnost (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.risk_probability[index]}
                onChange={(e) => {
                  const newProbability = [...formData.risk_probability]
                  newProbability[index] = parseInt(e.target.value)
                  setFormData(prev => ({ ...prev, risk_probability: newProbability }))
                }}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center mt-1">
                {formData.risk_probability[index]}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Resnost (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.risk_severity[index]}
                onChange={(e) => {
                  const newSeverity = [...formData.risk_severity]
                  newSeverity[index] = parseInt(e.target.value)
                  setFormData(prev => ({ ...prev, risk_severity: newSeverity }))
                }}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center mt-1">
                {formData.risk_severity[index]}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded text-white text-sm font-medium ${
              getRiskLevel(formData.risk_probability[index], formData.risk_severity[index]).color
            }`}>
              {getRiskLevel(formData.risk_probability[index], formData.risk_severity[index]).level.toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">
              Raven tveganja
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Ukrepi za zmanjšanje tveganja
            </label>
            <textarea
              value={formData.risk_mitigation_measures[index]}
              onChange={(e) => {
                const newMeasures = [...formData.risk_mitigation_measures]
                newMeasures[index] = e.target.value
                setFormData(prev => ({ ...prev, risk_mitigation_measures: newMeasures }))
              }}
              rows={2}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
              placeholder="Opis ukrepov za zmanjšanje tveganja..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Preostalo tveganje
            </label>
            <select
              value={formData.residual_risk_levels[index]}
              onChange={(e) => {
                const newResidual = [...formData.residual_risk_levels]
                newResidual[index] = e.target.value
                setFormData(prev => ({ ...prev, residual_risk_levels: newResidual }))
              }}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            >
              <option value="low">Nizko</option>
              <option value="medium">Srednje</option>
              <option value="high">Visoko</option>
              <option value="critical">Kritično</option>
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRiskScenario}
        className="w-full py-3 border-2 border-dashed border-border-subtle rounded-lg text-text-secondary hover:border-accent-primary hover:text-accent-primary transition-colors"
      >
        + Dodaj novo tveganje
      </button>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-accent-primary" />
        <h3 className="text-lg font-semibold text-text-primary">5. Skladnost in spremljanje</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Technical Measures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tehnični ukrepi <span className="text-red-500">*</span>
            {renderTooltip('Izberite vse tehnične ukrepe, ki jih implementirate')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TECHNICAL_MEASURES_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_measures.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        technical_measures: [...prev.technical_measures, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        technical_measures: prev.technical_measures.filter(t => t !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.technical_measures && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.technical_measures}</p>
          )}
        </div>

        {/* Organizational Measures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Organizacijski ukrepi <span className="text-red-500">*</span>
            {renderTooltip('Izberite vse organizacijske ukrepe, ki jih implementirate')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ORGANIZATIONAL_MEASURES_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.organizational_measures.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        organizational_measures: [...prev.organizational_measures, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        organizational_measures: prev.organizational_measures.filter(t => t !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.organizational_measures && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.organizational_measures}</p>
          )}
        </div>

        {/* Privacy by Design/Default */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={formData.privacy_by_design}
                onChange={(e) => setFormData(prev => ({ ...prev, privacy_by_design: e.target.checked }))}
                className="rounded border-border-subtle text-status-success focus:ring-status-success bg-bg-near-black"
              />
              Privacy by Design (člen 25 GDPR)
              {renderTooltip('Vključitev varstva podatkov že v fazi zasnove sistema')}
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={formData.privacy_by_default}
                onChange={(e) => setFormData(prev => ({ ...prev, privacy_by_default: e.target.checked }))}
                className="rounded border-border-subtle text-status-success focus:ring-status-success bg-bg-near-black"
              />
              Privacy by Default
              {renderTooltip('Privzete nastavitve varstva podatkov')}
            </label>
          </div>
        </div>

        {/* Rights Mechanisms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mehanizmi za uveljavljanje pravic
            {renderTooltip('Kako posamezniki lahko uveljavljajo svoje pravice')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RIGHTS_MECHANISMS_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.rights_mechanisms.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        rights_mechanisms: [...prev.rights_mechanisms, option] 
                      }))
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        rights_mechanisms: prev.rights_mechanisms.filter(t => t !== option) 
                      }))
                    }
                  }}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Monitoring Plan */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Načrt spremljanja
          </label>
          <textarea
            value={formData.monitoring_plan}
            onChange={(e) => setFormData(prev => ({ ...prev, monitoring_plan: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="Kako boste spremljali učinkovitost ukrepov..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Načrt pregledov
          </label>
          <textarea
            value={formData.review_schedule}
            onChange={(e) => setFormData(prev => ({ ...prev, review_schedule: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
            placeholder="Kdaj in kako boste pregledovali to DPIA..."
          />
        </div>

        {/* ZVOP-2 Specific Fields */}
        <div className="border-t border-border-subtle pt-6">
          <h4 className="font-medium text-text-primary mb-4">ZVOP-2 posebne zahteve</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.zvop2_research_purposes}
                  onChange={(e) => setFormData(prev => ({ ...prev, zvop2_research_purposes: e.target.checked }))}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                Raziskovalni nameni (člen 69 ZVOP-2)
                {renderTooltip('Obdelava za raziskovalne namene znotraj zavezanca')}
              </label>
              
              {formData.zvop2_research_purposes && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Elaborat za raziskavo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.zvop2_research_elaborate}
                    onChange={(e) => setFormData(prev => ({ ...prev, zvop2_research_elaborate: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      contextValidation.zvop2_research_elaborate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Opis raziskave in DPIA, kadar je obvezna..."
                  />
                  {contextValidation.zvop2_research_elaborate && (
                    <p className="text-red-500 text-sm mt-1">{contextValidation.zvop2_research_elaborate}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.zvop2_video_surveillance}
                  onChange={(e) => setFormData(prev => ({ ...prev, zvop2_video_surveillance: e.target.checked }))}
                  className="rounded border-border-subtle text-status-error focus:ring-status-error bg-bg-near-black"
                />
                Videonadzor cestnih odsekov (člen 80 ZVOP-2)
                {renderTooltip('Obvezno mnenje IP pred uvedbo')}
              </label>
              
              {formData.zvop2_video_surveillance && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Podrobnosti videonadzora <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.zvop2_surveillance_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, zvop2_surveillance_details: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      contextValidation.zvop2_surveillance_details ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tehnični in organizacijski elementi videonadzora..."
                  />
                  {contextValidation.zvop2_surveillance_details && (
                    <p className="text-red-500 text-sm mt-1">{contextValidation.zvop2_surveillance_details}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.zvop2_data_pooling}
                  onChange={(e) => setFormData(prev => ({ ...prev, zvop2_data_pooling: e.target.checked }))}
                  className="rounded border-border-subtle text-status-warning focus:ring-status-warning bg-bg-near-black"
                />
                Povezovanje zbirk (člen 87 ZVOP-2)
                {renderTooltip('Obvezno predhodno posvetovanje z IP')}
              </label>
              
              {formData.zvop2_data_pooling && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Podrobnosti povezovanja <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.zvop2_pooling_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, zvop2_pooling_details: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      contextValidation.zvop2_pooling_details ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Analiza povezljivosti, namenov in tveganj..."
                  />
                  {contextValidation.zvop2_pooling_details && (
                    <p className="text-red-500 text-sm mt-1">{contextValidation.zvop2_pooling_details}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.processing_logs_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, processing_logs_required: e.target.checked }))}
                  className="rounded border-border-subtle text-accent-primary focus:ring-accent-primary bg-bg-near-black"
                />
                Potrebni dnevniki obdelave (člen 22 ZVOP-2)
                {renderTooltip('Vodenje dnevnikov obdelave je obvezno')}
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.special_security_measures}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_security_measures: e.target.checked }))}
                  className="rounded border-border-subtle text-status-error focus:ring-status-error bg-bg-near-black"
                />
                Posebne varnostne zahteve (člen 23 ZVOP-2)
                {renderTooltip('Sistemi, ki ustrezajo kriterijem posebnih obdelav')}
              </label>
              
              {formData.special_security_measures && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Podrobnosti posebnih ukrepov
                  </label>
                  <textarea
                    value={formData.special_security_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_security_details: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                    placeholder="Omejitve hrambe, lokacije, varnostni standardi..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-t border-border-subtle pt-6">
          <h4 className="font-medium text-text-primary mb-4">Priloge</h4>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Dodaj datoteko (PDF, DOC, XLS, CSV - max 10MB)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg cursor-pointer hover:bg-bg-surface-hover transition-colors text-text-primary"
              >
                Izberi datoteko
              </label>
              {selectedFile && (
                <span className="text-sm text-text-secondary">{selectedFile.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Approval */}
        <div className="border-t border-border-subtle pt-6">
          <h4 className="font-medium text-text-primary mb-4">Odobritev</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
              >
                <option value="draft">Osnutek</option>
                <option value="in_review">V pregledu</option>
                <option value="approved">Odobreno</option>
                <option value="rejected">Zavrnjeno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Datum zaključka
              </label>
              <input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
              />
            </div>

            {formData.status === 'approved' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Odobril
                  </label>
                  <input
                    type="text"
                    value={formData.approval_authority}
                    onChange={(e) => setFormData(prev => ({ ...prev, approval_authority: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                    placeholder="Ime in priimek odgovorne osebe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Datum odobritve
                  </label>
                  <input
                    type="date"
                    value={formData.approval_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, approval_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* IP Consultation */}
        <div className="border-t border-border-subtle pt-6">
          <h4 className="font-medium text-text-primary mb-4">Posvetovanje z Informacijskim pooblaščencem</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.ip_consultation_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, ip_consultation_required: e.target.checked }))}
                  className="rounded border-border-subtle text-status-error focus:ring-status-error bg-bg-near-black"
                />
                Obvezno predhodno posvetovanje z IP
                {renderTooltip('Ker preostala tveganja ostajajo visoka')}
              </label>
            </div>

            {formData.ip_consultation_required && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Datum pošiljanja zahteve IP
                  </label>
                  <input
                    type="date"
                    value={formData.ip_consultation_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip_consultation_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Odgovor IP
                  </label>
                  <textarea
                    value={formData.ip_response}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip_response: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-text-primary"
                    placeholder="Odziv Informacijskega pooblaščenca..."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-pure-black rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-border-subtle">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent-primary" />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">GDPR DPIA - Napredna ocena</h2>
              <p className="text-sm text-text-secondary">Ocena učinka na varstvo podatkov</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          {renderStepIndicator()}
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'bg-bg-near-black text-text-muted cursor-not-allowed'
                    : 'bg-bg-surface text-text-primary hover:bg-bg-surface-hover'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Nazaj
              </button>

              <div className="flex items-center gap-4">
                {/* Compliance Status Indicator */}
                <div className="flex items-center gap-2">
                  {Object.keys(contextValidation).length === 0 ? (
                    <div className="flex items-center gap-1 text-status-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Skladno</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-status-warning">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{Object.keys(contextValidation).length} opozoril</span>
                    </div>
                  )}
                </div>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors"
                  >
                    Naprej
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving || fileUploading}
                    className="flex items-center gap-2 px-6 py-2 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition-colors disabled:opacity-50"
                  >
                    {saving || fileUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Shranjevanje...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        Zaključi DPIA
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GDPRDPIAAdvancedModal