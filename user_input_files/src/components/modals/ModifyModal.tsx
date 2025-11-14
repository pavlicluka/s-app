import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import DeleteConfirmModal from '../common/DeleteConfirmModal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'

interface ModifyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  mode: 'edit' | 'delete' | 'view'
  record?: any
  title: string
  table: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'date' | 'datetime' | 'number'
    required?: boolean
    options?: string[]
    dataSource?: {
      table: string
      idField: string
      labelField: string
      filterField?: string
    }
  }>
  defaultValues?: Record<string, string>
}

export default function ModifyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  record, 
  title, 
  table, 
  fields, 
  defaultValues = {} 
}: ModifyModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>(defaultValues)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)
  const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({})

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

  // Fetch related data for dropdown fields
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!userProfile?.organization_id) return

      const data: Record<string, any[]> = {}

      for (const field of fields) {
        if (field.type === 'select' && field.dataSource) {
          try {
            let query = supabase
              .from(field.dataSource.table)
              .select(`${field.dataSource.idField}, ${field.dataSource.labelField}`)
              .eq('organization_id', userProfile.organization_id)

            // Apply filter if specified
            if (field.dataSource.filterField) {
              query = query.eq(field.dataSource.filterField, 'active')
            }

            const { data: records, error } = await query

            if (error) {
              console.error(`Error fetching ${field.dataSource.table}:`, error)
              continue
            }

            data[field.key] = records || []
          } catch (error) {
            console.error(`Error fetching dropdown data for ${field.key}:`, error)
          }
        }
      }

      setDropdownData(data)
    }

    if (isOpen && userProfile?.organization_id) {
      fetchDropdownData()
    }
  }, [userProfile, isOpen, fields])

  // Load record data for editing/viewing
  useEffect(() => {
    if (record && (mode === 'edit' || mode === 'view')) {
      const initialData: Record<string, string> = { ...defaultValues }
      fields.forEach(field => {
        initialData[field.key] = record[field.key]?.toString() || ''
      })
      setFormData(initialData)
    } else {
      setFormData(defaultValues)
    }
    setValidationErrors({})
  }, [mode, record, defaultValues, fields])

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

  const handleEdit = async (e: React.FormEvent) => {
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
      
      const { error } = await supabase
        .from(table)
        .update(submissionData)
        .eq('id', record.id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        // Handle specific database errors
        if (error.code === '23502') {
          throw new Error('Nekatera obvezna polja niso izpolnjena')
        } else if (error.code === '23505') {
          throw new Error('Vrednost že obstaja')
        } else {
          throw error
        }
      }
      
      onSave()
    } catch (error: any) {
      console.error('Error updating record:', error)
      alert(error.message || 'Prišlo je do napake pri posodabljanju zapisa')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!record?.id || !userProfile?.organization_id) {
      alert('Manjkajo podatki za brisanje')
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', record.id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        throw error
      }
      
      onSave()
    } catch (error: any) {
      console.error('Error deleting record:', error)
      alert(error.message || 'Prišlo je do napake pri brisanju zapisa')
    } finally {
      setDeleting(false)
    }
  }

  const handlePDFExport = async () => {
    if (!record) return
    
    setGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF()
      
      // Set font to default (Helvetica)
      pdf.setFont('helvetica')
      
      // Add title
      pdf.setFontSize(16)
      pdf.text('Podrobnosti ocene tveganja', 20, 20)
      
      // Add subtitle with record ID
      pdf.setFontSize(12)
      const recordTitle = record.risk_id || record.asset_name || 'Risk Assessment'
      pdf.text(`ID tveganja: ${recordTitle}`, 20, 35)
      
      let yPosition = 55
      
      // Add fields to PDF
      fields.forEach(field => {
        const value = formData[field.key] || 'Ni podatka'
        const displayValue = formatFieldForPDF(value, field.type, field.key)
        
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
        
        // Add field label
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(field.label + ':', 20, yPosition)
        
        // Add field value
        pdf.setFont('helvetica', 'normal')
        const wrappedText = pdf.splitTextToSize(displayValue, 170)
        pdf.text(wrappedText, 20, yPosition + 8)
        
        yPosition += 20 + (wrappedText.length - 1) * 5
      })
      
      // Add footer
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text(`Izvoženo: ${new Date().toLocaleDateString('sl-SI')}`, 20, 280)
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `ocena_tveganja_${recordTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`
      
      // Save PDF
      pdf.save(filename)
      
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      alert('Prišlo je do napake pri ustvarjanju PDF datoteke')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const formatFieldForPDF = (value: string, type: string, key: string) => {
    if (value === 'Ni podatka') return value
    
    switch (type) {
      case 'select':
        return getDisplayOption(value, key)
      case 'date':
        return value ? new Date(value).toLocaleDateString('sl-SI') : 'Ni podatka'
      case 'number':
        return value || 'Ni podatka'
      default:
        return value || 'Ni podatka'
    }
  }

  const getDisplayOption = (option: string, fieldKey: string) => {
    // Policy type translations
    const policyTypeTranslations: Record<string, string> = {
      'information_security_general': 'Splošna varnost informacij',
      'access_control': 'Kontrola dostopa', 
      'data_protection': 'Varstvo podatkov',
      'incident_response': 'Obvladovanje incidentov',
      'business_continuity': 'Kontinuiteta poslovanja',
      'supplier_security': 'Varnost dobaviteljev',
      'physical_security': 'Fizična varnost',
      'human_resources': 'Človeški viri',
      'risk_management': 'Upravljanje tveganj',
      'compliance': 'Skladnost'
    }

    // Status translations
    const statusTranslations: Record<string, string> = {
      'draft': 'Osnutek',
      'under_review': 'V pregledu',
      'approved': 'Odobren', 
      'active': 'Aktiven',
      'retired': 'Povlečen'
    }

    if (fieldKey === 'policy_type') {
      return policyTypeTranslations[option] || option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    if (fieldKey === 'status') {
      return statusTranslations[option] || option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const renderField = (field: any) => {
    const value = formData[field.key] || ''
    const error = validationErrors[field.key]

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              {field.label}
              {field.required && <span className="text-status-error ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                error ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder={`Vnesite ${field.label.toLowerCase()}`}
              required={field.required}
              disabled={mode === 'view'}
            />
            {error && <p className="text-body-sm text-status-error">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              {field.label}
              {field.required && <span className="text-status-error ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                error ? 'border-status-error' : 'border-border-subtle'
              }`}
              required={field.required}
              disabled={mode === 'view'}
            >
              <option value="">Izberite {field.label.toLowerCase()}</option>
              {field.dataSource ? (
                // Use data from related table
                (dropdownData[field.key] || []).map(item => (
                  <option key={item[field.dataSource.idField]} value={item[field.dataSource.idField]}>
                    {item[field.dataSource.labelField]}
                  </option>
                ))
              ) : (
                // Use static options
                field.options?.map(option => (
                  <option key={option} value={option}>
                    {getDisplayOption(option, field.key)}
                  </option>
                ))
              )}
            </select>
            {error && <p className="text-body-sm text-status-error">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              {field.label}
              {field.required && <span className="text-status-error ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                error ? 'border-status-error' : 'border-border-subtle'
              }`}
              required={field.required}
              disabled={mode === 'view'}
            />
            {error && <p className="text-body-sm text-status-error">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              {field.label}
              {field.required && <span className="text-status-error ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                error ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder={`Vnesite ${field.label.toLowerCase()}`}
              required={field.required}
              disabled={mode === 'view'}
            />
            {error && <p className="text-body-sm text-status-error">{error}</p>}
          </div>
        )

      default: // text
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              {field.label}
              {field.required && <span className="text-status-error ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                error ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder={`Vnesite ${field.label.toLowerCase()}`}
              required={field.required}
              disabled={mode === 'view'}
            />
            {error && <p className="text-body-sm text-status-error">{error}</p>}
          </div>
        )
    }
  }

  const renderFieldView = (field: any) => {
    const value = formData[field.key] || ''
    const displayValue = value || 'Ni podatka'

    const formatDisplayValue = (val: string, type: string, fieldKey?: string) => {
      if (val === 'Ni podatka') return val
      
      switch (type) {
        case 'select':
          return getDisplayOption(val, fieldKey || '')
        case 'date':
          return val ? new Date(val).toLocaleDateString('sl-SI') : 'Ni podatka'
        default:
          return val
      }
    }

    return (
      <div key={field.key} className="space-y-2">
        <label className="block text-body text-text-primary font-medium">
          {field.label}
          {field.required && <span className="text-status-error ml-1">*</span>}
        </label>
        <div className="w-full min-h-[40px] px-3 py-2 bg-bg-near-black border border-border-subtle rounded-sm text-body text-text-primary flex items-center">
          {field.type === 'textarea' ? (
            <div className="whitespace-pre-wrap break-words">
              {formatDisplayValue(value, field.type, field.key)}
            </div>
          ) : (
            <span>{formatDisplayValue(displayValue, field.type, field.key)}</span>
          )}
        </div>
      </div>
    )
  }

  if (mode === 'delete' && record) {
    return (
      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        title={title}
        message={`Ali ste prepričani, da želite izbrisati oceno tveganja "${record.risk_id || record.asset_name}"?`}
        isDeleting={deleting}
      />
    )
  }

  if (mode === 'view') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {fields.map(renderFieldView)}
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePDFExport}
              disabled={generatingPDF || !record}
              className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {generatingPDF ? 'Ustvarjam PDF...' : 'PDF izvoz'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-bg-near-black hover:bg-surface text-text-primary rounded-sm transition-colors duration-150"
            >
              Zapri
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleEdit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {fields.map(renderField)}
        
        <div className="flex items-center gap-3 justify-end pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-bg-near-black hover:bg-surface text-text-primary rounded-sm transition-colors duration-150"
          >
            Prekliči
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 disabled:opacity-50"
          >
            {loading ? 'Shranjujem...' : 'Shrani'}
          </button>
        </div>
      </form>
    </Modal>
  )
}