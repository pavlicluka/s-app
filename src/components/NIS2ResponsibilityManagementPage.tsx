import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createClient } from '@supabase/supabase-js'
import { 
  Users, 
  FileCheck, 
  ClipboardList, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  UserCheck,
  Award,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react'

// Initialize Supabase
const supabaseUrl = 'https://ckxlbiiirfdogobccmjs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGxiaWlpcmZkb2dvYmNjbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjI5NjIsImV4cCI6MjA3NzQzODk2Mn0.Y8T0bCsL5t_9u71z-yHYxrdyl4rqPN3fUMBg9k-p_TA'
const supabase = createClient(supabaseUrl, supabaseKey)

interface ResponsibilityOfficer {
  id: string
  identification_code: string
  full_name: string
  position_title: string
  email: string
  role_type: string
  status: string
  nis2_training_completed: boolean
  nis2_awareness_level: string
  decision_authority_level: string
  active_from: string
}

interface PolicyApproval {
  id: string
  document_id: string
  document_name: string
  document_type: string
  approval_status: string
  compliance_status: string
  effective_date: string
  next_review_date: string
}

interface DecisionLog {
  id: string
  decision_id: string
  decision_title: string
  decision_category: string
  decision_status: string
  decision_date: string
  implementation_status: string
}

interface EmployeeCompetency {
  id: string
  employee_id: string
  full_name: string
  department: string
  role_category: string
  nis2_awareness_training_completed: boolean
  overall_competency_level: string
  security_awareness_level: string
  next_training_due_date: string
}

interface TabData {
  activeTab: string
  responsibilityOfficers: ResponsibilityOfficer[]
  policyApprovals: PolicyApproval[]
  decisionLog: DecisionLog[]
  employeeCompetency: EmployeeCompetency[]
  loading: boolean
  searchTerm: string
  selectedFilter: string
  showAddModal: boolean
  selectedItem: any
  modalType: string
}

export default function NIS2ResponsibilityManagementPage({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { t } = useTranslation()
  
  const [tabData, setTabData] = useState<TabData>({
    activeTab: 'overview',
    responsibilityOfficers: [],
    policyApprovals: [],
    decisionLog: [],
    employeeCompetency: [],
    loading: true,
    searchTerm: '',
    selectedFilter: 'all',
    showAddModal: false,
    selectedItem: null,
    modalType: ''
  })

  // Load initial data
  useEffect(() => {
    loadTabData('overview')
  }, [])

  const loadTabData = async (tab: string) => {
    setTabData(prev => ({ ...prev, loading: true }))

    try {
      let data: any[] = []
      
      switch (tab) {
        case 'overview':
          // Load dashboard statistics
          await Promise.all([
            loadResponsibilityOfficers(),
            loadPolicyApprovals(),
            loadDecisionLog(),
            loadEmployeeCompetency()
          ])
          break
        case 'officers':
          data = await loadResponsibilityOfficers()
          break
        case 'policies':
          data = await loadPolicyApprovals()
          break
        case 'decisions':
          data = await loadDecisionLog()
          break
        case 'competency':
          data = await loadEmployeeCompetency()
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setTabData(prev => ({ ...prev, loading: false }))
    }
  }

  const loadResponsibilityOfficers = async (): Promise<ResponsibilityOfficer[]> => {
    const { data, error } = await supabase
      .from('responsibility_officers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Demo data fallback
    const demoData: ResponsibilityOfficer[] = [
      {
        id: '1',
        identification_code: 'OFF-2024-001',
        full_name: 'Dr. Marko Kovač',
        position_title: 'Vodja kibernetske varnosti',
        email: 'marko.kovac@company.si',
        role_type: 'Vodja varnosti',
        status: 'Aktiven',
        nis2_training_completed: true,
        nis2_awareness_level: 'Strokovna',
        decision_authority_level: 'Strateške odločitve',
        active_from: '2024-01-15'
      },
      {
        id: '2',
        identification_code: 'OFF-2024-002',
        full_name: 'Ana Plans',
        position_title: 'Direktorica informacijske tehnologije',
        email: 'ana.plans@company.si',
        role_type: 'CIO',
        status: 'Aktiven',
        nis2_training_completed: true,
        nis2_awareness_level: 'Napredna',
        decision_authority_level: 'Operativne odločitve',
        active_from: '2023-11-20'
      },
      {
        id: '3',
        identification_code: 'OFF-2024-003',
        full_name: 'Milan Krek',
        position_title: 'Pooblaščenec za varstvo podatkov',
        email: 'milan.krek@company.si',
        role_type: 'DPO',
        status: 'Aktiven',
        nis2_training_completed: true,
        nis2_awareness_level: 'Strokovna',
        decision_authority_level: 'Taktične odločitve',
        active_from: '2024-03-01'
      },
      {
        id: '4',
        identification_code: 'OFF-2024-004',
        full_name: 'Petra Mlakar',
        position_title: 'Vodja operacij',
        email: 'petra.mlakar@company.si',
        role_type: 'Vodja operacij',
        status: 'V izpostavitvi',
        nis2_training_completed: false,
        nis2_awareness_level: 'Srednja',
        decision_authority_level: 'Taktične odločitve',
        active_from: '2024-06-01'
      },
      {
        id: '5',
        identification_code: 'OFF-2024-005',
        full_name: 'Tomaž Vesel',
        position_title: 'Izvršni direktor',
        email: 'tomaz.vesel@company.si',
        role_type: 'CEO',
        status: 'Aktiven',
        nis2_training_completed: true,
        nis2_awareness_level: 'Napredna',
        decision_authority_level: 'Strateške odločitve',
        active_from: '2022-01-10'
      }
    ]
    
    if (!data || data.length === 0) {
      setTabData(prev => ({ ...prev, responsibilityOfficers: demoData }))
      return demoData
    }
    
    setTabData(prev => ({ ...prev, responsibilityOfficers: data || [] }))
    return data || []
  }

  const loadPolicyApprovals = async (): Promise<PolicyApproval[]> => {
    const { data, error } = await supabase
      .from('policy_approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Demo data fallback
    const demoData: PolicyApproval[] = [
      {
        id: '1',
        document_id: 'POL-2024-001',
        document_name: 'Varnostna politika informacijskih sistemov',
        document_type: 'Varnostna politika',
        approval_status: 'Potrjeno',
        compliance_status: 'Skladno',
        effective_date: '2024-01-15',
        next_review_date: '2025-01-15'
      },
      {
        id: '2',
        document_id: 'POL-2024-002',
        document_name: 'Politika upravljanja dostopa',
        document_type: 'Politika upravljanja dostopa',
        approval_status: 'V potrjevanju',
        compliance_status: 'V pregledu',
        effective_date: '2024-11-01',
        next_review_date: '2025-11-01'
      },
      {
        id: '3',
        document_id: 'POL-2024-003',
        document_name: 'Incidentni odzivni načrt',
        document_type: 'Incidentna politika',
        approval_status: 'Potrjeno',
        compliance_status: 'Skladno',
        effective_date: '2024-03-01',
        next_review_date: '2025-03-01'
      },
      {
        id: '4',
        document_id: 'POL-2024-004',
        document_name: 'Politika varstva osebnih podatkov',
        document_type: 'Politika varstva podatkov',
        approval_status: 'Zavrnjeno',
        compliance_status: 'Neskladno',
        effective_date: '2024-10-01',
        next_review_date: '2025-10-01'
      },
      {
        id: '5',
        document_id: 'POL-2024-005',
        document_name: 'Načrt upravljanja tveganj',
        document_type: 'Upravljanje tveganj',
        approval_status: 'V potrjevanju',
        compliance_status: 'Delno skladno',
        effective_date: '2024-11-15',
        next_review_date: '2025-11-15'
      }
    ]
    
    if (!data || data.length === 0) {
      setTabData(prev => ({ ...prev, policyApprovals: demoData }))
      return demoData
    }
    
    setTabData(prev => ({ ...prev, policyApprovals: data || [] }))
    return data || []
  }

  const loadDecisionLog = async (): Promise<DecisionLog[]> => {
    const { data, error } = await supabase
      .from('decision_log')
      .select('*')
      .order('decision_date', { ascending: false })
    
    if (error) throw error
    
    // Demo data fallback
    const demoData: DecisionLog[] = [
      {
        id: '1',
        decision_id: 'DEC-2024-001',
        decision_title: 'Implementacija dvofaktorske avtentikacije',
        decision_category: 'Varnostna odločitev',
        decision_status: 'Sprejeta',
        decision_date: '2024-10-15',
        implementation_status: 'Implementirano'
      },
      {
        id: '2',
        decision_id: 'DEC-2024-002',
        decision_title: 'Nakup naprednih SIEM orodij',
        decision_category: 'Investicijska odločitev',
        decision_status: 'Sprejeta',
        decision_date: '2024-09-28',
        implementation_status: 'V implementaciji'
      },
      {
        id: '3',
        decision_id: 'DEC-2024-003',
        decision_title: 'Prenova varnostne politike',
        decision_category: 'Skladnostna odločitev',
        decision_status: 'V preučevanju',
        decision_date: '2024-11-01',
        implementation_status: 'Nezačeto'
      },
      {
        id: '4',
        decision_id: 'DEC-2024-004',
        decision_title: 'Selitev kritičnih sistemov v oblak',
        decision_category: 'Strateška odločitev',
        decision_status: 'Zavrnjena',
        decision_date: '2024-08-20',
        implementation_status: 'Zamrznjeno'
      },
      {
        id: '5',
        decision_id: 'DEC-2024-005',
        decision_title: 'Avtomatizacija varnostnih testov',
        decision_category: 'Operativna odločitev',
        decision_status: 'Sprejeta',
        decision_date: '2024-10-30',
        implementation_status: 'V implementaciji'
      }
    ]
    
    if (!data || data.length === 0) {
      setTabData(prev => ({ ...prev, decisionLog: demoData }))
      return demoData
    }
    
    setTabData(prev => ({ ...prev, decisionLog: data || [] }))
    return data || []
  }

  const loadEmployeeCompetency = async (): Promise<EmployeeCompetency[]> => {
    const { data, error } = await supabase
      .from('employee_competency')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Demo data fallback
    const demoData: EmployeeCompetency[] = [
      {
        id: '1',
        employee_id: 'EMP-001',
        full_name: 'Luka Potočnik',
        department: 'Informacijska tehnologija',
        role_category: 'Tehnična osebje',
        nis2_awareness_training_completed: true,
        overall_competency_level: 'Napredni',
        security_awareness_level: 'Napredna',
        next_training_due_date: '2025-03-15'
      },
      {
        id: '2',
        employee_id: 'EMP-002',
        full_name: 'Barbara Zorman',
        department: 'Človeški viri',
        role_category: 'Zaposleni',
        nis2_awareness_training_completed: true,
        overall_competency_level: 'Srednji',
        security_awareness_level: 'Srednja',
        next_training_due_date: '2025-06-20'
      },
      {
        id: '3',
        employee_id: 'EMP-003',
        full_name: 'Urška Gorišek',
        department: 'Informacijska tehnologija',
        role_category: 'Ključni upravitelj',
        nis2_awareness_training_completed: true,
        overall_competency_level: 'Ekspert',
        security_awareness_level: 'Kritična',
        next_training_due_date: '2025-01-10'
      },
      {
        id: '4',
        employee_id: 'EMP-004',
        full_name: 'Peter Bergant',
        department: 'Operacije',
        role_category: 'Zaposleni',
        nis2_awareness_training_completed: false,
        overall_competency_level: 'Začetnik',
        security_awareness_level: 'Osnovna',
        next_training_due_date: '2024-12-01'
      },
      {
        id: '5',
        employee_id: 'EMP-005',
        full_name: 'Katja Horvat',
        department: 'Pravne zadeve',
        role_category: 'Management',
        nis2_awareness_training_completed: true,
        overall_competency_level: 'Napredni',
        security_awareness_level: 'Napredna',
        next_training_due_date: '2025-04-25'
      }
    ]
    
    if (!data || data.length === 0) {
      setTabData(prev => ({ ...prev, employeeCompetency: demoData }))
      return demoData
    }
    
    setTabData(prev => ({ ...prev, employeeCompetency: data || [] }))
    return data || []
  }

  const handleAddItem = (type: string) => {
    setTabData(prev => ({ 
      ...prev, 
      showAddModal: true, 
      modalType: type,
      selectedItem: null 
    }))
  }

  const handleEditItem = (type: string, item: any) => {
    setTabData(prev => ({ 
      ...prev, 
      showAddModal: true, 
      modalType: type,
      selectedItem: item 
    }))
  }

  const handleDeleteItem = async (type: string, id: string) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati ta element?')) return

    try {
      const tableName = getTableName(type)
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await loadTabData(tabData.activeTab)
      alert('Element je bil uspešno izbrisan.')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Prišlo je do napake pri brisanju elementa.')
    }
  }

  const getTableName = (type: string): string => {
    const tableMap: { [key: string]: string } = {
      'officer': 'responsibility_officers',
      'policy': 'policy_approvals',
      'decision': 'decision_log',
      'competency': 'employee_competency'
    }
    return tableMap[type] || ''
  }

  const handleSaveOfficer = async (officerData: Partial<ResponsibilityOfficer>) => {
    try {
      if (tabData.selectedItem) {
        // Update existing
        const { error } = await supabase
          .from('responsibility_officers')
          .update(officerData)
          .eq('id', tabData.selectedItem.id)
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('responsibility_officers')
          .insert([{ ...officerData, user_id: (await supabase.auth.getUser()).data.user?.id }])
        if (error) throw error
      }
      await loadTabData(tabData.activeTab)
      setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))
    } catch (error) {
      console.error('Error saving officer:', error)
      alert('Prišlo je do napake pri shranjevanju odgovorne osebe.')
    }
  }

  const handleSavePolicy = async (policyData: Partial<PolicyApproval>) => {
    try {
      if (tabData.selectedItem) {
        // Update existing
        const { error } = await supabase
          .from('policy_approvals')
          .update(policyData)
          .eq('id', tabData.selectedItem.id)
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('policy_approvals')
          .insert([{ ...policyData, user_id: (await supabase.auth.getUser()).data.user?.id }])
        if (error) throw error
      }
      await loadTabData(tabData.activeTab)
      setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))
    } catch (error) {
      console.error('Error saving policy:', error)
      alert('Prišlo je do napake pri shranjevanju politike.')
    }
  }

  const handleSaveDecision = async (decisionData: Partial<DecisionLog>) => {
    try {
      if (tabData.selectedItem) {
        // Update existing
        const { error } = await supabase
          .from('decision_log')
          .update(decisionData)
          .eq('id', tabData.selectedItem.id)
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('decision_log')
          .insert([{ ...decisionData, user_id: (await supabase.auth.getUser()).data.user?.id }])
        if (error) throw error
      }
      await loadTabData(tabData.activeTab)
      setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))
    } catch (error) {
      console.error('Error saving decision:', error)
      alert('Prišlo je do napake pri shranjevanju odločitve.')
    }
  }

  const handleSaveCompetency = async (competencyData: Partial<EmployeeCompetency>) => {
    try {
      if (tabData.selectedItem) {
        // Update existing
        const { error } = await supabase
          .from('employee_competency')
          .update(competencyData)
          .eq('id', tabData.selectedItem.id)
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('employee_competency')
          .insert([{ ...competencyData, user_id: (await supabase.auth.getUser()).data.user?.id }])
        if (error) throw error
      }
      await loadTabData(tabData.activeTab)
      setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))
    } catch (error) {
      console.error('Error saving competency:', error)
      alert('Prišlo je do napake pri shranjevanju usposobljenosti.')
    }
  }

  const getStatusBadge = (status: string, type: string) => {
    const statusConfig: { [key: string]: { [key: string]: { bg: string; text: string; icon: any } } } = {
      default: {
        active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
        inactive: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle },
        pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock }
      },
      officers: {
        'Aktiven': { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
        'Neaktiven': { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle },
        'V izpostavitvi': { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: AlertTriangle }
      },
      policies: {
        'Potrjeno': { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
        'V potrjevanju': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
        'Zavrnjeno': { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
      },
      decisions: {
        'Sprejeta': { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
        'V preučevanju': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
        'Implementirano': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: TrendingUp }
      }
    }

    const config = statusConfig[type] || statusConfig.default
    const statusInfo = config[status] || config['V potrjevanju']
    const Icon = statusInfo.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  // Render Overview Tab
  const renderOverview = () => {
    const stats = {
      totalOfficers: tabData.responsibilityOfficers.length,
      activeOfficers: tabData.responsibilityOfficers.filter(o => o.status === 'Aktiven').length,
      approvedPolicies: tabData.policyApprovals.filter(p => p.approval_status === 'Potrjeno').length,
      pendingPolicies: tabData.policyApprovals.filter(p => p.approval_status === 'V potrjevanju').length,
      totalDecisions: tabData.decisionLog.length,
      implementedDecisions: tabData.decisionLog.filter(d => d.implementation_status === 'Implementirano').length,
      trainedEmployees: tabData.employeeCompetency.filter(e => e.nis2_awareness_training_completed).length,
      overdueTraining: tabData.employeeCompetency.filter(e => 
        e.next_training_due_date && new Date(e.next_training_due_date) < new Date()
      ).length
    }

    return (
      <div className="space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-tertiary text-body-sm">Skupaj odgovornih oseb</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalOfficers}</p>
                <p className="text-body-sm text-green-400 mt-1">{stats.activeOfficers} aktivnih</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-tertiary text-body-sm">Potrjene politike</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.approvedPolicies}</p>
                <p className="text-body-sm text-yellow-400 mt-1">{stats.pendingPolicies} čakajo</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-tertiary text-body-sm">Sprejete odločitve</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalDecisions}</p>
                <p className="text-body-sm text-green-400 mt-1">{stats.implementedDecisions} izvedenih</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-tertiary text-body-sm">Usposobljeni zaposleni</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.trainedEmployees}</p>
                <p className="text-body-sm text-red-400 mt-1">{stats.overdueTraining} zapadlo</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Hitri ukrepi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleAddItem('officer')}
              className="flex items-center gap-3 p-4 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-near-black transition-colors"
            >
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span className="text-body-sm font-medium">Dodaj odgovorno osebo</span>
            </button>
            <button 
              onClick={() => handleAddItem('policy')}
              className="flex items-center gap-3 p-4 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-near-black transition-colors"
            >
              <FileCheck className="w-5 h-5 text-green-400" />
              <span className="text-body-sm font-medium">Odobri politiko</span>
            </button>
            <button 
              onClick={() => handleAddItem('decision')}
              className="flex items-center gap-3 p-4 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-near-black transition-colors"
            >
              <ClipboardList className="w-5 h-5 text-purple-400" />
              <span className="text-body-sm font-medium">Evidentiraj odločitev</span>
            </button>
            <button 
              onClick={() => handleAddItem('competency')}
              className="flex items-center gap-3 p-4 bg-bg-surface-hover border border-border-subtle rounded-lg hover:bg-bg-near-black transition-colors"
            >
              <Award className="w-5 h-5 text-orange-400" />
              <span className="text-body-sm font-medium">Spremljaj usposobljenost</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Nedavne odločitve</h3>
            <div className="space-y-3">
              {tabData.decisionLog.slice(0, 5).map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-3 bg-bg-surface-hover rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{decision.decision_title}</p>
                    <p className="text-body-sm text-text-tertiary">{decision.decision_date}</p>
                  </div>
                  {getStatusBadge(decision.decision_status, 'decisions')}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Potrjene politike</h3>
            <div className="space-y-3">
              {tabData.policyApprovals.filter(p => p.approval_status === 'Potrjeno').slice(0, 5).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 bg-bg-surface-hover rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{policy.document_name}</p>
                    <p className="text-body-sm text-text-tertiary">Do: {policy.next_review_date}</p>
                  </div>
                  {getStatusBadge(policy.approval_status, 'policies')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Officers Tab
  const renderOfficers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Odgovorne osebe</h2>
        <button 
          onClick={() => handleAddItem('officer')}
          className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj osebo
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover">
              <tr>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Oseba</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Vloga</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Status</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Usposabljanje</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Pooblastila</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {tabData.responsibilityOfficers.map((officer) => (
                <tr key={officer.id} className="border-t border-border-subtle hover:bg-bg-surface-hover">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary">{officer.full_name}</p>
                      <p className="text-body-sm text-text-tertiary">{officer.position_title}</p>
                      <p className="text-body-sm text-text-tertiary">{officer.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {officer.role_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(officer.status, 'officers')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {officer.nis2_training_completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-body-sm">{officer.nis2_awareness_level}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {officer.decision_authority_level}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditItem('officer', officer)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('officer', officer.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Policies Tab
  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Potrjevanje politik</h2>
        <button 
          onClick={() => handleAddItem('policy')}
          className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova politika
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover">
              <tr>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Dokument</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Tip</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Status</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Skladnost</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Veljavno do</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {tabData.policyApprovals.map((policy) => (
                <tr key={policy.id} className="border-t border-border-subtle hover:bg-bg-surface-hover">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary">{policy.document_name}</p>
                      <p className="text-body-sm text-text-tertiary">{policy.document_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                      {policy.document_type}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(policy.approval_status, 'policies')}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(policy.compliance_status, 'default')}
                  </td>
                  <td className="p-4">
                    <span className="text-body-sm">{policy.next_review_date}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditItem('policy', policy)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('policy', policy.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Decisions Tab
  const renderDecisions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Dnevnik odločitev</h2>
        <button 
          onClick={() => handleAddItem('decision')}
          className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova odločitev
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover">
              <tr>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Odločitev</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary"> Kategorija</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Datum</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Status</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Izvedba</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {tabData.decisionLog.map((decision) => (
                <tr key={decision.id} className="border-t border-border-subtle hover:bg-bg-surface-hover">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary">{decision.decision_title}</p>
                      <p className="text-body-sm text-text-tertiary">{decision.decision_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {decision.decision_category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-body-sm">{decision.decision_date}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(decision.decision_status, 'decisions')}
                  </td>
                  <td className="p-4">
                    <span className="text-body-sm">{decision.implementation_status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditItem('decision', decision)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('decision', decision.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Competency Tab
  const renderCompetency = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Usposobljenost zaposlenih</h2>
        <button 
          onClick={() => handleAddItem('competency')}
          className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj zaposlenega
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-surface-hover">
              <tr>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Zaposleni</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Vloga</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">NIS 2 usposabljanje</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Raven zavedanja</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Naslednje usposabljanje</th>
                <th className="text-left p-4 text-body-sm font-medium text-text-tertiary">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {tabData.employeeCompetency.map((employee) => (
                <tr key={employee.id} className="border-t border-border-subtle hover:bg-bg-surface-hover">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary">{employee.full_name}</p>
                      <p className="text-body-sm text-text-tertiary">{employee.department}</p>
                      <p className="text-body-sm text-text-tertiary">{employee.employee_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {employee.role_category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {employee.nis2_awareness_training_completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-body-sm">
                        {employee.nis2_awareness_training_completed ? 'Končano' : 'Ni končano'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      employee.security_awareness_level === 'Kritična' ? 'bg-green-500/20 text-green-400' :
                      employee.security_awareness_level === 'Napredna' ? 'bg-blue-500/20 text-blue-400' :
                      employee.security_awareness_level === 'Srednja' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {employee.security_awareness_level}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-body-sm">{employee.next_training_due_date}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditItem('competency', employee)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('competency', employee.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Pregled', icon: BarChart3 },
    { id: 'officers', label: 'Odgovorne osebe', icon: Users },
    { id: 'policies', label: 'Potrjevanje politik', icon: FileCheck },
    { id: 'decisions', label: 'Dnevnik odločitev', icon: ClipboardList },
    { id: 'competency', label: 'Usposobljenost', icon: GraduationCap }
  ]

  const renderTabContent = () => {
    switch (tabData.activeTab) {
      case 'overview':
        return renderOverview()
      case 'officers':
        return renderOfficers()
      case 'policies':
        return renderPolicies()
      case 'decisions':
        return renderDecisions()
      case 'competency':
        return renderCompetency()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Evidenca odgovornih oseb</h1>
            <p className="text-text-tertiary">Upravljanje odgovornosti vodstva po NIS 2 direktivi</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-bg-near-black p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTabData(prev => ({ ...prev, activeTab: tab.id }))
                  loadTabData(tab.id)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                  tabData.activeTab === tab.id
                    ? 'bg-accent-primary text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {tabData.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
        renderTabContent()
      )}

      {/* Officer Modal */}
      {tabData.showAddModal && tabData.modalType === 'officer' && (
        <OfficerModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveOfficer}
          officer={tabData.selectedItem}
        />
      )}

      {/* Policy Modal */}
      {tabData.showAddModal && tabData.modalType === 'policy' && (
        <PolicyModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSavePolicy}
          policy={tabData.selectedItem}
        />
      )}

      {/* Decision Modal */}
      {tabData.showAddModal && tabData.modalType === 'decision' && (
        <DecisionModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveDecision}
          decision={tabData.selectedItem}
        />
      )}

      {/* Competency Modal */}
      {tabData.showAddModal && tabData.modalType === 'competency' && (
        <CompetencyModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveCompetency}
          competency={tabData.selectedItem}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Evidenca odgovornih oseb</h1>
            <p className="text-text-tertiary">Upravljanje odgovornosti vodstva po NIS 2 direktivi</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-bg-near-black p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTabData(prev => ({ ...prev, activeTab: tab.id }))
                  loadTabData(tab.id)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                  tabData.activeTab === tab.id
                    ? 'bg-accent-primary text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {tabData.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
        renderTabContent()
      )}

      {/* Officer Modal */}
      {tabData.showAddModal && tabData.modalType === 'officer' && (
        <OfficerModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveOfficer}
          officer={tabData.selectedItem}
        />
      )}

      {/* Policy Modal */}
      {tabData.showAddModal && tabData.modalType === 'policy' && (
        <PolicyModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSavePolicy}
          policy={tabData.selectedItem}
        />
      )}

      {/* Decision Modal */}
      {tabData.showAddModal && tabData.modalType === 'decision' && (
        <DecisionModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveDecision}
          decision={tabData.selectedItem}
        />
      )}

      {/* Competency Modal */}
      {tabData.showAddModal && tabData.modalType === 'competency' && (
        <CompetencyModal
          isOpen={tabData.showAddModal}
          onClose={() => setTabData(prev => ({ ...prev, showAddModal: false, selectedItem: null }))}
          onSave={handleSaveCompetency}
          competency={tabData.selectedItem}
        />
      )}
    </div>
  )
}

interface OfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (officerData: Partial<ResponsibilityOfficer>) => void
  officer?: ResponsibilityOfficer | null
}

function OfficerModal({ isOpen, onClose, onSave, officer }: OfficerModalProps) {
  const [formData, setFormData] = useState({
    identification_code: '',
    full_name: '',
    position_title: '',
    email: '',
    role_type: '',
    status: '',
    nis2_training_completed: false,
    nis2_awareness_level: '',
    decision_authority_level: '',
    active_from: ''
  })

  useEffect(() => {
    if (officer) {
      setFormData({
        identification_code: officer.identification_code || '',
        full_name: officer.full_name || '',
        position_title: officer.position_title || '',
        email: officer.email || '',
        role_type: officer.role_type || '',
        status: officer.status || '',
        nis2_training_completed: officer.nis2_training_completed || false,
        nis2_awareness_level: officer.nis2_awareness_level || '',
        decision_authority_level: officer.decision_authority_level || '',
        active_from: officer.active_from || ''
      })
    } else {
      setFormData({
        identification_code: '',
        full_name: '',
        position_title: '',
        email: '',
        role_type: '',
        status: '',
        nis2_training_completed: false,
        nis2_awareness_level: '',
        decision_authority_level: '',
        active_from: ''
      })
    }
  }, [officer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          {officer ? 'Uredi odgovorno osebo' : 'Dodaj novo odgovorno osebo'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Identifikacijska koda *
              </label>
              <input
                type="text"
                value={formData.identification_code}
                onChange={(e) => setFormData(prev => ({ ...prev, identification_code: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Polno ime *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Naziv delovnega mesta *
              </label>
              <input
                type="text"
                value={formData.position_title}
                onChange={(e) => setFormData(prev => ({ ...prev, position_title: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                E-pošta *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Tip vloge *
              </label>
              <select
                value={formData.role_type}
                onChange={(e) => setFormData(prev => ({ ...prev, role_type: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi tip vloge</option>
                <option value="Vodja varnosti">Vodja varnosti</option>
                <option value="CEO">Direktor (CEO)</option>
                <option value="CIO">Vodja informacijske tehnologije (CIO)</option>
                <option value="DPO">Pooblaščenec za varstvo podatkov (DPO)</option>
                <option value="Vodja operacij">Vodja operacij</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi status</option>
                <option value="Aktiven">Aktiven</option>
                <option value="Neaktiven">Neaktiven</option>
                <option value="V izpostavitvi">V izpostavitvi</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                NIS 2 usposabljanje končano
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.nis2_training_completed}
                  onChange={(e) => setFormData(prev => ({ ...prev, nis2_training_completed: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-text-primary">Usposabljanje je končano</span>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                NIS 2 raven ozaveščenosti
              </label>
              <select
                value={formData.nis2_awareness_level}
                onChange={(e) => setFormData(prev => ({ ...prev, nis2_awareness_level: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">Izberi raven</option>
                <option value="Osnovna">Osnovna</option>
                <option value="Srednja">Srednja</option>
                <option value="Napredna">Napredna</option>
                <option value="Strokovna">Strokovna</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Raven pooblastil za odločitve
              </label>
              <select
                value={formData.decision_authority_level}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_authority_level: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">Izberi raven</option>
                <option value="Strateške odločitve">Strateške odločitve</option>
                <option value="Operativne odločitve">Operativne odločitve</option>
                <option value="Taktične odločitve">Taktične odločitve</option>
                <option value="Samo pregled in priporočila">Samo pregled in priporočila</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Aktiven od
              </label>
              <input
                type="date"
                value={formData.active_from}
                onChange={(e) => setFormData(prev => ({ ...prev, active_from: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors"
            >
              Zapri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              {officer ? 'Shrani spremembe' : 'Shrani osebo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (policyData: Partial<PolicyApproval>) => void
  policy?: PolicyApproval | null
}

function PolicyModal({ isOpen, onClose, onSave, policy }: PolicyModalProps) {
  const [formData, setFormData] = useState({
    document_id: '',
    document_name: '',
    document_type: '',
    approval_status: '',
    compliance_status: '',
    effective_date: '',
    next_review_date: ''
  })

  useEffect(() => {
    if (policy) {
      setFormData({
        document_id: policy.document_id || '',
        document_name: policy.document_name || '',
        document_type: policy.document_type || '',
        approval_status: policy.approval_status || '',
        compliance_status: policy.compliance_status || '',
        effective_date: policy.effective_date || '',
        next_review_date: policy.next_review_date || ''
      })
    } else {
      setFormData({
        document_id: '',
        document_name: '',
        document_type: '',
        approval_status: '',
        compliance_status: '',
        effective_date: '',
        next_review_date: ''
      })
    }
  }, [policy])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          {policy ? 'Uredi potrjevanje politike' : 'Dodaj novo potrjevanje politike'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                ID dokumenta *
              </label>
              <input
                type="text"
                value={formData.document_id}
                onChange={(e) => setFormData(prev => ({ ...prev, document_id: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Ime dokumenta *
              </label>
              <input
                type="text"
                value={formData.document_name}
                onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Tip dokumenta *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi tip</option>
                <option value="Varnostna politika">Varnostna politika</option>
                <option value="Politika upravljanja dostopa">Politika upravljanja dostopa</option>
                <option value="Incidentna politika">Incidentna politika</option>
                <option value="Zaslona oglasnih zaslonov">Zaslon oglasnih zaslonov</option>
                <option value="Politika varstva podatkov">Politika varstva podatkov</option>
                <option value="Upravljanje tveganj">Upravljanje tveganj</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status potrjevanja *
              </label>
              <select
                value={formData.approval_status}
                onChange={(e) => setFormData(prev => ({ ...prev, approval_status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi status</option>
                <option value="V potrjevanju">V potrjevanju</option>
                <option value="Potrjeno">Potrjeno</option>
                <option value="Zavrnjeno">Zavrnjeno</option>
                <option value="V reviziji">V reviziji</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status skladnosti *
              </label>
              <select
                value={formData.compliance_status}
                onChange={(e) => setFormData(prev => ({ ...prev, compliance_status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi status</option>
                <option value="Skladno">Skladno</option>
                <option value="Delno skladno">Delno skladno</option>
                <option value="Neskladno">Neskladno</option>
                <option value="V pregledu">V pregledu</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Veljavno od
              </label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Naslednja revizija
              </label>
              <input
                type="date"
                value={formData.next_review_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_review_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors"
            >
              Zapri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              {policy ? 'Shrani spremembe' : 'Shrani politiko'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DecisionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (decisionData: Partial<DecisionLog>) => void
  decision?: DecisionLog | null
}

function DecisionModal({ isOpen, onClose, onSave, decision }: DecisionModalProps) {
  const [formData, setFormData] = useState({
    decision_id: '',
    decision_title: '',
    decision_category: '',
    decision_status: '',
    decision_date: '',
    implementation_status: ''
  })

  useEffect(() => {
    if (decision) {
      setFormData({
        decision_id: decision.decision_id || '',
        decision_title: decision.decision_title || '',
        decision_category: decision.decision_category || '',
        decision_status: decision.decision_status || '',
        decision_date: decision.decision_date || '',
        implementation_status: decision.implementation_status || ''
      })
    } else {
      setFormData({
        decision_id: '',
        decision_title: '',
        decision_category: '',
        decision_status: '',
        decision_date: '',
        implementation_status: ''
      })
    }
  }, [decision])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          {decision ? 'Uredi odločitev' : 'Dodaj novo odločitev'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                ID odločitve *
              </label>
              <input
                type="text"
                value={formData.decision_id}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_id: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Naslov odločitve *
              </label>
              <input
                type="text"
                value={formData.decision_title}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_title: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Kategorija odločitve *
              </label>
              <select
                value={formData.decision_category}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_category: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi kategorijo</option>
                <option value="Varnostna odločitev">Varnostna odločitev</option>
                <option value="Operativna odločitev">Operativna odločitev</option>
                <option value="Strateška odločitev">Strateška odločitev</option>
                <option value="Skladnostna odločitev">Skladnostna odločitev</option>
                <option value="Investicijska odločitev">Investicijska odločitev</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status odločitve *
              </label>
              <select
                value={formData.decision_status}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi status</option>
                <option value="Sprejeta">Sprejeta</option>
                <option value="Zavrnjena">Zavrnjena</option>
                <option value="V preučevanju">V preučevanju</option>
                <option value="Odložena">Odložena</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Datum odločitve
              </label>
              <input
                type="date"
                value={formData.decision_date}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Status implementacije *
              </label>
              <select
                value={formData.implementation_status}
                onChange={(e) => setFormData(prev => ({ ...prev, implementation_status: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi status</option>
                <option value="Implementirano">Implementirano</option>
                <option value="V implementaciji">V implementaciji</option>
                <option value="Nezačeto">Nezačeto</option>
                <option value="Zamrznjeno">Zamrznjeno</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors"
            >
              Zapri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              {decision ? 'Shrani spremembe' : 'Shrani odločitev'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface CompetencyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (competencyData: Partial<EmployeeCompetency>) => void
  competency?: EmployeeCompetency | null
}

function CompetencyModal({ isOpen, onClose, onSave, competency }: CompetencyModalProps) {
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    department: '',
    role_category: '',
    nis2_awareness_training_completed: false,
    overall_competency_level: '',
    security_awareness_level: '',
    next_training_due_date: ''
  })

  useEffect(() => {
    if (competency) {
      setFormData({
        employee_id: competency.employee_id || '',
        full_name: competency.full_name || '',
        department: competency.department || '',
        role_category: competency.role_category || '',
        nis2_awareness_training_completed: competency.nis2_awareness_training_completed || false,
        overall_competency_level: competency.overall_competency_level || '',
        security_awareness_level: competency.security_awareness_level || '',
        next_training_due_date: competency.next_training_due_date || ''
      })
    } else {
      setFormData({
        employee_id: '',
        full_name: '',
        department: '',
        role_category: '',
        nis2_awareness_training_completed: false,
        overall_competency_level: '',
        security_awareness_level: '',
        next_training_due_date: ''
      })
    }
  }, [competency])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          {competency ? 'Uredi usposobljenost' : 'Dodaj novo usposobljenost'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                ID zaposlenega *
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Polno ime *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Oddelek *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi oddelek</option>
                <option value="Informacijska tehnologija">Informacijska tehnologija</option>
                <option value="Človeški viri">Človeški viri</option>
                <option value="Računovodstvo">Računovodstvo</option>
                <option value="Prodaja">Prodaja</option>
                <option value="Marketing">Marketing</option>
                <option value="Pravne zadeve">Pravne zadeve</option>
                <option value="Operacije">Operacije</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Kategorija vloge *
              </label>
              <select
                value={formData.role_category}
                onChange={(e) => setFormData(prev => ({ ...prev, role_category: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi kategorijo</option>
                <option value="Tehnična osebje">Tehnična osebje</option>
                <option value="Management">Management</option>
                <option value="Zaposleni">Zaposleni</option>
                <option value="Kljucni upravitelj">Kljucni upravitelj</option>
                <option value="Varnostni odgovoren">Varnostni odgovoren</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                NIS 2 usposabljanje končano
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.nis2_awareness_training_completed}
                  onChange={(e) => setFormData(prev => ({ ...prev, nis2_awareness_training_completed: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-text-primary">Usposabljanje je končano</span>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Celotna raven kompetenc *
              </label>
              <select
                value={formData.overall_competency_level}
                onChange={(e) => setFormData(prev => ({ ...prev, overall_competency_level: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi raven</option>
                <option value="Začetnik">Začetnik</option>
                <option value="Srednji">Srednji</option>
                <option value="Napredni">Napredni</option>
                <option value="Ekspert">Ekspert</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Raven varnostne ozaveščenosti *
              </label>
              <select
                value={formData.security_awareness_level}
                onChange={(e) => setFormData(prev => ({ ...prev, security_awareness_level: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              >
                <option value="">Izberi raven</option>
                <option value="Osnovna">Osnovna</option>
                <option value="Srednja">Srednja</option>
                <option value="Napredna">Napredna</option>
                <option value="Kritična">Kritična</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Naslednje usposabljanje zapade
              </label>
              <input
                type="date"
                value={formData.next_training_due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_training_due_date: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors"
            >
              Zapri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              {competency ? 'Shrani spremembe' : 'Shrani usposobljenost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}