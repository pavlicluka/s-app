import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Shield, 
  Plus,
  Search,
  Eye,
  Download,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Database,
  Users,
  Zap,
  BarChart3
} from 'lucide-react'

interface AITransparencyPageProps {
  onNavigate: (page: string) => void
}

export default function AITransparencyPage({ onNavigate }: AITransparencyPageProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for transparency records
  const mockTransparencyRecords = [
    {
      id: 1,
      title: 'Chatbot dokumentacija - Preglednost',
      aiSystem: 'Chatbot za podporo strankam',
      type: 'System Documentation',
      status: 'Published',
      publishDate: '2024-12-01',
      lastUpdate: '2024-12-01',
      visibility: 'Public',
      categories: ['Data Sources', 'Algorithm Overview', 'Performance Metrics']
    },
    {
      id: 2,
      title: 'Biometrični sistem - Transparentnost',
      aiSystem: 'Sistem za razpoznavanje obrazov',
      type: 'Risk Disclosure',
      status: 'Draft',
      publishDate: null,
      lastUpdate: '2024-11-28',
      visibility: 'Internal',
      categories: ['Data Protection', 'Accuracy Rates', 'False Positive Rates']
    },
    {
      id: 3,
      title: 'Priporočilni algoritem - Javna razkritja',
      aiSystem: 'Priporočilni sistem',
      type: 'Public Disclosure',
      status: 'Under Review',
      publishDate: null,
      lastUpdate: '2024-11-15',
      visibility: 'Public',
      categories: ['User Data Usage', 'Algorithm Logic', 'Personalization Factors']
    }
  ]

  const filteredRecords = mockTransparencyRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.aiSystem.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || record.type === filterType
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'text-green-500 bg-green-500/10'
      case 'Under Review': return 'text-yellow-500 bg-yellow-500/10'
      case 'Draft': return 'text-gray-500 bg-gray-500/10'
      case 'Archived': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published': return <CheckCircle className="w-4 h-4" />
      case 'Under Review': return <Clock className="w-4 h-4" />
      case 'Draft': return <FileText className="w-4 h-4" />
      case 'Archived': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'Public': return 'text-blue-500 bg-blue-500/10'
      case 'Internal': return 'text-orange-500 bg-orange-500/10'
      case 'Restricted': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Sources': return <Database className="w-4 h-4" />
      case 'Algorithm Overview': return <Zap className="w-4 h-4" />
      case 'Performance Metrics': return <BarChart3 className="w-4 h-4" />
      case 'Data Protection': return <Shield className="w-4 h-4" />
      case 'Accuracy Rates': return <BarChart3 className="w-4 h-4" />
      case 'False Positive Rates': return <AlertCircle className="w-4 h-4" />
      case 'User Data Usage': return <Users className="w-4 h-4" />
      case 'Algorithm Logic': return <Settings className="w-4 h-4" />
      case 'Personalization Factors': return <Zap className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const transparencyStats = {
    totalRecords: mockTransparencyRecords.length,
    published: mockTransparencyRecords.filter(r => r.status === 'Published').length,
    publicRecords: mockTransparencyRecords.filter(r => r.visibility === 'Public').length,
    draftRecords: mockTransparencyRecords.filter(r => r.status === 'Draft').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Preglednost AI sistemov</h1>
            <p className="text-text-secondary">
              Upravljanje preglednosti in javnih razkritij AI sistemov v skladu z AI Act EU
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200">
              <Download className="w-4 h-4 inline-block mr-2" />
              Izvozi poročilo
            </button>
            <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
              <Plus className="w-4 h-4 inline-block mr-2" />
              Novo razkritje
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        <div className="border-b border-border-subtle">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Pregled', icon: BarChart3 },
              { id: 'records', label: 'Zapisi preglednosti', icon: FileText },
              { id: 'compliance', label: 'Skladnost', icon: Shield }
            ].map((tab) => {
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

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-accent-primary" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{transparencyStats.totalRecords}</div>
                      <div className="text-sm text-text-secondary">Skupaj zapisov</div>
                    </div>
                  </div>
                </div>
                <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{transparencyStats.published}</div>
                      <div className="text-sm text-text-secondary">Objavljeno</div>
                    </div>
                  </div>
                </div>
                <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Eye className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{transparencyStats.publicRecords}</div>
                      <div className="text-sm text-text-secondary">Javni zapisi</div>
                    </div>
                  </div>
                </div>
                <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{transparencyStats.draftRecords}</div>
                      <div className="text-sm text-text-secondary">Osnutki</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Overview */}
              <div className="bg-bg-near-black rounded-lg p-6 border border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Pregled skladnosti z AI Act EU</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-text-primary">Obvezne informacije</span>
                    </div>
                    <span className="text-green-500 text-sm font-medium">Skladno</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-text-primary">Obvestila uporabnikom</span>
                    </div>
                    <span className="text-yellow-500 text-sm font-medium">Delno skladno</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-text-primary">Metrike učinkovitosti</span>
                    </div>
                    <span className="text-green-500 text-sm font-medium">Skladno</span>
                  </div>
                </div>
              </div>

              {/* Transparency Requirements */}
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-accent-primary mb-2">Zahteve AI Act EU za preglednost</h3>
                    <p className="text-text-secondary text-sm mb-3">
                      AI sistemi morajo zagotoviti ustrezno preglednost skladno z AI Act EU. To vključuje:
                    </p>
                    <ul className="text-text-secondary text-sm space-y-1 ml-4">
                      <li>• Dokumentacijo algoritmov in procesov odločanja</li>
                      <li>• Informacije o podatkih, ki se uporabljajo za usposabljanje</li>
                      <li>• Metrike učinkovitosti in omejitve sistema</li>
                      <li>• Obvestila uporabnikom o interakciji z AI sistemom</li>
                      <li>• Dostop do dokumentacije za nadzorne organe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Išči zapise preglednosti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">Vsi tipi</option>
                  <option value="System Documentation">Sistemska dokumentacija</option>
                  <option value="Risk Disclosure">Razkritje tveganj</option>
                  <option value="Public Disclosure">Javno razkritje</option>
                  <option value="User Notification">Obvestilo uporabnikom</option>
                </select>
              </div>

              {/* Records List */}
              {filteredRecords.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="bg-bg-near-black rounded-lg p-6 border border-border-subtle">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-accent-primary" />
                            <h3 className="text-lg font-semibold text-text-primary">{record.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              <span className="ml-1">{record.status}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(record.visibility)}`}>
                              {record.visibility}
                            </span>
                          </div>
                          <div className="text-text-secondary mb-3">
                            AI sistem: <span className="text-text-primary">{record.aiSystem}</span> • 
                            Tip: <span className="text-text-primary">{record.type}</span> • 
                            {record.publishDate ? (
                              <>Objavljeno: <span className="text-text-primary">{record.publishDate}</span></>
                            ) : (
                              <>Zadnja posodobitev: <span className="text-text-primary">{record.lastUpdate}</span></>
                            )}
                          </div>
                          
                          {/* Categories */}
                          <div className="flex flex-wrap gap-2">
                            {record.categories.map((category, index) => (
                              <div key={index} className="flex items-center gap-1 px-2 py-1 bg-bg-surface rounded text-xs text-text-secondary">
                                {getCategoryIcon(category)}
                                <span>{category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Shield className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {searchTerm || filterType ? 'Ni rezultatov iskanja' : 'Še ni zapisov preglednosti'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {searchTerm || filterType
                      ? 'Poskusite z drugimi iskalnimi pogoji'
                      : 'Ustvarite prve zapise preglednosti za vaše AI sisteme'
                    }
                  </p>
                  {!searchTerm && !filterType && (
                    <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                      <Plus className="w-4 h-4 inline-block mr-2" />
                      Novo razkritje
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Checklist */}
              <div className="bg-bg-near-black rounded-lg p-6 border border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Skladnostna kontrolna lista</h3>
                <div className="space-y-4">
                  {[
                    { requirement: 'Dokumentacija algoritmov', status: 'completed', description: 'Vsi AI sistemi imajo dokumentirane algoritme' },
                    { requirement: 'Informacije o podatkih', status: 'completed', description: 'Dokumentirani viri in uporaba podatkov' },
                    { requirement: 'Metrike učinkovitosti', status: 'in-progress', description: 'Metrike so definirane, vendar niso popolne' },
                    { requirement: 'Obvestila uporabnikom', status: 'pending', description: 'Potrebno implementirati obvestila v uporabniški vmesnik' },
                    { requirement: 'Dostop nadzornih organov', status: 'completed', description: 'Nadzorni organi imajo dostop do dokumentacije' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-bg-surface rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {item.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                        {item.status === 'in-progress' && <Clock className="w-4 h-4 text-white" />}
                        {item.status === 'pending' && <AlertCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">{item.requirement}</div>
                        <div className="text-sm text-text-secondary">{item.description}</div>
                      </div>
                      <div className={`px-3 py-1 rounded text-sm font-medium ${
                        item.status === 'completed' ? 'text-green-500 bg-green-500/10' :
                        item.status === 'in-progress' ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 bg-gray-500/10'
                      }`}>
                        {item.status === 'completed' ? 'Zaključeno' :
                         item.status === 'in-progress' ? 'V teku' : 'Na čakanju'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Actions */}
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-6">
                <h3 className="font-medium text-accent-primary mb-4">Priporočena dejanja</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">Dopolnite metrike učinkovitosti za vse AI sisteme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">Implementirajte obvestila uporabnikom v uporabniški vmesnik</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">Preverite javno dostopne dokumente za skladnost</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}