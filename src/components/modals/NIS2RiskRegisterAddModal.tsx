import React, { useState, useEffect } from 'react'
import { X, Save, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface NIS2RiskRegisterAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  // Risk Identification (Section 1)
  risk_id: string
  risk_name: string
  category: string
  risk_description: string
  
  // Threat & Vulnerability (Section 2)
  threat_source: string
  vulnerability: string
  affected_assets: string
  
  // Inherent Risk Assessment (Section 3)
  likelihood: number
  impact: number
  
  // Risk Treatment (Section 4)
  risk_owner: string
  current_controls: string
  treatment_strategy: string
  mitigation_actions: string
  treatment_status: string
  priority: string
  
  // Residual Risk Assessment (Section 5)
  residual_likelihood: number | null
  residual_impact: number | null
  
  // Timeline (Section 6)
  identified_date: string
  review_date: string
  target_closure_date: string
  last_reviewed: string
  
  // Additional Info (Section 7)
  comments: string
}

const NIS2RiskRegisterAddModal: React.FC<NIS2RiskRegisterAddModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    risk_id: '',
    risk_name: '',
    category: '',
    risk_description: '',
    threat_source: '',
    vulnerability: '',
    affected_assets: '',
    likelihood: 1,
    impact: 1,
    risk_owner: '',
    current_controls: '',
    treatment_strategy: '',
    mitigation_actions: '',
    treatment_status: 'Open',
    priority: 'Medium',
    residual_likelihood: null,
    residual_impact: null,
    identified_date: new Date().toISOString().split('T')[0], // Today's date
    review_date: '',
    target_closure_date: '',
    last_reviewed: '',
    comments: ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-calculate risk score and level
  const calculateRiskLevel = (likelihood: number, impact: number): string => {
    const score = likelihood * impact
    if (score >= 21) return 'Critical'
    if (score >= 13) return 'High'
    if (score >= 7) return 'Medium'
    return 'Low'
  }

  // Auto-calculate residual risk score and level
  const calculateResidualRiskLevel = (likelihood: number | null, impact: number | null): string | null => {
    if (!likelihood || !impact) return null
    const score = likelihood * impact
    if (score >= 21) return 'Critical'
    if (score >= 13) return 'High'
    if (score >= 7) return 'Medium'
    return 'Low'
  }

  const getRiskScore = () => formData.likelihood * formData.impact
  const getRiskLevel = () => calculateRiskLevel(formData.likelihood, formData.impact)
  
  const getResidualRiskScore = () => {
    if (!formData.residual_likelihood || !formData.residual_impact) return null
    return formData.residual_likelihood * formData.residual_impact
  }
  
  const getResidualRiskLevel = () => {
    return calculateResidualRiskLevel(formData.residual_likelihood, formData.residual_impact)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Handle numeric fields
    if (['likelihood', 'impact', 'residual_likelihood', 'residual_impact'].includes(name)) {
      const numValue = value === '' ? null : parseInt(value)
      setFormData(prev => ({ ...prev, [name]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Calculate risk scores and levels
      const risk_score = getRiskScore()
      const risk_level = getRiskLevel()
      const residual_risk_score = getResidualRiskScore()
      const residual_risk_level = getResidualRiskLevel()

      const { error: insertError } = await supabase
        .from('nis2_risk_register')
        .insert({
          ...formData,
          risk_score,
          risk_level,
          residual_risk_score,
          residual_risk_level,
          // Convert empty strings to null for optional date fields
          review_date: formData.review_date || null,
          target_closure_date: formData.target_closure_date || null,
          last_reviewed: formData.last_reviewed || null,
          comments: formData.comments || null,
          current_controls: formData.current_controls || null,
          mitigation_actions: formData.mitigation_actions || null
        })

      if (insertError) throw insertError

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        risk_id: '',
        risk_name: '',
        category: '',
        risk_description: '',
        threat_source: '',
        vulnerability: '',
        affected_assets: '',
        likelihood: 1,
        impact: 1,
        risk_owner: '',
        current_controls: '',
        treatment_strategy: '',
        mitigation_actions: '',
        treatment_status: 'Open',
        priority: 'Medium',
        residual_likelihood: null,
        residual_impact: null,
        identified_date: new Date().toISOString().split('T')[0],
        review_date: '',
        target_closure_date: '',
        last_reviewed: '',
        comments: ''
      })
    } catch (err: any) {
      console.error('Error creating risk register entry:', err)
      setError('Napaka pri shranjevanju vnosa. Prosimo poskusite znova.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface border border-border-subtle rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface border-b border-border-subtle px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Dodaj novo tveganje</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Section 1: Risk Identification */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              1. Identifikacija tveganja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  ID tveganja *
                </label>
                <input
                  type="text"
                  name="risk_id"
                  value={formData.risk_id}
                  onChange={handleChange}
                  placeholder="npr. RISK-011"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Kategorija *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Izberi kategorijo</option>
                  <option value="Operational">Operational</option>
                  <option value="Technical">Technical</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Financial">Financial</option>
                  <option value="Reputational">Reputational</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Naziv tveganja *
                </label>
                <input
                  type="text"
                  name="risk_name"
                  value={formData.risk_name}
                  onChange={handleChange}
                  placeholder="Kratek opis tveganja"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Opis tveganja *
                </label>
                <textarea
                  name="risk_description"
                  value={formData.risk_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Podroben opis tveganja in njegovih posledic"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Threat & Vulnerability */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              2. Grožnja in ranljivost
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Vir grožnje *
                </label>
                <select
                  name="threat_source"
                  value={formData.threat_source}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Izberi vir grožnje</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Malware">Malware</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="Insider Threat">Insider Threat</option>
                  <option value="DDoS Attack">DDoS Attack</option>
                  <option value="Social Engineering">Social Engineering</option>
                  <option value="Hardware Failure">Hardware Failure</option>
                  <option value="Human Error">Human Error</option>
                  <option value="Data Breach">Data Breach</option>
                  <option value="Third Party">Third Party</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Ranljivost *
                </label>
                <input
                  type="text"
                  name="vulnerability"
                  value={formData.vulnerability}
                  onChange={handleChange}
                  placeholder="Opis ranljivosti"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Prizadeti sistemi/sredstva *
                </label>
                <input
                  type="text"
                  name="affected_assets"
                  value={formData.affected_assets}
                  onChange={handleChange}
                  placeholder="Seznam sistemov, ki bi bili prizadeti"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inherent Risk Assessment */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              3. Ocena inherentnega tveganja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Verjetnost (1-5) *
                </label>
                <select
                  name="likelihood"
                  value={formData.likelihood}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>1 - Zelo nizka</option>
                  <option value={2}>2 - Nizka</option>
                  <option value={3}>3 - Srednja</option>
                  <option value={4}>4 - Visoka</option>
                  <option value={5}>5 - Zelo visoka</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Vpliv (1-5) *
                </label>
                <select
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>1 - Zelo nizek</option>
                  <option value={2}>2 - Nizek</option>
                  <option value={3}>3 - Srednji</option>
                  <option value={4}>4 - Visok</option>
                  <option value={5}>5 - Zelo visok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Ocena tveganja
                </label>
                <div className="px-3 py-2 bg-gray-700 border border-border-subtle rounded-lg text-text-primary font-medium">
                  {getRiskScore()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nivo tveganja
                </label>
                <div className={`px-3 py-2 border border-border-subtle rounded-lg font-medium text-center ${
                  getRiskLevel() === 'Critical' ? 'bg-red-600/20 text-red-400' :
                  getRiskLevel() === 'High' ? 'bg-orange-600/20 text-orange-400' :
                  getRiskLevel() === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  {getRiskLevel()}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Risk Treatment */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              4. Obravnavanje tveganja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Lastnik tveganja *
                </label>
                <input
                  type="text"
                  name="risk_owner"
                  value={formData.risk_owner}
                  onChange={handleChange}
                  placeholder="Ime in priimek odgovorne osebe"
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Strategija obravnavanja *
                </label>
                <select
                  name="treatment_strategy"
                  value={formData.treatment_strategy}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Izberi strategijo</option>
                  <option value="Avoid">Avoid - Izogibanje</option>
                  <option value="Transfer">Transfer - Prenos</option>
                  <option value="Mitigate">Mitigate - Zmanjšanje</option>
                  <option value="Accept">Accept - Sprejemanje</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status obravnavanja *
                </label>
                <select
                  name="treatment_status"
                  value={formData.treatment_status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Open">Open - Odprto</option>
                  <option value="In Progress">In Progress - V teku</option>
                  <option value="Implemented">Implemented - Implementirano</option>
                  <option value="Accepted">Accepted - Sprejeto</option>
                  <option value="Closed">Closed - Zaključeno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Prioriteta *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Critical">Critical - Kritična</option>
                  <option value="High">High - Visoka</option>
                  <option value="Medium">Medium - Srednja</option>
                  <option value="Low">Low - Nizka</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Trenutni nadzori
                </label>
                <textarea
                  name="current_controls"
                  value={formData.current_controls}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Opišite obstoječe varnostne ukrepe"
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Ukrepi za zmanjšanje tveganja
                </label>
                <textarea
                  name="mitigation_actions"
                  value={formData.mitigation_actions}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Načrtovani ali implementirani ukrepi"
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Residual Risk Assessment */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              5. Ocena preostanka tveganja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preostana verjetnost (1-5)
                </label>
                <select
                  name="residual_likelihood"
                  value={formData.residual_likelihood || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Ni ocenjeno</option>
                  <option value={1}>1 - Zelo nizka</option>
                  <option value={2}>2 - Nizka</option>
                  <option value={3}>3 - Srednja</option>
                  <option value={4}>4 - Visoka</option>
                  <option value={5}>5 - Zelo visoka</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preostan vpliv (1-5)
                </label>
                <select
                  name="residual_impact"
                  value={formData.residual_impact || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Ni ocenjeno</option>
                  <option value={1}>1 - Zelo nizek</option>
                  <option value={2}>2 - Nizek</option>
                  <option value={3}>3 - Srednji</option>
                  <option value={4}>4 - Visok</option>
                  <option value={5}>5 - Zelo visok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Preostan rizik
                </label>
                <div className="px-3 py-2 bg-gray-700 border border-border-subtle rounded-lg text-text-primary font-medium">
                  {getResidualRiskScore() || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nivo preostanka
                </label>
                <div className={`px-3 py-2 border border-border-subtle rounded-lg font-medium text-center ${
                  !getResidualRiskLevel() ? 'bg-gray-700 text-text-secondary' :
                  getResidualRiskLevel() === 'Critical' ? 'bg-red-600/20 text-red-400' :
                  getResidualRiskLevel() === 'High' ? 'bg-orange-600/20 text-orange-400' :
                  getResidualRiskLevel() === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  {getResidualRiskLevel() || 'Ni ocenjeno'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              6. Časovnica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Datum identifikacije *
                </label>
                <input
                  type="date"
                  name="identified_date"
                  value={formData.identified_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Datum pregleda
                </label>
                <input
                  type="date"
                  name="review_date"
                  value={formData.review_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Ciljni datum zaključka
                </label>
                <input
                  type="date"
                  name="target_closure_date"
                  value={formData.target_closure_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Datum zadnjega pregleda
                </label>
                <input
                  type="date"
                  name="last_reviewed"
                  value={formData.last_reviewed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Additional Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-subtle pb-2">
              7. Dodatne informacije
            </h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Komentarji
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={3}
                placeholder="Dodatni komentarji ali opombe"
                className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-bg-surface border-t border-border-subtle pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Shranjujem...' : 'Shrani tveganje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NIS2RiskRegisterAddModal