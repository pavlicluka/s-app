import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../common/Modal'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationId } from '../../hooks/useOrganizationId'

interface InformationSecurityPolicyAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function InformationSecurityPolicyAddModal({ isOpen, onClose, onSave }: InformationSecurityPolicyAddModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId } = useOrganizationId()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    policy_name: '',
    policy_type: '',
    policy_description: '',
    scope_of_application: '',
    policy_objectives: '',
    policy_requirements: '',
    roles_and_responsibilities: '',
    compliance_requirements: '',
    implementation_guidelines: '',
    monitoring_requirements: '',
    review_procedures: '',
    version: '1.0',
    status: 'draft',
    effective_date: '',
    review_date: '',
    approval_authority: '',
    connection_policies: '',
    connection_procedures: '',
    connection_risk_assessment: '',
    connection_soa: '',
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
      policy_name: '',
      policy_type: '',
      policy_description: '',
      scope_of_application: '',
      policy_objectives: '',
      policy_requirements: '',
      roles_and_responsibilities: '',
      compliance_requirements: '',
      implementation_guidelines: '',
      monitoring_requirements: '',
      review_procedures: '',
      version: '1.0',
      status: 'draft',
      effective_date: '',
      review_date: '',
      approval_authority: '',
      connection_policies: '',
      connection_procedures: '',
      connection_risk_assessment: '',
      connection_soa: '',
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
    if (!formData.policy_name?.trim()) {
      errors.policy_name = 'Naziv politike je obvezno polje'
    }
    if (!formData.policy_type?.trim()) {
      errors.policy_type = 'Tip politike je obvezno polje'
    }
    if (!formData.policy_description?.trim()) {
      errors.policy_description = 'Opis politike je obvezno polje'
    }
    if (!formData.scope_of_application?.trim()) {
      errors.scope_of_application = 'Področje uporabe je obvezno polje'
    }
    if (!formData.policy_objectives?.trim()) {
      errors.policy_objectives = 'Cilji politike so obvezno polje'
    }
    if (!formData.policy_requirements?.trim()) {
      errors.policy_requirements = 'Zahteve politike so obvezno polje'
    }
    if (!formData.roles_and_responsibilities?.trim()) {
      errors.roles_and_responsibilities = 'Vloge in odgovornosti so obvezno polje'
    }
    if (!formData.version?.trim()) {
      errors.version = 'Verzija je obvezno polje'
    }
    if (!formData.approval_authority?.trim()) {
      errors.approval_authority = 'Avtor odobritve je obvezno polje'
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
        .from('information_security_policy')
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
      console.error('Error creating information security policy:', error)
      alert(error.message || 'Prišlo je do napake pri ustvarjanju politike')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dodaj novo politiko informacijske varnosti"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Osnovne informacije
          </h4>
          
          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Naziv politike <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={formData.policy_name}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_name: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.policy_name ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Vnesite naziv politike"
              required
            />
            {validationErrors.policy_name && <p className="text-body-sm text-status-error">{validationErrors.policy_name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Tip politike <span className="text-status-error">*</span>
            </label>
            <select
              value={formData.policy_type}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_type: e.target.value }))}
              className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.policy_type ? 'border-status-error' : 'border-border-subtle'
              }`}
              required
            >
              <option value="">Izberite tip politike</option>
              <option value="information_security_general">Splošna varnost informacij</option>
              <option value="access_control">Kontrola dostopa</option>
              <option value="data_protection">Varstvo podatkov</option>
              <option value="incident_response">Obvladovanje incidentov</option>
              <option value="business_continuity">Kontinuiteta poslovanja</option>
              <option value="supplier_security">Varnost dobaviteljev</option>
              <option value="physical_security">Fizična varnost</option>
              <option value="human_resources">Človeški viri</option>
              <option value="risk_management">Upravljanje tveganj</option>
              <option value="compliance">Skladnost</option>
            </select>
            {validationErrors.policy_type && <p className="text-body-sm text-status-error">{validationErrors.policy_type}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Opis politike <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.policy_description}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_description: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.policy_description ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Podroben opis namena in ciljev politike"
              required
            />
            {validationErrors.policy_description && <p className="text-body-sm text-status-error">{validationErrors.policy_description}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Področje uporabe <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.scope_of_application}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_of_application: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.scope_of_application ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Katere sisteme, procese in osebe politika zajema"
              required
            />
            {validationErrors.scope_of_application && <p className="text-body-sm text-status-error">{validationErrors.scope_of_application}</p>}
          </div>
        </div>

        {/* Policy Content */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Vsebina politike
          </h4>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Cilji politike <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.policy_objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_objectives: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.policy_objectives ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Kaj politika želi doseči - specifični, merljivi cilji"
              required
            />
            {validationErrors.policy_objectives && <p className="text-body-sm text-status-error">{validationErrors.policy_objectives}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Zahteve politike <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.policy_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_requirements: e.target.value }))}
              className={`w-full h-32 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.policy_requirements ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Specifične zahteve, ki jih morajo organizacije izpolnjevati"
              required
            />
            {validationErrors.policy_requirements && <p className="text-body-sm text-status-error">{validationErrors.policy_requirements}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Vloge in odgovornosti <span className="text-status-error">*</span>
            </label>
            <textarea
              value={formData.roles_and_responsibilities}
              onChange={(e) => setFormData(prev => ({ ...prev, roles_and_responsibilities: e.target.value }))}
              className={`w-full h-24 px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                validationErrors.roles_and_responsibilities ? 'border-status-error' : 'border-border-subtle'
              }`}
              placeholder="Kdo je odgovoren za kaj - vloge, pooblastila, odgovornosti"
              required
            />
            {validationErrors.roles_and_responsibilities && <p className="text-body-sm text-status-error">{validationErrors.roles_and_responsibilities}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Zahteve skladnosti
            </label>
            <textarea
              value={formData.compliance_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, compliance_requirements: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Zakoni, predpisi, standardi, ki jih je treba upoštevati"
            />
          </div>
        </div>

        {/* Implementation */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Izvajanje in spremljanje
          </h4>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Navodila za izvajanje
            </label>
            <textarea
              value={formData.implementation_guidelines}
              onChange={(e) => setFormData(prev => ({ ...prev, implementation_guidelines: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Kako politiko implementirati - koraki, orodja, postopki"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Zahteve spremljanja
            </label>
            <textarea
              value={formData.monitoring_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, monitoring_requirements: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Kako spremljati skladnost s politiko - metrije, KPI, poročanje"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Postopki pregleda
            </label>
            <textarea
              value={formData.review_procedures}
              onChange={(e) => setFormData(prev => ({ ...prev, review_procedures: e.target.value }))}
              className="w-full h-20 px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Kako pogosto in na kakšen način se politika pregleda in posodobi"
            />
          </div>
        </div>

        {/* Management Information */}
        <div className="space-y-4">
          <h4 className="text-body font-medium text-text-primary border-b border-border-subtle pb-2">
            Upravljavske informacije
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Verzija <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  validationErrors.version ? 'border-status-error' : 'border-border-subtle'
                }`}
                placeholder="n.m"
                required
              />
              {validationErrors.version && <p className="text-body-sm text-status-error">{validationErrors.version}</p>}
            </div>

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
                <option value="retired">Povlečen</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-body text-text-primary font-medium">
                Avtor odobritve <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={formData.approval_authority}
                onChange={(e) => setFormData(prev => ({ ...prev, approval_authority: e.target.value }))}
                className={`w-full px-3 py-2 bg-bg-pure-black border rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  validationErrors.approval_authority ? 'border-status-error' : 'border-border-subtle'
                }`}
                placeholder="Ime in priimek"
                required
              />
              {validationErrors.approval_authority && <p className="text-body-sm text-status-error">{validationErrors.approval_authority}</p>}
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
              Povezane politike
            </label>
            <input
              type="text"
              value={formData.connection_policies}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_policies: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na povezane politike"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Povezani postopki
            </label>
            <input
              type="text"
              value={formData.connection_procedures}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_procedures: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na povezane postopke"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body text-text-primary font-medium">
              Povezana ocena tveganj
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
              Povezana izjava o uporabnosti
            </label>
            <input
              type="text"
              value={formData.connection_soa}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_soa: e.target.value }))}
              className="w-full px-3 py-2 bg-bg-pure-black border border-border-subtle rounded-sm text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Referenca na izjavo o uporabnosti"
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