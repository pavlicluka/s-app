import { useState, useEffect } from 'react'
import { X, Save, ArrowLeft, ArrowRight, AlertTriangle, Info, FileText, Users, Shield, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface GDPRIncidentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

interface FormData {
  // A1: Osnovni podatki
  breach_id: string
  breach_start_datetime: string
  detection_method: string
  breach_type: string[]

  // A2: Prizadeti sistemi
  affected_systems: string[]
  data_categories: string[]
  
  // B: Narava kršitve
  breach_description: string
  root_cause: string
  internal_external: string
  estimated_individuals_affected: number
  affected_records: number
  time_span_start: string
  time_span_end: string

  // C: Kontakt
  dpo_name: string
  dpo_email: string
  dpo_phone: string
  dpo_organization: string

  // D: Ocena tveganja
  risk_probability: string
  risk_severity: string
  likely_risk: boolean
  high_risk: boolean
  consequences: string[]
  affected_areas: string[]

  // E: Ukrepi
  containment_measures: string[]
  containment_datetime: string
  corrective_measures: string
  corrective_deadline: string
  corrective_owner: string

  // F: ZVOP-2 nacionalne zahteve
  processing_log_references: string[]
  legal_hold: boolean
  legal_hold_type: string
  special_processing: boolean
  special_processing_categories: string[]
  data_location: string
  csirt_notified: boolean
  csirt_notification_datetime: string
  csirt_reference: string

  // G: Sledljivost posredovanj
  transfers_made: boolean

  // H: Dokumentacija
  evidence_attachments: File[]

  // Osnovna polja
  severity: string
  status: string
}

const FORM_SECTIONS = [
  {
    id: 'A1',
    title: 'Identifikacija incidenta',
    description: 'Osnovni podatki incidenta',
    icon: AlertTriangle
  },
  {
    id: 'A2',
    title: 'Prizadeti sistemi',
    description: 'Informacijski sistemi in podatki',
    icon: Shield
  },
  {
    id: 'B',
    title: 'Narava kršitve',
    description: 'Opis dogodka in obseg',
    icon: FileText
  },
  {
    id: 'C',
    title: 'Kontakt',
    description: 'DPO in kontaktne osebe',
    icon: Users
  },
  {
    id: 'D',
    title: 'Ocena tveganja',
    description: 'Analiza vpliva na posameznike',
    icon: AlertTriangle
  },
  {
    id: 'E',
    title: 'Ukrepi',
    description: 'Zajezitev in korekcije',
    icon: CheckCircle
  },
  {
    id: 'F',
    title: 'ZVOP-2 zahteve',
    description: 'Nacionalne specifike',
    icon: Shield
  },
  {
    id: 'G',
    title: 'Posredovanja',
    description: 'Sledljivost prenosov',
    icon: FileText
  },
  {
    id: 'H',
    title: 'Dokumentacija',
    description: 'Priloge in dokazila',
    icon: FileText
  }
]

export default function GDPRIncidentFormModal({ isOpen, onClose, onSave }: GDPRIncidentFormModalProps) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    breach_id: '',
    breach_start_datetime: '',
    detection_method: '',
    breach_type: [],
    affected_systems: [],
    data_categories: [],
    breach_description: '',
    root_cause: '',
    internal_external: '',
    estimated_individuals_affected: 0,
    affected_records: 0,
    time_span_start: '',
    time_span_end: '',
    dpo_name: '',
    dpo_email: '',
    dpo_phone: '',
    dpo_organization: '',
    risk_probability: '',
    risk_severity: '',
    likely_risk: false,
    high_risk: false,
    consequences: [],
    affected_areas: [],
    containment_measures: [],
    containment_datetime: '',
    corrective_measures: '',
    corrective_deadline: '',
    corrective_owner: '',
    processing_log_references: [],
    legal_hold: false,
    legal_hold_type: '',
    special_processing: false,
    special_processing_categories: [],
    data_location: '',
    csirt_notified: false,
    csirt_notification_datetime: '',
    csirt_reference: '',
    transfers_made: false,
    evidence_attachments: [],
    severity: 'medium',
    status: 'investigating'
  })

  // Auto-generate breach ID
  useEffect(() => {
    if (!formData.breach_id) {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      const newId = `GDPR-${year}${month}-${random}`
      setFormData(prev => ({ ...prev, breach_id: newId }))
    }
  }, [formData.breach_id])

  // Set current time for detection
  useEffect(() => {
    if (!formData.breach_start_datetime) {
      const now = new Date().toISOString().slice(0, 16)
      setFormData(prev => ({ 
        ...prev, 
        breach_start_datetime: now,
        time_span_start: now,
        time_span_end: now
      }))
    }
  }, [formData.breach_start_datetime])

  const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number } | null> => {
    try {
      if (file.size > 10485760) {
        alert('Datoteka je prevelika (maksimalno 10MB)')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gdpr-incidents/${fileName}`

      const { data, error } = await supabase.storage
        .from('gdpr-attachments')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('gdpr-attachments')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        name: file.name,
        size: file.size
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Napaka pri nalaganju datoteke')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Handle file uploads
      let fileData = null
      if (formData.evidence_attachments.length > 0) {
        fileData = await uploadFile(formData.evidence_attachments[0])
        if (!fileData) {
          setSaving(false)
          return
        }
      }

      // Prepare data for insertion
      const insertData = {
        ...formData,
        breach_date: formData.breach_start_datetime,
        discovery_date: formData.breach_start_datetime,
        data_subjects_categories: formData.data_categories,
        affected_records: parseInt(formData.affected_records.toString()) || 0,
        estimated_individuals_affected: parseInt(formData.estimated_individuals_affected.toString()) || 0,
        reported_to_authority: formData.likely_risk,
        ...(fileData && {
          file_url: fileData.url,
          file_name: fileData.name,
          file_size: fileData.size
        })
      }

      const { error } = await supabase
        .from('gdpr_data_breach_log')
        .insert([insertData])

      if (error) throw error

      onSave()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      alert('Napaka pri shranjevanju')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      breach_id: '',
      breach_start_datetime: '',
      detection_method: '',
      breach_type: [],
      affected_systems: [],
      data_categories: [],
      breach_description: '',
      root_cause: '',
      internal_external: '',
      estimated_individuals_affected: 0,
      affected_records: 0,
      time_span_start: '',
      time_span_end: '',
      dpo_name: '',
      dpo_email: '',
      dpo_phone: '',
      dpo_organization: '',
      risk_probability: '',
      risk_severity: '',
      likely_risk: false,
      high_risk: false,
      consequences: [],
      affected_areas: [],
      containment_measures: [],
      containment_datetime: '',
      corrective_measures: '',
      corrective_deadline: '',
      corrective_owner: '',
      processing_log_references: [],
      legal_hold: false,
      legal_hold_type: '',
      special_processing: false,
      special_processing_categories: [],
      data_location: '',
      csirt_notified: false,
      csirt_notification_datetime: '',
      csirt_reference: '',
      transfers_made: false,
      evidence_attachments: [],
      severity: 'medium',
      status: 'investigating'
    })
    setCurrentSection(0)
  }

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayChange = (key: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[key as keyof FormData] as string[]
      if (checked) {
        return { ...prev, [key]: [...currentArray, value] }
      } else {
        return { ...prev, [key]: currentArray.filter(item => item !== value) }
      }
    })
  }

  const canProceedToNext = () => {
    switch (FORM_SECTIONS[currentSection].id) {
      case 'A1':
        return formData.breach_id && formData.breach_start_datetime && formData.detection_method
      case 'A2':
        return formData.breach_type.length > 0 && formData.data_categories.length > 0
      case 'B':
        return formData.breach_description && formData.root_cause && formData.internal_external
      case 'C':
        return formData.dpo_name && formData.dpo_email
      case 'D':
        return formData.risk_probability && formData.risk_severity
      case 'E':
        return formData.containment_measures.length > 0
      default:
        return true
    }
  }

  if (!isOpen) return null

  const renderSection = () => {
    const section = FORM_SECTIONS[currentSection]

    switch (section.id) {
      case 'A1':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  ID incidenta <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.breach_id}
                  onChange={(e) => handleChange('breach_id', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Avtomatsko generiran"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Datum in čas nastanka <span className="text-status-error">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.breach_start_datetime}
                  onChange={(e) => handleChange('breach_start_datetime', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Kako je bil incident odkrit? <span className="text-status-error">*</span>
              </label>
              <select
                required
                value={formData.detection_method}
                onChange={(e) => handleChange('detection_method', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="">Izberite način odkritja</option>
                <option value="automatic">Avtomatski警通 (SIEM, antivirus)</option>
                <option value="manual">Ročno (uporabnik, zaposlen)</option>
                <option value="third_party">Tretja oseba (partner, nadzorni organ)</option>
                <option value="other">Drugo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tip kršitve <span className="text-status-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['confidentiality', 'integrity', 'availability'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.breach_type.includes(type)}
                      onChange={(e) => handleArrayChange('breach_type', type, e.target.checked)}
                      className="rounded border-border-subtle"
                    />
                    <span className="text-sm text-text-primary">
                      {type === 'confidentiality' && 'Razkritje (zaupnost)'}
                      {type === 'integrity' && 'Izguba integritete'}
                      {type === 'availability' && 'Izguba dostopnosti'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'A2':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Kategorije podatkov (GDPR člen 33(3)(a)) <span className="text-status-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'identifiers', label: 'Osebni identifikatorji (ime, EMŠO, davčna številka)' },
                  { value: 'contact', label: 'Kontaktni podatki (e-naslov, telefon, naslov)' },
                  { value: 'demographic', label: 'Demografski podatki (starost, spol, državljanstvo)' },
                  { value: 'financial', label: 'Finančni podatki (bančni račun, plačila)' },
                  { value: 'health', label: 'Zdravstveni podatki (diagnoze, zdravljenje)' },
                  { value: 'biometric', label: 'Biometrični podatki (prstni odtisi, prepoznavanje obraza)' },
                  { value: 'location', label: 'Lokacijski podatki (GPS, IP naslovi)' }
                ].map(cat => (
                  <label key={cat.value} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.data_categories.includes(cat.value)}
                      onChange={(e) => handleArrayChange('data_categories', cat.value, e.target.checked)}
                      className="rounded border-border-subtle mt-1"
                    />
                    <span className="text-sm text-text-primary">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Informacijski sistem
              </label>
              <input
                type="text"
                value={formData.affected_systems.join(', ')}
                onChange={(e) => handleChange('affected_systems', e.target.value.split(', ').filter(s => s))}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="ERP sistem, CRM, spletna aplikacija..."
              />
            </div>
          </div>
        )

      case 'B':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Opis kršitve <span className="text-status-error">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.breach_description}
                onChange={(e) => handleChange('breach_description', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                placeholder="Opisnite natančno, kaj se je zgodilo, kdaj in kako..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Vzrok kršitve <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.root_cause}
                  onChange={(e) => handleChange('root_cause', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Izberite vzrok</option>
                  <option value="human_error">Človeška napaka</option>
                  <option value="technical_error">Tehnična napaka</option>
                  <option value="cyber_attack">Kibernetski napad</option>
                  <option value="natural_disaster">Naravna nesreča</option>
                  <option value="malicious_internal">Notranja zlonamerna dejanja</option>
                  <option value="external_events">Zunanji dogodki</option>
                  <option value="unknown">Neznan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Notranja ali zunanja kršitev? <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.internal_external}
                  onChange={(e) => handleChange('internal_external', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Izberite vrsto</option>
                  <option value="internal">Notranja (zaposleni, pogodbeniki)</option>
                  <option value="external">Zunanja (partnerji, stranke, neznanci)</option>
                  <option value="mixed">Mešana (kombinacija obeh)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Število prizadetih posameznikov
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimated_individuals_affected}
                  onChange={(e) => handleChange('estimated_individuals_affected', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Če neznano, ocenite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Število evidenc/zapisov
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.affected_records}
                  onChange={(e) => handleChange('affected_records', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Skupno število prizadetenih podatkovnih enot"
                />
              </div>
            </div>
          </div>
        )

      case 'C':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">DPO ali kontaktna oseba (GDPR člen 33(3)(b))</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ime in priimek <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dpo_name}
                  onChange={(e) => handleChange('dpo_name', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ime Priimek"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Funkcija/vloga
                </label>
                <input
                  type="text"
                  value={formData.dpo_organization}
                  onChange={(e) => handleChange('dpo_organization', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="DPO, IT Manager, Security Officer..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  E-naslov <span className="text-status-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.dpo_email}
                  onChange={(e) => handleChange('dpo_email', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="dpo@podjetje.si"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.dpo_phone}
                  onChange={(e) => handleChange('dpo_phone', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="+386 1 234 5678"
                />
              </div>
            </div>
          </div>
        )

      case 'D':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">Ocena tveganja in posledice (GDPR člen 33(3)(c))</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Verjetnost zlorabe podatkov <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.risk_probability}
                  onChange={(e) => handleChange('risk_probability', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Izberite verjetnost</option>
                  <option value="very_low">Zelo nizka (0-10%)</option>
                  <option value="low">Nizka (11-30%)</option>
                  <option value="medium">Srednja (31-60%)</option>
                  <option value="high">Visoka (61-90%)</option>
                  <option value="very_high">Zelo visoka (91-100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Resnost posledic <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.risk_severity}
                  onChange={(e) => handleChange('risk_severity', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Izberite resnost</option>
                  <option value="minimal">Minimalna (brez opaznih posledic)</option>
                  <option value="low">Nizka (manjše neprijetnosti)</option>
                  <option value="medium">Srednja (opazne motnje, nekaj neprijetnosti)</option>
                  <option value="high">Visoka (resne motnje, znatne neprijetnosti)</option>
                  <option value="critical">Kritična (hude posledice, trajna škoda)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ali gre za verjetno tveganje? <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.likely_risk ? 'true' : 'false'}
                  onChange={(e) => handleChange('likely_risk', e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="false">Ne</option>
                  <option value="true">Da</option>
                </select>
                {formData.likely_risk && (
                  <p className="text-xs text-status-warning mt-1">
                    ⚠️ Če Da = prijava IP obvezna
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ali gre za veliko tiskanje? <span className="text-status-error">*</span>
                </label>
                <select
                  required
                  value={formData.high_risk ? 'true' : 'false'}
                  onChange={(e) => handleChange('high_risk', e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="false">Ne</option>
                  <option value="true">Da</option>
                  <option value="unknown">Ni znano</option>
                </select>
                {formData.high_risk && (
                  <p className="text-xs text-status-warning mt-1">
                    ⚠️ Če Da = obvestilo posameznikom obvezno
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Posledice za posameznike
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'identity_theft', label: 'Identitetna zloraba' },
                  { value: 'financial_damage', label: 'Finančna škoda' },
                  { value: 'discrimination', label: 'Diskriminacija' },
                  { value: 'privacy_loss', label: 'Izguba zasebnosti' },
                  { value: 'reputation_damage', label: 'Reputacijska škoda' },
                  { value: 'psychological_harm', label: 'Psihološke motnje' },
                  { value: 'physical_safety', label: 'Fizična varnost ogrožena' },
                  { value: 'social_impact', label: 'Družbeni vpliv' }
                ].map(consequence => (
                  <label key={consequence.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consequences.includes(consequence.value)}
                      onChange={(e) => handleArrayChange('consequences', consequence.value, e.target.checked)}
                      className="rounded border-border-subtle"
                    />
                    <span className="text-sm text-text-primary">{consequence.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'E':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">Ukrepi (GDPR člen 33(3)(d))</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Ukrepi zajezitve (že sprejeti) <span className="text-status-error">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'system_isolation', label: 'Izolacija prizadetenega sistema' },
                  { value: 'password_change', label: 'Sprememba gesel/dostopov' },
                  { value: 'account_deactivation', label: 'Deaktivacija računov' },
                  { value: 'ip_blocking', label: 'Blokiranje IP naslovov' },
                  { value: 'security_patches', label: 'Posodobitev varnostnih popravkov' },
                  { value: 'data_removal', label: 'Umik podatkov iz spleta' }
                ].map(measure => (
                  <label key={measure.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.containment_measures.includes(measure.value)}
                      onChange={(e) => handleArrayChange('containment_measures', measure.value, e.target.checked)}
                      className="rounded border-border-subtle"
                    />
                    <span className="text-sm text-text-primary">{measure.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Čas izvedbe ukrepov zajezitve
                </label>
                <input
                  type="datetime-local"
                  value={formData.containment_datetime}
                  onChange={(e) => handleChange('containment_datetime', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Rok izvedbe korektivnih ukrepov
                </label>
                <input
                  type="date"
                  value={formData.corrective_deadline}
                  onChange={(e) => handleChange('corrective_deadline', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Načrtovani korektivni ukrepi
              </label>
              <textarea
                rows={4}
                value={formData.corrective_measures}
                onChange={(e) => handleChange('corrective_measures', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                placeholder="Opisnite ukrepe za preprečevanje ponovitve..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Odgovorna oseba za izvedbo
              </label>
              <input
                type="text"
                value={formData.corrective_owner}
                onChange={(e) => handleChange('corrective_owner', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ime in priimek odgovorne osebe"
              />
            </div>
          </div>
        )

      case 'F':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">ZVOP-2 nacionalne zahteve</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ali sistem obdeluje posebne podatke? (ZVOP-2 člen 23)
                </label>
                <select
                  value={formData.special_processing ? 'yes' : 'no'}
                  onChange={(e) => handleChange('special_processing', e.target.value === 'yes')}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="no">Ne</option>
                  <option value="yes">Da</option>
                  <option value="partial">Delno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Lokacija hrambe podatkov
                </label>
                <select
                  value={formData.data_location}
                  onChange={(e) => handleChange('data_location', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Izberite lokacijo</option>
                  <option value="slovenia_only">Samo v RS (obvezno za zbirke iz 23. člena)</option>
                  <option value="slovenia_eu">V RS in EU/EEA</option>
                  <option value="outside_eu">Izven EU/EEA (s primernimi zaščitnimi ukrepi)</option>
                  <option value="unknown">Ni znano</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Ali je potrebna priglasitev CSIRT? (ZInfV-1)
              </label>
              <select
                value={formData.csirt_notified ? 'yes' : 'no'}
                onChange={(e) => {
                  const notified = e.target.value === 'yes'
                  handleChange('csirt_notified', notified)
                  if (notified) {
                    const now = new Date().toISOString().slice(0, 16)
                    handleChange('csirt_notification_datetime', now)
                  }
                }}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="no">Ne</option>
                <option value="yes">Da</option>
                <option value="unknown">Ni znano</option>
              </select>
            </div>

            {formData.csirt_notified && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Datum priglasitve CSIRT
                </label>
                <input
                  type="datetime-local"
                  value={formData.csirt_notification_datetime}
                  onChange={(e) => handleChange('csirt_notification_datetime', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        )

      case 'G':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">Sledljivost posredovanj (ZVOP-2 člen 41)</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Ali so bili podatki posredovani tretjim osebam?
              </label>
              <select
                value={formData.transfers_made ? 'yes' : 'no'}
                onChange={(e) => handleChange('transfers_made', e.target.value === 'yes')}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="no">Ne</option>
                <option value="yes">Da</option>
                <option value="partial">Delno</option>
              </select>
              <p className="text-xs text-text-muted mt-1">
                Rok hrambe evidence posredovanj: 2 leti od datuma posredovanja (ZVOP-2 člen 41)
              </p>
            </div>
          </div>
        )

      case 'H':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h5 text-text-primary mb-4">Dokumentacija in dokazila</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Priložena dokumentacija
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  handleChange('evidence_attachments', files)
                }}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-accent-primary file:text-white hover:file:bg-accent-primary-hover"
              />
              <p className="text-xs text-text-muted mt-1">
                Dovoljene vrste: PDF, DOC, JPG, PNG | Max velikost: 10MB na datoteko
              </p>
              {formData.evidence_attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-text-secondary mb-2">Izbrane datoteke:</p>
                  {formData.evidence_attachments.map((file, index) => (
                    <div key={index} className="text-sm text-text-primary bg-bg-near-black px-3 py-2 rounded mb-2">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Dodatne opombe
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none resize-vertical"
                placeholder="Dodatne informacije, ki niso zajete v zgornjih poljih..."
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-accent-primary" />
            <h2 className="text-h3 text-text-primary">Evidenca incidenta - GDPR člen 33-34</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">
                Korak {currentSection + 1} od {FORM_SECTIONS.length}
              </span>
              <span className="text-sm text-text-secondary">
                {Math.round(((currentSection + 1) / FORM_SECTIONS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-bg-near-black rounded-full h-2">
              <div 
                className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSection + 1) / FORM_SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              {FORM_SECTIONS.map((section, index) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setCurrentSection(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors whitespace-nowrap ${
                      currentSection === index 
                        ? 'bg-accent-primary text-white' 
                        : index < currentSection
                        ? 'bg-status-success/10 text-status-success'
                        : 'bg-bg-near-black text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{section.id}: {section.title}</span>
                    <span className="md:hidden">{section.id}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section Content */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-h5 text-text-primary">
                  {FORM_SECTIONS[currentSection].id}: {FORM_SECTIONS[currentSection].title}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {FORM_SECTIONS[currentSection].description}
                </p>
              </div>
            </div>
            {renderSection()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <div>
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Prejšnji korak
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
              >
                Prekliči
              </button>
              
              {currentSection < FORM_SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (canProceedToNext()) {
                      setCurrentSection(currentSection + 1)
                    } else {
                      alert('Prosim izpolnite vsa obvezna polja pred nadaljevanjem.')
                    }
                  }}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors duration-150 disabled:opacity-50"
                >
                  Naslednji korak
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-status-success text-white rounded hover:bg-status-success-hover transition-colors duration-150 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Shranjevanje...' : 'Shrani incident'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
