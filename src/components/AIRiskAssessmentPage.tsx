import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  AlertTriangle, 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Brain,
  Target
} from 'lucide-react'

interface AIRiskAssessmentPageProps {
  onNavigate: (page: string) => void
}

export default function AIRiskAssessmentPage({ onNavigate }: AIRiskAssessmentPageProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Mock data for risk assessments
  const mockAssessments = [
    {
      id: 1,
      title: 'Chatbot za podporo strankam - Risk Assessment',
      aiSystem: 'Chatbot za podporo strankam',
      riskLevel: 'Medium Risk',
      riskScore: 6.5,
      status: 'Approved',
      assessDate: '2024-12-01',
      nextReview: '2025-06-01',
      risks: [
        { category: 'Data Protection', level: 'Medium', score: 7 },
        { category: 'User Safety', level: 'Low', score: 3 },
        { category: 'Fairness', level: 'Medium', score: 5 }
      ]
    },
    {
      id: 2,
      title: 'Razpoznavanje obrazov - Risk Assessment',
      aiSystem: 'Sistem za razpoznavanje obrazov',
      riskLevel: 'High Risk',
      riskScore: 8.2,
      status: 'Under Review',
      assessDate: '2024-11-28',
      nextReview: '2025-02-28',
      risks: [
        { category: 'Fundamental Rights', level: 'High', score: 9 },
        { category: 'Bias & Discrimination', level: 'High', score: 8 },
        { category: 'Data Protection', level: 'High', score: 8 }
      ]
    },
    {
      id: 3,
      title: 'Priporočilni sistem - Risk Assessment',
      aiSystem: 'Priporočilni sistem',
      riskLevel: 'Low Risk',
      riskScore: 3.2,
      status: 'Needs Update',
      assessDate: '2024-10-15',
      nextReview: '2024-12-15',
      risks: [
        { category: 'User Safety', level: 'Low', score: 2 },
        { category: 'Fairness', level: 'Low', score: 4 },
        { category: 'Transparency', level: 'Medium', score: 4 }
      ]
    }
  ]

  const filteredAssessments = mockAssessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.aiSystem.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = !filterRisk || assessment.riskLevel === filterRisk
    const matchesStatus = !filterStatus || assessment.status === filterStatus
    return matchesSearch && matchesRisk && matchesStatus
  })

  const getRiskColor = (riskLevel: string, score: number) => {
    if (riskLevel === 'High Risk' || score >= 7) return 'text-red-500 bg-red-500/10'
    if (riskLevel === 'Medium Risk' || score >= 4) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-green-500 bg-green-500/10'
  }

  const translateRiskLevel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk': return t('common.lowRisk')
      case 'Medium Risk': return t('common.mediumRisk')
      case 'High Risk': return t('common.highRisk')
      default: return riskLevel
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-500 bg-green-500/10'
      case 'Under Review': return 'text-yellow-500 bg-yellow-500/10'
      case 'Needs Update': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getRiskCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Protection': return <Shield className="w-4 h-4" />
      case 'Fundamental Rights': return <Users className="w-4 h-4" />
      case 'User Safety': return <Target className="w-4 h-4" />
      case 'Bias & Discrimination': return <Zap className="w-4 h-4" />
      case 'Fairness': return <TrendingUp className="w-4 h-4" />
      case 'Transparency': return <Eye className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-500 bg-red-500/10'
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'Low': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const isOverdue = (nextReview: string) => {
    return new Date(nextReview) < new Date()
  }

  const isDueSoon = (nextReview: string) => {
    const reviewDate = new Date(nextReview)
    const today = new Date()
    const daysUntilReview = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilReview <= 30 && daysUntilReview > 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Ocenjevanje tveganj</h1>
            <p className="text-text-secondary">
              Upravljanje ocen tveganj za AI sisteme v skladu z AI Act EU
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
              <Plus className="w-4 h-4 inline-block mr-2" />
              Nova ocena
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Išči ocene tveganj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <select 
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vse ravni tveganja</option>
            <option value="Low Risk">Nizko tveganje</option>
            <option value="Medium Risk">Srednje tveganje</option>
            <option value="High Risk">Visoko tveganje</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsi statusi</option>
            <option value="Approved">Odobreno</option>
            <option value="Under Review">V pregledu</option>
            <option value="Needs Update">Potrebna posodobitev</option>
          </select>
        </div>

        {/* Risk Level Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {mockAssessments.filter(a => a.riskLevel === 'High Risk').length}
                </div>
                <div className="text-sm text-text-secondary">Visoko tveganje</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {mockAssessments.filter(a => a.riskLevel === 'Medium Risk').length}
                </div>
                <div className="text-sm text-text-secondary">Srednje tveganje</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {mockAssessments.filter(a => a.riskLevel === 'Low Risk').length}
                </div>
                <div className="text-sm text-text-secondary">Nizko tveganje</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent-primary" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {mockAssessments.filter(a => a.status === 'Approved').length}
                </div>
                <div className="text-sm text-text-secondary">Odobreno</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessments List */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        {filteredAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Ocenjevanje</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">AI sistem</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Raven tveganja</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Ocena</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Status</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Naslednji pregled</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-border-subtle hover:bg-bg-near-black/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-accent-primary" />
                        <div>
                          <div className="font-medium text-text-primary">{assessment.title}</div>
                          <div className="text-sm text-text-secondary">Ocena: {assessment.assessDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{assessment.aiSystem}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(assessment.riskLevel, assessment.riskScore)}`}>
                        {translateRiskLevel(assessment.riskLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-text-primary">{assessment.riskScore}/10</div>
                        <div className="w-16 bg-bg-near-black rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              assessment.riskScore >= 7 ? 'bg-red-500' : 
                              assessment.riskScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(assessment.riskScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isOverdue(assessment.nextReview) ? 'text-red-500 font-medium' : isDueSoon(assessment.nextReview) ? 'text-yellow-500 font-medium' : 'text-text-secondary'}`}>
                        {assessment.nextReview}
                        {isOverdue(assessment.nextReview) && <div className="text-xs">ZAMUJENO</div>}
                        {isDueSoon(assessment.nextReview) && !isOverdue(assessment.nextReview) && <div className="text-xs">KMALU</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || filterRisk || filterStatus ? 'Ni rezultatov iskanja' : 'Še ni ocen tveganj'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterRisk || filterStatus
                ? 'Poskusite z drugimi iskalnimi pogoji'
                : 'Ustvarite ocene tveganj za vaše AI sisteme'
              }
            </p>
            {!searchTerm && !filterRisk && !filterStatus && (
              <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                <Plus className="w-4 h-4 inline-block mr-2" />
                Nova ocena
              </button>
            )}
          </div>
        )}
      </div>

      {/* Risk Categories Overview */}
      {filteredAssessments.length > 0 && (
        <div className="bg-bg-surface rounded-lg border border-border-subtle">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="text-lg font-semibold text-text-primary">Pregled kategorij tveganj</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Data Protection', 'Fundamental Rights', 'User Safety', 'Bias & Discrimination', 'Fairness', 'Transparency'].map((category) => (
                <div key={category} className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    {getRiskCategoryIcon(category)}
                    <span className="font-medium text-text-primary">{category}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {mockAssessments.reduce((acc, assessment) => {
                      const categoryRisk = assessment.risks.find(r => r.category === category)
                      return acc + (categoryRisk ? categoryRisk.score : 0)
                    }, 0) / mockAssessments.length} povprečna ocena
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}