import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Phone, FileText, Calendar, Flag, Tag, Settings, Star, CheckCircle } from 'lucide-react'

interface AddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  title: string
  table: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'date' | 'datetime' | 'number'
    required?: boolean
    options?: string[]
  }>
  defaultValues?: Record<string, string>
}

export default function AddModal({ isOpen, onClose, onSave, title, table, fields, defaultValues = {} }: AddModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>(defaultValues)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    fields.forEach(field => {
      if (field.required) {
        const value = formData[field.key] || defaultValues[field.key] || ''
        if (!value.trim()) {
          errors[field.key] = `${field.label} je obvezno polje`
        }
      }
      
      // Special validation for organization_id
      if (field.key === 'organization_id') {
        const orgId = formData[field.key] || defaultValues[field.key] || userProfile?.organization_id || ''
        if (!orgId.trim()) {
          errors[field.key] = 'ID organizacije je obvezno polje'
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      // Validate organization context
      if (!userProfile?.organization_id) {
        throw new Error('Organizacijski kontekst ni na voljo')
      }

      // Merge default values with current form data, ensuring organization_id is included
      const submissionData = {
        ...defaultValues,
        ...formData,
        organization_id: userProfile.organization_id
      }
      
      const { error } = await supabase.from(table).insert([submissionData])
      if (error) {
        // Handle specific database errors
        if (error.code === '23502') {
          throw new Error('Manjkajo obvezna polja')
        } else if (error.code === '23505') {
          throw new Error('Zapis s tem ID-jem že obstaja')
        } else {
          throw error
        }
      }
      
      onSave()
      onClose()
      setFormData(defaultValues)
      setValidationErrors({})
    } catch (error: any) {
      console.error('Napaka pri shranjevanju:', error)
      const errorMessage = error.message || 'Napaka pri shranjevanju podatkov'
      if (errorMessage.includes('Organizacijski kontekst')) {
        alert('Napaka: ' + errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => ({ ...prev, [key]: '' }))
    }
  }
  
  const resetForm = () => {
    setFormData(defaultValues)
    setValidationErrors({})
  }

  const translateOption = (option: string, fieldKey: string) => {
    // Translate options based on field type
    if (fieldKey === 'priority') {
      const priorityMap: { [key: string]: string } = {
        'low': 'Nizka',
        'medium': 'Srednja', 
        'high': 'Visoka',
        'urgent': 'Nujna'
      }
      return priorityMap[option] || option
    }
    
    if (fieldKey === 'status') {
      const statusMap: { [key: string]: string } = {
        'open': 'Odprto',
        'in_progress': 'V teku',
        'waiting_for_customer': 'Čakanje na stranko',
        'resolved': 'Rešeno',
        'closed': 'Zaprto',
        'active': 'Aktivna',
        'inactive': 'Neaktivna',
        'maintenance': 'Vzdrževanje'
      }
      return statusMap[option] || option
    }

    if (fieldKey === 'device_type') {
      const deviceTypeMap: { [key: string]: string } = {
        'server': 'Strežnik',
        'workstation': 'Delovna postaja',
        'laptop': 'Prenosnik',
        'mobile_device': 'Mobilna naprava',
        'network_device': 'Omrežna naprava',
        'printer': 'Tiskalnik',
        'storage_device': 'Naprava za shranjevanje',
        'security_device': 'Varnostna naprava',
        'iot_device': 'IoT naprava',
        'other': 'Drugo'
      }
      return deviceTypeMap[option] || option
    }

    if (fieldKey === 'asset_type') {
      const assetTypeMap: { [key: string]: string } = {
        'hardware': 'Strojna oprema',
        'software': 'Programska oprema',
        'data': 'Podatki',
        'service': 'Storitev',
        'facility': 'Prostor',
        'human_resource': 'Človeški viri',
        'intellectual_property': 'Intelektualna lastnina',
        'reputation': 'Sloves',
        'business_process': 'Poslovni proces'
      }
      return assetTypeMap[option] || option
    }

    if (fieldKey === 'classification') {
      const classificationMap: { [key: string]: string } = {
        'public': 'Javno',
        'internal': 'Interno',
        'confidential': 'Zaupno',
        'restricted': 'Omejeno'
      }
      return classificationMap[option] || option
    }

    if (fieldKey === 'value_rating') {
      const valueRatingMap: { [key: string]: string } = {
        'very_low': 'Zelo nizka',
        'low': 'Nizka',
        'medium': 'Srednja',
        'high': 'Visoka',
        'very_high': 'Zelo visoka'
      }
      return valueRatingMap[option] || option
    }

    if (fieldKey === 'risk_level') {
      const riskLevelMap: { [key: string]: string } = {
        'low': 'Nizko',
        'Low': 'Nizko',
        'medium': 'Srednje',
        'Medium': 'Srednje',
        'high': 'Visoko',
        'High': 'Visoko',
        'very_low': 'Zelo nizko',
        'very_high': 'Zelo visoko',
        'critical': 'Kritično'
      }
      return riskLevelMap[option] || option
    }
    
    if (fieldKey === 'category') {
      const categoryMap: { [key: string]: string } = {
        'technical_issue': 'Tehnična težava',
        'access_request': 'Zahteva za dostop',
        'password_reset': 'Ponastavitev gesla',
        'software_install': 'Namestitev programske opreme',
        'hardware_issue': 'Težava s strojno opremo',
        'network_problem': 'Težava z omrežjem',
        'security_incident': 'Varnostni incident',
        'compliance_question': 'Vprašanje o skladnosti',
        'training_request': 'Zahteva za usposabljanje',
        'other': 'Drugo'
      }
      return categoryMap[option] || option
    }
    
    return option
  }

  const getFieldIcon = (field: typeof fields[0]) => {
    if (field.key.includes('name') || field.key.includes('ime')) return <User className="w-4 h-4" />
    if (field.key.includes('email') || field.key.includes('e-naslov')) return <Mail className="w-4 h-4" />
    if (field.key.includes('telefon') || field.key.includes('phone')) return <Phone className="w-4 h-4" />
    if (field.key.includes('subject') || field.key.includes('zadeva') || field.key === 'description' || field.key === 'resolution_notes') return <FileText className="w-4 h-4" />
    if (field.key.includes('date') || field.key.includes('termin')) return <Calendar className="w-4 h-4" />
    if (field.key === 'priority') return <Flag className="w-4 h-4" />
    if (field.key === 'category') return <Tag className="w-4 h-4" />
    if (field.key === 'status') return <CheckCircle className="w-4 h-4" />
    if (field.key === 'assigned_to') return <Settings className="w-4 h-4" />
    if (field.key === 'satisfaction_rating') return <Star className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getSectionTitle = (fieldKey: string) => {
    if (fieldKey.includes('ticket_id') || fieldKey.includes('subject') || fieldKey.includes('description') || fieldKey.includes('requester')) {
      return 'Osnovne informacije'
    }
    if (fieldKey === 'priority' || fieldKey === 'status' || fieldKey === 'category' || fieldKey === 'assigned_to') {
      return 'Podrobnosti zahtevka'
    }
    if (fieldKey.includes('date') || fieldKey === 'resolved_date' || fieldKey === 'resolution_notes' || fieldKey === 'satisfaction_rating') {
      return 'Zaključek in ocena'
    }
    return null
  }

  const renderField = (field: typeof fields[0]) => {
    const commonProps = {
      id: field.key,
      value: formData[field.key] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(field.key, e.target.value),
      required: field.required,
      className: "w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-none`}
          />
        )
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Izberite...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{translateOption(option, field.key)}</option>
            ))}
          </select>
        )
      case 'datetime':
        return (
          <input
            {...commonProps}
            type="datetime-local"
            className={commonProps.className}
          />
        )
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            className={commonProps.className}
          />
        )
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            className={commonProps.className}
          />
        )
      default:
        return (
          <input
            {...commonProps}
            type="text"
            className={commonProps.className}
          />
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Check if this is a software inventory form - render all fields in order */}
        {table === 'inventory_software' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label htmlFor={field.key} className="block text-body-sm font-medium text-text-primary mb-2">
                    {getFieldIcon(field)}
                    <span className="ml-2">{field.label} {field.required && <span className="text-status-error">*</span>}</span>
                  </label>
                  {renderField(field)}
                  {validationErrors[field.key] && (
                    <p className="text-status-error text-xs mt-1">{validationErrors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Osnovne informacije */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Osnovne informacije
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.filter(field => 
                  field.key.includes('ticket_id') || field.key.includes('subject') || 
                  field.key.includes('description') || field.key.includes('requester')
                ).map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label htmlFor={field.key} className="block text-body-sm font-medium text-text-primary mb-2">
                      {getFieldIcon(field)}
                      <span className="ml-2">{field.label} {field.required && <span className="text-status-error">*</span>}</span>
                    </label>
                    {renderField(field)}
                    {validationErrors[field.key] && (
                      <p className="text-status-error text-xs mt-1">{validationErrors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Podrobnosti zahtevka */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Podrobnosti zahtevka
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.filter(field => 
                  field.key === 'priority' || field.key === 'status' || 
                  field.key === 'category' || field.key === 'assigned_to'
                ).map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label htmlFor={field.key} className="block text-body-sm font-medium text-text-primary mb-2">
                      {getFieldIcon(field)}
                      <span className="ml-2">{field.label} {field.required && <span className="text-status-error">*</span>}</span>
                    </label>
                    {renderField(field)}
                    {validationErrors[field.key] && (
                      <p className="text-status-error text-xs mt-1">{validationErrors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Zaključek in ocena */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Zaključek in ocena
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.filter(field => 
                  field.key.includes('date') || field.key === 'resolved_date' || 
                  field.key === 'resolution_notes' || field.key === 'satisfaction_rating'
                ).map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label htmlFor={field.key} className="block text-body-sm font-medium text-text-primary mb-2">
                      {getFieldIcon(field)}
                      <span className="ml-2">{field.label} {field.required && <span className="text-status-error">*</span>}</span>
                    </label>
                    {renderField(field)}
                    {validationErrors[field.key] && (
                      <p className="text-status-error text-xs mt-1">{validationErrors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150"
          >
            Prekliči
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Shranjujem...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Shrani
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}