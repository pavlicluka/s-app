import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Bot, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import AISystemsAddModal from './modals/AISystemsAddModal'

interface AISystemsPageProps {
  onNavigate: (page: string) => void
}

export default function AISystemsPage({ onNavigate }: AISystemsPageProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Mock data for AI systems
  const mockAISystems = [
    {
      id: 1,
      name: 'Chatbot za podporo strankam',
      type: 'Conversational AI',
      riskLevel: 'Medium Risk',
      status: 'Active',
      lastUpdated: '2024-12-01'
    },
    {
      id: 2,
      name: 'Sistem za razpoznavanje obrazov',
      type: 'Biometric Recognition',
      riskLevel: 'High Risk',
      status: 'Under Review',
      lastUpdated: '2024-11-28'
    }
  ]

  const filteredSystems = mockAISystems.filter(system =>
    system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    system.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveAI = () => {
    // In real implementation, this would refresh the data from the database
    // For now, we'll just close the modal
    console.log('AI system saved successfully')
  }

  const handleAddSystem = () => {
    setIsAddModalOpen(true)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk': return 'text-green-500 bg-green-500/10'
      case 'Medium Risk': return 'text-yellow-500 bg-yellow-500/10'
      case 'High Risk': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
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
      case 'Active': return 'text-green-500 bg-green-500/10'
      case 'Under Review': return 'text-yellow-500 bg-yellow-500/10'
      case 'Inactive': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('aiSystems.title')}</h1>
            <p className="text-text-secondary">
              {t('aiSystems.description', 'Upravljanje AI sistemov v skladu z AI Act EU')}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAddSystem}
              className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              {t('aiSystems.addSystem')}
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
              placeholder={t('common.search', 'Išči AI sisteme...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
          >
            <Filter className="w-4 h-4 inline-block mr-2" />
            Filter
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="border-t border-border-subtle pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">{t('aiSystems.systemType')}</label>
                <select className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary">
                  <option value="">{t('common.all', 'Vsi tipi')}</option>
                  <option value="conversational">{t('aiSystems.systemTypeOptions.conversational')}</option>
                  <option value="biometric">{t('aiSystems.systemTypeOptions.biometric')}</option>
                  <option value="recommendation">{t('aiSystems.systemTypeOptions.recommendation')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">{t('aiSystems.riskLevel')}</label>
                <select className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary">
                  <option value="">{t('common.all', 'Vse ravni')}</option>
                  <option value="low">{t('aiSystems.riskLevelOptions.low')}</option>
                  <option value="medium">{t('aiSystems.riskLevelOptions.medium')}</option>
                  <option value="high">{t('aiSystems.riskLevelOptions.high')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">{t('aiSystems.status')}</label>
                <select className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary">
                  <option value="">{t('common.all', 'Vsi statusi')}</option>
                  <option value="active">{t('aiSystems.statusOptions.active')}</option>
                  <option value="review">{t('aiSystems.statusOptions.under_review')}</option>
                  <option value="inactive">{t('aiSystems.statusOptions.inactive')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Systems List */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        {filteredSystems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('aiSystems.systemName')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('aiSystems.systemType')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('aiSystems.riskLevel')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('aiSystems.status')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('common.updatedAt', 'Zadnja posodobitev')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSystems.map((system) => (
                  <tr key={system.id} className="border-b border-border-subtle hover:bg-bg-near-black/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-accent-primary" />
                        <span className="font-medium text-text-primary">{system.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{system.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(system.riskLevel)}`}>
                        {translateRiskLevel(system.riskLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                        {system.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{system.lastUpdated}</td>
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
            <Bot className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm ? t('common.noData', 'Ni rezultatov iskanja') : t('aiSystems.emptyTitle', 'Še ni AI sistemov')}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm 
                ? t('aiSystems.searchEmpty', 'Poskusite z drugimi iskalnimi pogoji')
                : t('aiSystems.emptyDescription', 'Dodajte svoj prvi AI sistem in začnite upravljati skladnost z AI Act EU')
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAddSystem}
                className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                {t('aiSystems.addSystem')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add AI System Modal */}
      <AISystemsAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAI}
      />
    </div>
  )
}