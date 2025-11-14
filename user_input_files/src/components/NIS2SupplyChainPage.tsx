import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  AlertCircle,
  Settings,
  Award,
  Eye,
  Download
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '../contexts/AuthContext'

interface Supplier {
  id: string
  supplier_id: string
  company_name: string
  contact_person?: string
  email?: string
  phone?: string
  country?: string
  contract_start_date?: string
  contract_end_date?: string
  service_type?: string
  criticality_level: 'nizka' | 'srednja' | 'visoka' | 'kriticna'
  cybersecurity_risk_score?: number
  operational_risk_score?: number
  financial_risk_score?: number
  overall_risk_score?: number
  iso27001_certified?: boolean
  data_protection_compliance?: boolean
  status: 'aktivno' | 'neaktivno' | 'suspeneded' | 'ukinjeno' | 'v-pregledu'
  next_assessment_date?: string
  last_assessment_date?: string
  created_at: string
  updated_at?: string
  // Additional fields from Supabase
  address?: string
  tax_id?: string
  contract_value?: number
  contract_currency?: string
  security_certifications?: any[]
  soc2_compliant?: boolean
  monitoring_frequency?: string
  last_security_review?: string
  breach_notification_required?: boolean
  incident_response_included?: boolean
  security_policy_reference?: string
  data_processing_agreement?: boolean
  business_continuity_plan?: boolean
  notes?: string
  user_id?: string
}

interface RiskAssessment {
  id: string
  assessment_id: string
  supplier_id: string
  assessment_date: string
  assessment_type: 'initial' | 'periodic' | 'incident-based' | 'due-diligence'
  overall_risk_score?: number
  risk_level: 'nizko' | 'srednje' | 'visoko' | 'kritično'
  assessed_by?: string
  methodology_used?: string
  key_findings?: string
  recommendations?: string
  nis2_compliance_level: 'neusklajeno' | 'delno-usklajeno' | 'usklajeno' | 'napredno'
  created_at: string
}

interface SupplyChainIncident {
  id: string
  incident_id: string
  supplier_id: string
  detection_date: string
  incident_type: string
  severity_level: 'nizka' | 'srednja' | 'visoka' | 'kritična'
  nis2_notifiable: boolean
  incident_description: string
  impact_assessment?: string
  status: 'identificiran' | 'v-preiskavi' | 'v-odpravi' | 'rešen' | 'zaprt'
  assigned_to?: string
  estimated_cost?: number
  created_at: string
}

interface NIS2SupplyChainPageProps {
  setCurrentPage: (page: string) => void
}

const supabase = createClient(
  'https://ckxlbiiirfdogobccmjs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGxiaWlpcmZkb2dvYmNjbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjI5NjIsImV4cCI6MjA3NzQzODk2Mn0.Y8T0bCsL5t_9u71z-yHYxrdyl4rqPN3fUMBg9k-p_TA'
)

type TabType = 'dashboard' | 'suppliers' | 'risk-assessments' | 'incidents' | 'monitoring' | 'action-plans' | 'compliance'

// Modal states
type ModalType = 'supplier' | 'risk-assessment' | 'incident' | 'monitoring' | 'action-plan' | 'supplier-view' | 'risk-view' | 'incident-view' | null

interface ModalState {
  isOpen: boolean
  type: ModalType
  data?: any
}

export default function NIS2SupplyChainPage({ setCurrentPage }: NIS2SupplyChainPageProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([])
  const [incidents, setIncidents] = useState<SupplyChainIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [criticalityFilter, setCriticalityFilter] = useState('')
  
  // Modal states
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null
  })

  // Form states
  const [formData, setFormData] = useState<any>({})
  const [formLoading, setFormLoading] = useState(false)

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Pregled', icon: BarChart3 },
    { id: 'suppliers' as TabType, label: 'Dobavitelji', icon: Truck },
    { id: 'risk-assessments' as TabType, label: 'Ocenjevanje tveganj', icon: Shield },
    { id: 'incidents' as TabType, label: 'Incidenti', icon: AlertCircle },
    { id: 'monitoring' as TabType, label: 'Monitoring', icon: Eye },
    { id: 'action-plans' as TabType, label: 'Načrti ukrepov', icon: Target },
    { id: 'compliance' as TabType, label: 'Skladnost', icon: Award }
  ]

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('supply_chain_suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (suppliersError) throw suppliersError
      setSuppliers(suppliersData || [])

      // Load risk assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('supply_chain_risk_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (assessmentsError) throw assessmentsError
      setRiskAssessments(assessmentsData || [])

      // Load incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('supply_chain_incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (incidentsError) throw incidentsError
      setIncidents(incidentsData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const totalSuppliers = suppliers.length
    const criticalSuppliers = suppliers.filter(s => s.criticality_level === 'kriticna').length
    const highRiskSuppliers = suppliers.filter(s => s.overall_risk_score && s.overall_risk_score >= 6).length
    const activeIncidents = incidents.filter(i => ['identificiran', 'v-preiskavi', 'v-odpravi'].includes(i.status)).length
    const overdueAssessments = suppliers.filter(s => 
      s.next_assessment_date && new Date(s.next_assessment_date) < new Date()
    ).length
    
    const complianceRate = totalSuppliers > 0 
      ? Math.round((suppliers.filter(s => s.iso27001_certified && s.data_protection_compliance).length / totalSuppliers) * 100)
      : 0

    return {
      totalSuppliers,
      criticalSuppliers,
      highRiskSuppliers,
      activeIncidents,
      overdueAssessments,
      complianceRate
    }
  }

  const metrics = calculateMetrics()

  // Get risk level color
  const getRiskLevelColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 border-gray-200'
    if (score <= 2) return 'bg-green-100 text-green-800 border-green-200'
    if (score <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (score <= 6) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  // Get criticality badge color
  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'nizka': return 'bg-green-100 text-green-800 border-green-200'
      case 'srednja': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'visoka': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'kriticna': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktivno': return 'bg-green-100 text-green-800 border-green-200'
      case 'neaktivno': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspeneded': return 'bg-red-100 text-red-800 border-red-200'
      case 'v-pregledu': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Modal management functions
  const openModal = (type: ModalType, data?: any) => {
    setModalState({ isOpen: true, type, data })
    setFormData(data || {})
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: null })
    setFormData({})
  }

  // CRUD Functions
  const createSupplier = async (supplierData: any) => {
    setFormLoading(true)
    try {
      const { data, error } = await supabase
        .from('supply_chain_suppliers')
        .insert([{
          ...supplierData,
          supplier_id: `SUP-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setSuppliers(prev => [data, ...prev])
      closeModal()
      
    } catch (error) {
      console.error('Error creating supplier:', error)
      alert('Napaka pri ustvarjanju dobavitelja')
    } finally {
      setFormLoading(false)
    }
  }

  const updateSupplier = async (id: string, supplierData: any) => {
    setFormLoading(true)
    try {
      const { data, error } = await supabase
        .from('supply_chain_suppliers')
        .update({
          ...supplierData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setSuppliers(prev => prev.map(s => s.id === id ? data : s))
      closeModal()
      
    } catch (error) {
      console.error('Error updating supplier:', error)
      alert('Napaka pri posodabljanju dobavitelja')
    } finally {
      setFormLoading(false)
    }
  }

  const deleteSupplier = async (id: string) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati tega dobavitelja?')) return
    
    try {
      const { error } = await supabase
        .from('supply_chain_suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuppliers(prev => prev.filter(s => s.id !== id))
      
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Napaka pri brisanju dobavitelja')
    }
  }

  const createRiskAssessment = async (assessmentData: any) => {
    setFormLoading(true)
    try {
      const { data, error } = await supabase
        .from('supply_chain_risk_assessments')
        .insert([{
          ...assessmentData,
          assessment_id: `AST-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setRiskAssessments(prev => [data, ...prev])
      closeModal()
      
    } catch (error) {
      console.error('Error creating risk assessment:', error)
      alert('Napaka pri ustvarjanju ocene tveganja')
    } finally {
      setFormLoading(false)
    }
  }

  const createIncident = async (incidentData: any) => {
    setFormLoading(true)
    try {
      const { data, error } = await supabase
        .from('supply_chain_incidents')
        .insert([{
          ...incidentData,
          incident_id: `INC-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setIncidents(prev => [data, ...prev])
      closeModal()
      
    } catch (error) {
      console.error('Error creating incident:', error)
      alert('Napaka pri ustvarjanju incidenta')
    } finally {
      setFormLoading(false)
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm font-medium">Skupaj dobaviteljev</p>
              <p className="text-2xl font-bold text-text-primary">{metrics.totalSuppliers}</p>
            </div>
            <Truck className="w-8 h-8 text-accent-primary" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-text-tertiary">
              {metrics.criticalSuppliers} kritičnih
            </span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm font-medium">Visoko tveganje</p>
              <p className="text-2xl font-bold text-text-primary">{metrics.highRiskSuppliers}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-text-tertiary">
              Od {metrics.totalSuppliers} dobaviteljev
            </span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm font-medium">Aktivni incidenti</p>
              <p className="text-2xl font-bold text-text-primary">{metrics.activeIncidents}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-text-tertiary">
              Zahtevajo pozornost
            </span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm font-medium">Skladnost</p>
              <p className="text-2xl font-bold text-text-primary">{metrics.complianceRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-bg-near-black rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${metrics.complianceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Overview */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Pregled tveganj</h3>
          <div className="space-y-3">
            {[
              { level: 'kritično', count: suppliers.filter(s => s.overall_risk_score && s.overall_risk_score >= 8).length, color: 'bg-red-500' },
              { level: 'visoko', count: suppliers.filter(s => s.overall_risk_score && s.overall_risk_score >= 6 && s.overall_risk_score < 8).length, color: 'bg-orange-500' },
              { level: 'srednje', count: suppliers.filter(s => s.overall_risk_score && s.overall_risk_score >= 4 && s.overall_risk_score < 6).length, color: 'bg-yellow-500' },
              { level: 'nizko', count: suppliers.filter(s => s.overall_risk_score && s.overall_risk_score < 4).length, color: 'bg-green-500' }
            ].map((item) => (
              <div key={item.level} className="flex items-center justify-between">
                <span className="text-text-secondary capitalize">{item.level} tveganje</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-text-primary font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Nedavni incidenti</h3>
          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 bg-bg-near-black rounded-lg">
                <div className="flex-1">
                  <p className="text-text-primary font-medium text-sm">{incident.incident_type}</p>
                  <p className="text-text-tertiary text-xs">
                    {new Date(incident.detection_date).toLocaleDateString('sl-SI')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                  {incident.severity_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Assessments Alert */}
      {metrics.overdueAssessments > 0 && (
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">
                {metrics.overdueAssessments} dobaviteljev ima prekoračene roke za ocenjevanje tveganj
              </p>
              <p className="text-orange-700 text-sm">Preverite in posodobite ocene tveganj.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSuppliers = () => (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Upravljanje dobaviteljev</h2>
          <p className="text-text-tertiary">Dodajte in upravljajte tretje stranke</p>
        </div>
        <button 
          onClick={() => openModal('supplier')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Dodaj dobavitelja
        </button>
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Iskanje dobaviteljev..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="">Vsi statusi</option>
            <option value="aktivno">Aktivno</option>
            <option value="neaktivno">Neaktivno</option>
            <option value="suspeneded">Suspendirano</option>
            <option value="v-pregledu">V pregledu</option>
          </select>
          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          >
            <option value="">Vse kritičnosti</option>
            <option value="nizka">Nizka</option>
            <option value="srednja">Srednja</option>
            <option value="visoka">Visoka</option>
            <option value="kriticna">Kritična</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-subtle">
              <tr>
                <th className="text-left p-4 text-text-secondary font-medium">Dobavitelj</th>
                <th className="text-left p-4 text-text-secondary font-medium">Kontakt</th>
                <th className="text-left p-4 text-text-secondary font-medium">Storitev</th>
                <th className="text-left p-4 text-text-secondary font-medium">Kritičnost</th>
                <th className="text-left p-4 text-text-secondary font-medium">Tveganje</th>
                <th className="text-left p-4 text-text-secondary font-medium">Skladnost</th>
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-left p-4 text-text-secondary font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-tertiary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-tertiary">
                    Ni najdenih dobaviteljev
                  </td>
                </tr>
              ) : (
                suppliers
                  .filter(supplier => 
                    (statusFilter === '' || supplier.status === statusFilter) &&
                    (criticalityFilter === '' || supplier.criticality_level === criticalityFilter) &&
                    (searchTerm === '' || supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((supplier) => (
                    <tr key={supplier.id} className="border-b border-border-subtle hover:bg-bg-near-black transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-text-primary">{supplier.company_name}</div>
                          <div className="text-text-tertiary text-sm">{supplier.supplier_id}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-text-primary">{supplier.contact_person}</div>
                          <div className="text-text-tertiary text-sm">{supplier.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-text-primary">{supplier.service_type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(supplier.criticality_level)}`}>
                          {supplier.criticality_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(supplier.overall_risk_score)}`}>
                          {supplier.overall_risk_score || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {supplier.iso27001_certified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">ISO27001</span>
                          )}
                          {supplier.data_protection_compliance && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">GDPR</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(supplier.status)}`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openModal('supplier', supplier)}
                            className="text-accent-primary hover:text-accent-primary/80"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-text-tertiary hover:text-text-primary">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteSupplier(supplier.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderRiskAssessments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Ocenjevanje tveganj</h2>
          <p className="text-text-tertiary">Upravljajte ocene tveganj dobavnih verig</p>
        </div>
        <button 
          onClick={() => openModal('risk-assessment')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova ocena
        </button>
      </div>

      {/* Risk Assessments Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-subtle">
              <tr>
                <th className="text-left p-4 text-text-secondary font-medium">Ocenjevanje</th>
                <th className="text-left p-4 text-text-secondary font-medium">Dobavitelj</th>
                <th className="text-left p-4 text-text-secondary font-medium">Datum</th>
                <th className="text-left p-4 text-text-secondary font-medium">Tip</th>
                <th className="text-left p-4 text-text-secondary font-medium">Tveganje</th>
                <th className="text-left p-4 text-text-secondary font-medium">NIS2</th>
                <th className="text-left p-4 text-text-secondary font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {riskAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-tertiary">
                    Ni najdenih ocen tveganj
                  </td>
                </tr>
              ) : (
                riskAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-border-subtle hover:bg-bg-near-black transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{assessment.assessment_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-text-primary">
                        {suppliers.find(s => s.id === assessment.supplier_id)?.company_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">
                        {new Date(assessment.assessment_date).toLocaleDateString('sl-SI')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-tertiary">{assessment.assessment_type}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(assessment.overall_risk_score)}`}>
                        {assessment.risk_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">{assessment.nis2_compliance_level}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="text-accent-primary hover:text-accent-primary/80">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-text-tertiary hover:text-text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderIncidents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Incidenti dobavnih verig</h2>
          <p className="text-text-tertiary">Spremljanje in upravljanje incidentov tretjih strank</p>
        </div>
        <button 
          onClick={() => openModal('incident')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Prijavi incident
        </button>
      </div>

      {/* Incidents Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-subtle">
              <tr>
                <th className="text-left p-4 text-text-secondary font-medium">Incident</th>
                <th className="text-left p-4 text-text-secondary font-medium">Dobavitelj</th>
                <th className="text-left p-4 text-text-secondary font-medium">Tip</th>
                <th className="text-left p-4 text-text-secondary font-medium">Resnost</th>
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-left p-4 text-text-secondary font-medium">NIS2</th>
                <th className="text-left p-4 text-text-secondary font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-tertiary">
                    Ni prijavljenih incidentov
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-border-subtle hover:bg-bg-near-black transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{incident.incident_id}</div>
                      <div className="text-text-tertiary text-sm truncate max-w-xs">
                        {incident.incident_description.substring(0, 60)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-text-primary">
                        {suppliers.find(s => s.id === incident.supplier_id)?.company_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">{incident.incident_type}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(incident.severity_level)}`}>
                        {incident.severity_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">{incident.status}</span>
                    </td>
                    <td className="p-4">
                      {incident.nis2_notifiable && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Poročljiv</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="text-accent-primary hover:text-accent-primary/80">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-text-tertiary hover:text-text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Monitoring in nadzor</h2>
          <p className="text-text-tertiary">Spremljanje varnosti in učinkovitosti dobavnih verig</p>
        </div>
        <button 
          onClick={() => alert('Funkcionalnost za nastavitev monitoringa bo implementirana v prihodnji verziji')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Nastavi monitoring
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
        <Eye className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Funkcije monitoringa</h3>
        <p className="text-text-tertiary">Funkcionalnosti za monitoring bodo implementirane v prihodnji verziji</p>
      </div>
    </div>
  )

  const renderActionPlans = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Načrti ukrepov</h2>
          <p className="text-text-tertiary">Upravljanje korektivnih in preventivnih ukrepov</p>
        </div>
        <button 
          onClick={() => alert('Funkcionalnost za načrte ukrepov bo implementirana v prihodnji verziji')}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nov načrt
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
        <Target className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Načrti ukrepov</h3>
        <p className="text-text-tertiary">Funkcionalnosti za načrtovanje ukrepov bodo implementirane v prihodnji verziji</p>
      </div>
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Dokumentacija skladnosti</h2>
          <p className="text-text-tertiary">Evidence in dokumenti za NIS 2 skladnost</p>
        </div>
        <button className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Download className="w-4 h-4" />
          Izvozi poročilo
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-8 text-center">
        <Award className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Skladnost z NIS 2</h3>
        <p className="text-text-tertiary">Funkcionalnosti za sledenje skladnosti bodo implementirane v prihodnji verziji</p>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'suppliers': return renderSuppliers()
      case 'risk-assessments': return renderRiskAssessments()
      case 'incidents': return renderIncidents()
      case 'monitoring': return renderMonitoring()
      case 'action-plans': return renderActionPlans()
      case 'compliance': return renderCompliance()
      default: return renderDashboard()
    }
  }

  // Render supplier modal
  const renderSupplierModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              {modalState.data ? 'Uredi dobavitelja' : 'Dodaj novega dobavitelja'}
            </h2>
            <button 
              onClick={closeModal}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Naziv podjetja *</label>
              <input
                type="text"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="Vnesite naziv podjetja"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Kontaktna oseba</label>
              <input
                type="text"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="Ime in priimek"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">E-pošta</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="email@podjetje.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="+386 XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Država</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="Slovenija"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tip storitve</label>
              <input
                type="text"
                value={formData.service_type || ''}
                onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="IT storitve, svetovanje, itd."
              />
            </div>
          </div>

          {/* Contract Information */}
          <div className="border-t border-border-subtle pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Informacije o pogodbi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Začetek pogodbe</label>
                <input
                  type="date"
                  value={formData.contract_start_date || ''}
                  onChange={(e) => setFormData({...formData, contract_start_date: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Konec pogodbe</label>
                <input
                  type="date"
                  value={formData.contract_end_date || ''}
                  onChange={(e) => setFormData({...formData, contract_end_date: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Risk and Compliance */}
          <div className="border-t border-border-subtle pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Tveganja in skladnost</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Kritičnost *</label>
                <select
                  value={formData.criticality_level || 'srednja'}
                  onChange={(e) => setFormData({...formData, criticality_level: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                >
                  <option value="nizka">Nizka</option>
                  <option value="srednja">Srednja</option>
                  <option value="visoka">Visoka</option>
                  <option value="kriticna">Kritična</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status *</label>
                <select
                  value={formData.status || 'aktivno'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                >
                  <option value="aktivno">Aktivno</option>
                  <option value="neaktivno">Neaktivno</option>
                  <option value="suspeneded">Suspendirano</option>
                  <option value="v-pregledu">V pregledu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Ocenitev kibernetske varnosti (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.cybersecurity_risk_score || ''}
                  onChange={(e) => setFormData({...formData, cybersecurity_risk_score: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Naslednja ocenitev</label>
                <input
                  type="date"
                  value={formData.next_assessment_date || ''}
                  onChange={(e) => setFormData({...formData, next_assessment_date: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
            </div>

            {/* Compliance checkboxes */}
            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.iso27001_certified || false}
                  onChange={(e) => setFormData({...formData, iso27001_certified: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-text-primary">ISO 27001 certificiran</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.data_protection_compliance || false}
                  onChange={(e) => setFormData({...formData, data_protection_compliance: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-text-primary">Skladen z varstvom osebnih podatkov (GDPR in ZVOP-2)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle flex justify-end space-x-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            Prekliči
          </button>
          <button
            onClick={() => {
              if (!formData.company_name) {
                alert('Naziv podjetja je obvezen')
                return
              }
              if (modalState.data) {
                updateSupplier(modalState.data.id, formData)
              } else {
                createSupplier(formData)
              }
            }}
            disabled={formLoading}
            className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {formLoading ? 'Shranjujem...' : 'Shrani'}
          </button>
        </div>
      </div>
    </div>
  )

  // Render risk assessment modal
  const renderRiskAssessmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Nova ocena tveganja
            </h2>
            <button 
              onClick={closeModal}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Dobavitelj *</label>
              <select
                value={formData.supplier_id || ''}
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="">Izberite dobavitelja</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tip ocenitve *</label>
              <select
                value={formData.assessment_type || 'periodic'}
                onChange={(e) => setFormData({...formData, assessment_type: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="initial">Začetna</option>
                <option value="periodic">Periodična</option>
                <option value="incident-based">Na osnovi incidenta</option>
                <option value="due-diligence">Due diligence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Datum ocenitve *</label>
              <input
                type="date"
                value={formData.assessment_date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Ocenil</label>
              <input
                type="text"
                value={formData.assessed_by || ''}
                onChange={(e) => setFormData({...formData, assessed_by: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                placeholder="Ime in priimek"
              />
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Ocene tveganj (1-10)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Kibernetska varnost</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.cybersecurity_risk_score || ''}
                  onChange={(e) => setFormData({...formData, cybersecurity_risk_score: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Operativno tveganje</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.operational_risk_score || ''}
                  onChange={(e) => setFormData({...formData, operational_risk_score: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Finančno tveganje</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.financial_risk_score || ''}
                  onChange={(e) => setFormData({...formData, financial_risk_score: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Skladnost</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.compliance_risk_score || ''}
                  onChange={(e) => setFormData({...formData, compliance_risk_score: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Ključne ugotovitve</label>
            <textarea
              value={formData.key_findings || ''}
              onChange={(e) => setFormData({...formData, key_findings: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              placeholder="Opišite ključne ugotovitve ocenitve..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Priporočila</label>
            <textarea
              value={formData.recommendations || ''}
              onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              placeholder="Opišite priporočila za izboljšave..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle flex justify-end space-x-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            Prekliči
          </button>
          <button
            onClick={() => {
              if (!formData.supplier_id || !formData.assessment_date) {
                alert('Izberite dobavitelja in vnesite datum ocenitve')
                return
              }
              createRiskAssessment(formData)
            }}
            disabled={formLoading}
            className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {formLoading ? 'Shranjujem...' : 'Shrani'}
          </button>
        </div>
      </div>
    </div>
  )

  // Render incident modal
  const renderIncidentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Prijavi incident
            </h2>
            <button 
              onClick={closeModal}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Dobavitelj *</label>
              <select
                value={formData.supplier_id || ''}
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="">Izberite dobavitelja</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tip incidenta *</label>
              <select
                value={formData.incident_type || ''}
                onChange={(e) => setFormData({...formData, incident_type: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="">Izberite tip</option>
                <option value="data-breach">Kršitev podatkov</option>
                <option value="service-disruption">Motnja storitve</option>
                <option value="security-incident">Varnostni incident</option>
                <option value="compliance-violation">Kršitev skladnosti</option>
                <option value="third-party-breach">Kršitev tretje strani</option>
                <option value="malware-detection">Odkritje zlonamerne programske opreme</option>
                <option value="unauthorized-access">Neavtoriziran dostop</option>
                <option value="system-compromise">Kompromitacija sistema</option>
                <option value="business-continuity">Poslovna kontinuiteta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Datum odkritja *</label>
              <input
                type="datetime-local"
                value={formData.detection_date || new Date().toISOString().slice(0, 16)}
                onChange={(e) => setFormData({...formData, detection_date: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Resnost *</label>
              <select
                value={formData.severity_level || 'srednja'}
                onChange={(e) => setFormData({...formData, severity_level: e.target.value})}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              >
                <option value="nizka">Nizka</option>
                <option value="srednja">Srednja</option>
                <option value="visoka">Visoka</option>
                <option value="kritična">Kritična</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Opis incidenta *</label>
            <textarea
              value={formData.incident_description || ''}
              onChange={(e) => setFormData({...formData, incident_description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              placeholder="Podroben opis incidenta..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Ocenitev vpliva</label>
            <textarea
              value={formData.impact_assessment || ''}
              onChange={(e) => setFormData({...formData, impact_assessment: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              placeholder="Opišite vpliv incidenta..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Dodeljen</label>
            <input
              type="text"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary"
              placeholder="Ime in priimek odgovorne osebe"
            />
          </div>

          {/* NIS 2 Notification */}
          <div className="border-t border-border-subtle pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">NIS 2 obveznosti</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.nis2_notifiable || false}
                onChange={(e) => setFormData({...formData, nis2_notifiable: e.target.checked})}
                className="mr-2"
              />
              <span className="text-text-primary">Incident je potrebno prijaviti pristojnim organom (NIS 2)</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle flex justify-end space-x-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            Prekliči
          </button>
          <button
            onClick={() => {
              if (!formData.supplier_id || !formData.incident_type || !formData.incident_description) {
                alert('Izpolnite vsa obvezna polja')
                return
              }
              createIncident(formData)
            }}
            disabled={formLoading}
            className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {formLoading ? 'Shranjujem...' : 'Shrani'}
          </button>
        </div>
      </div>
    </div>
  )

  // Render modal based on type
  const renderModal = () => {
    if (!modalState.isOpen) return null

    switch (modalState.type) {
      case 'supplier':
        return renderSupplierModal()
      case 'risk-assessment':
        return renderRiskAssessmentModal()
      case 'incident':
        return renderIncidentModal()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dobavne verige</h1>
        <p className="text-text-tertiary mt-1">
          Upravljanje tveganj in skladnosti dobavnih verig po NIS 2 direktivi
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border-subtle'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-accent-primary' : 'text-text-tertiary group-hover:text-text-secondary'}
                `} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
      
      {/* Modal */}
      {renderModal()}
    </div>
  )
}