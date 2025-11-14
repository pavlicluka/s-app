import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../common/Modal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationId } from '../../hooks/useOrganizationId'

interface ISMScopeAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISMScopeAddModal({ isOpen, onClose, onSave }: ISMScopeAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId } = useOrganizationId()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    scope_name: '',
    scope_description: '',
    scope_boundaries: '',
    organizational_units: '',
    business_processes: '',
    information_types: '',
    systems_applications: '',
    third_party_interfaces: '',
    regulatory_requirements: '',
    exclusions: '',
    exclusion_justification: '',
    status: 'draft',
    responsible_person: '',
    effective_date: '',
    review_date: '',
    connection_risk_assessment: '',
    connection_soa: '',
    connection_policies: '',
    organization_id: organizationId || ''
  })
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

  useEffect(() => {
    if (isOpen && userProfile?.organization_id) {
      setFormData(prev => ({ ...prev, organization_id: userProfile.organization_id }))
    }
  }, [isOpen, userProfile])

  const resetForm = () => {
    setFormData({
      scope_name: '',
      scope_description: '',
      scope_boundaries: '',
      organizational_units: '',
      business_processes: '',
      information_types: '',
      systems_applications: '',
      third_party_interfaces: '',
      regulatory_requirements: '',
      exclusions: '',
      exclusion_justification: '',
      status: 'draft',
      responsible_person: '',
      effective_date: '',
      review_date: '',
      connection_risk_assessment: '',
      connection_soa: '',
      connection_policies: '',
      organization_id: organizationId || ''
    })
    setValidationErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Required fields
    if (!formData.scope_name?.trim()) {
      errors.scope_name = 'Naziv obsega je obvezno polje'
    }
    if (!formData.scope_description?.trim()) {
      errors.scope_description = 'Opis obsega je obvezno polje'
    }
    if (!formData.scope_boundaries?.trim()) {
      errors.scope_boundaries = 'Mejne opredelitve so obvezno polje'
    }
    if (!formData.organizational_units?.trim()) {
      errors.organizational_units = 'Organizacijske enote so obvezno polje'
    }
    if (!formData.responsible_person?.trim()) {
      errors.responsible_person = 'Odgovorna oseba je obvezno polje'
    }
    if (!formData.effective_date?.trim()) {
      errors.effective_date = 'Datum veljavnosti je obvezno polje'
    }
    if (!formData.review_date?.trim()) {
      errors.review_date = 'Datum pregleda je obvezno polje'
    }

    // Organization context
    if (!userProfile?.organization_id) {
      errors.organization_id = 'Organizacijski kontekst ni na voljo'
    }
    
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
      const { error } = await supabase
        .from('isms_scope')
        .insert([{
          ...formData,
          organization_id: userProfile.organization_id
        }])

      if (error) {
        if (error.code === '23502') {
          throw new Error('Nekatera obvezna polja niso izpolnjena')
        } else if (error.code === '23505') {
          throw new Error('Vrednost že obstaja')
        } else {
          throw error
        }
      }
      
      onSave()
      handleClose()
    } catch (error: any) {
      console.error('Error creating ISMS scope:', error)
      alert(error.message || 'Prišlo je do napake pri ustvarjanju obsega')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dodaj nov obseg ISMS"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Osnovne informacije
          </h4>
          
          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Naziv obsega <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={formData.scope_name}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_name: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.scope_name ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Vnesite naziv obsega"
              required
            />
            {validationErrors.scope_name && <p className="text-body-sm text-status-error">{validationErrors.scope_name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Opis obsega <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.scope_description}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_description: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.scope_description ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Podroben opis obsega ISMS"
              required
            />
            {validationErrors.scope_description && <p className="text-body-sm text-status-error">{validationErrors.scope_description}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Mejne opredelitve <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.scope_boundaries}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_boundaries: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.scope_boundaries ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Fizične, organizacijske, informacijske in pogodbene meje"
              required
            />
            {validationErrors.scope_boundaries && <p className="text-body-sm text-status-error">{validationErrors.scope_boundaries}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Organizacijske enote <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.organizational_units}
              onChange={(e) => setFormData(prev => ({ ...prev, organizational_units: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.organizational_units ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Katere enote, oddelki, podružnice so vključene"
              required
            />
            {validationErrors.organizational_units && <p className="text-body-sm text-status-error">{validationErrors.organizational_units}</p>}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Podrobne informacije
          </h4>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Poslovni procesi
            </label>
            <textarea
              value={formData.business_processes}
              onChange={(e) => setFormData(prev => ({ ...prev, business_processes: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Ključni procesi, ki ustvarjajo/obdelujejo varovane informacije"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Tipi informacij
            </label>
            <textarea
              value={formData.information_types}
              onChange={(e) => setFormData(prev => ({ ...prev, information_types: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Katere informacije so predmet varstva (osebni podatki, intelektualna lastnina, itd.)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Sistemi in aplikacije
            </label>
            <textarea
              value={formData.systems_applications}
              onChange={(e) => setFormData(prev => ({ ...prev, systems_applications: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Ključni sistemi, aplikacije, segmenti omrežij"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Vmesniki do tretjih oseb
            </label>
            <textarea
              value={formData.third_party_interfaces}
              onChange={(e) => setFormData(prev => ({ ...prev, third_party_interfaces: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Oblak/SaaS, IDaaS, kolokacije, integracije"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Regulatorne zahteve
            </label>
            <textarea
              value={formData.regulatory_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, regulatory_requirements: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Zakoni, predpisi, pogodbe, ki vplivajo na obseg"
            />
          </div>
        </div>

        {/* Exclusions */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Izključitve (če obstajajo)
          </h4>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Izključitve
            </label>
            <textarea
              value={formData.exclusions}
              onChange={(e) => setFormData(prev => ({ ...prev, exclusions: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Kaj je izven obsega in zakaj"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Utemeljitev izključitve
            </label>
            <textarea
              value={formData.exclusion_justification}
              onChange={(e) => setFormData(prev => ({ ...prev, exclusion_justification: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Razlogi in kontrolni vmesniki za izključitve"
            />
          </div>
        </div>

        {/* Management Information */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Upravljavske informacije
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="draft">Osnutek</option>
                <option value="under_review">V pregledu</option>
                <option value="approved">Odobren</option>
                <option value="active">Aktiven</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Odgovorna oseba <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={formData.responsible_person}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible_person: e.target.value }))}
                className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  validationErrors.responsible_person ? 'border-status-error' : 'border-border-subtle'
                }`}
                placeholder="Ime odgovorne osebe"
                required
              />
              {validationErrors.responsible_person && <p className="text-body-sm text-status-error">{validationErrors.responsible_person}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Datum veljavnosti <span className="text-status-error">*</span>
              </label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  validationErrors.effective_date ? 'border-status-error' : 'border-border-subtle'
                }`}
                required
              />
              {validationErrors.effective_date && <p className="text-body-sm text-status-error">{validationErrors.effective_date}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Datum pregleda <span className="text-status-error">*</span>
              </label>
              <input
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
                className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  validationErrors.review_date ? 'border-status-error' : 'border-border-subtle'
                }`}
                required
              />
              {validationErrors.review_date && <p className="text-body-sm text-status-error">{validationErrors.review_date}</p>}
            </div>
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Povezave z drugimi dokumenti
          </h4>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Povezava z RA
            </label>
            <input
              type="text"
              value={formData.connection_risk_assessment}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_risk_assessment: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na oceno tveganj"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Povezava s SoA
            </label>
            <input
              type="text"
              value={formData.connection_soa}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_soa: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na izjavo o uporabnosti"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Povezava s politikami
            </label>
            <input
              type="text"
              value={formData.connection_policies}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_policies: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na povezane politike"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleClose}
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