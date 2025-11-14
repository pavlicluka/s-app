import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Bot, 
  FileText, 
  AlertTriangle, 
  Shield,
  Settings,
  Plus,
  Search,
  Filter
} from 'lucide-react'

interface AIActPageProps {
  onNavigate: (page: string) => void
}

export default function AIActPage({ onNavigate }: AIActPageProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ai-systems')
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [showAddRiskAssessmentModal, setShowAddRiskAssessmentModal] = useState(false)
  const [showAddAiSystemModal, setShowAddAiSystemModal] = useState(false)

  const tabs = [
    { id: 'ai-systems', label: 'AI sistemi', icon: Bot },
    { id: 'ai-compliance', label: 'Dokumenti skladnosti', icon: FileText },
    { id: 'ai-risk-assessment', label: 'Ocenjevanje tveganj', icon: AlertTriangle },
    { id: 'ai-transparency', label: 'Preglednost AI sistemov', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">AI Act EU</h1>
            <p className="text-text-secondary">
              Upravljanje in nadzor skladnosti z Evropskim aktom o umetni inteligenci
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddAiSystemModal(true)}
              className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              Dodaj AI sistem
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        <div className="border-b border-border-subtle">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'ai-systems' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">AI sistemi</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Išči AI sisteme..."
                      className="pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                    <Filter className="w-4 h-4 inline-block mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Empty State */}
              <div className="bg-bg-near-black rounded-lg p-12 text-center border border-border-subtle">
                <Bot className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Še ni AI sistemov</h3>
                <p className="text-text-secondary mb-6">
                  Dodajte svoj prvi AI sistem in začnite upravljati skladnost z AI Act EU
                </p>
                <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Dodaj AI sistem
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai-compliance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Dokumenti skladnosti</h2>
                <button 
                  onClick={() => setShowAddDocumentModal(true)}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Dodaj dokument
                </button>
              </div>

              {/* Empty State */}
              <div className="bg-bg-near-black rounded-lg p-12 text-center border border-border-subtle">
                <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Še ni dokumentov skladnosti</h3>
                <p className="text-text-secondary mb-6">
                  Dodajte dokumente o skladnosti z AI Act EU
                </p>
                <button 
                  onClick={() => setShowAddDocumentModal(true)}
                  className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Dodaj dokument
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai-risk-assessment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Ocenjevanje tveganj</h2>
                <button 
                  onClick={() => setShowAddRiskAssessmentModal(true)}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Nova ocena
                </button>
              </div>

              {/* Empty State */}
              <div className="bg-bg-near-black rounded-lg p-12 text-center border border-border-subtle">
                <AlertTriangle className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Še ni ocen tveganj</h3>
                <p className="text-text-secondary mb-6">
                  Ustvarite ocene tveganj za vaše AI sisteme
                </p>
                <button 
                  onClick={() => setShowAddRiskAssessmentModal(true)}
                  className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  Nova ocena
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai-transparency' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Preglednost AI sistemov</h2>
              </div>

              {/* Info Box */}
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-accent-primary mb-2">Preglednost AI sistemov</h3>
                    <p className="text-text-secondary text-sm">
                      Ta funkcionalnost omogoča sledenje preglednosti AI sistemov v skladu z AI Act EU. 
                      Na voljo bodo orodja za upravljanje dokumentacije in zagotavljanje skladnosti.
                    </p>
                  </div>
                </div>
              </div>

              {/* Implementation Notice */}
              <div className="bg-bg-near-black rounded-lg p-12 text-center border border-border-subtle">
                <Settings className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">V razvoju</h3>
                <p className="text-text-secondary">
                  Funkcionalnosti za preglednost AI sistemov so v pripravi in bodo na voljo v prihodnji verziji.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-heading-lg font-semibold text-text-primary">
                Dodaj dokument skladnosti
              </h2>
              <button
                onClick={() => setShowAddDocumentModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4">
                Tukaj boste lahko dodali nov dokument skladnosti z AI Act EU.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddDocumentModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Zapri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Risk Assessment Modal */}
      {showAddRiskAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-heading-lg font-semibold text-text-primary">
                Nova ocena tveganja
              </h2>
              <button
                onClick={() => setShowAddRiskAssessmentModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4">
                Tukaj boste lahko ustvarili novo oceno tveganja za AI sistem.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddRiskAssessmentModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Zapri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add AI System Modal */}
      {showAddAiSystemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-lg border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="text-heading-lg font-semibold text-text-primary">
                Dodaj AI sistem
              </h2>
              <button
                onClick={() => setShowAddAiSystemModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4">
                Tukaj boste lahko dodali nov AI sistem.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddAiSystemModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Zapri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}