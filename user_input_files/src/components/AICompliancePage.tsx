import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FileText, 
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  Clock,
  AlertCircle
} from 'lucide-react'
import AIComplianceAddModal from './modals/AIComplianceAddModal'
import AIComplianceUploadModal from './modals/AIComplianceUploadModal'

interface AICompliancePageProps {
  onNavigate: (page: string) => void
}

export default function AICompliancePage({ onNavigate }: AICompliancePageProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleSaveDocument = () => {
    // In real implementation, this would refresh the data from the database
    // For now, we'll just close the modal
    console.log('AI compliance document saved successfully')
  }

  // Mock data for compliance documents
  const mockDocuments = [
    {
      id: 1,
      title: 'AI Act skladnost - Chatbot sistem',
      type: 'Technical Documentation',
      aiSystem: 'Chatbot za podporo strankam',
      status: 'Compliant',
      uploadDate: '2024-12-01',
      expiryDate: '2025-12-01',
      version: 'v1.2'
    },
    {
      id: 2,
      title: 'Risk Assessment - Prepoznavanje obrazov',
      type: 'Risk Assessment',
      aiSystem: 'Sistem za razpoznavanje obrazov',
      status: 'Under Review',
      uploadDate: '2024-11-28',
      expiryDate: '2025-06-28',
      version: 'v1.0'
    },
    {
      id: 3,
      title: 'GDPR Impact Assessment',
      type: 'Legal Compliance',
      aiSystem: 'Priporočilni sistem',
      status: 'Needs Update',
      uploadDate: '2024-10-15',
      expiryDate: '2024-12-15',
      version: 'v1.1'
    }
  ]

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.aiSystem.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || doc.type === filterType
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'text-green-500 bg-green-500/10'
      case 'Under Review': return 'text-yellow-500 bg-yellow-500/10'
      case 'Needs Update': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': return <FileCheck className="w-4 h-4" />
      case 'Under Review': return <Clock className="w-4 h-4" />
      case 'Needs Update': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Dokumenti skladnosti</h1>
            <p className="text-text-secondary">
              Upravljanje dokumentov skladnosti z AI Act EU
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Naloži dokument
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 inline-block mr-2" />
              Dodaj dokument
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
              placeholder="Išči dokumente skladnosti..."
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
            <option value="Technical Documentation">Tehnična dokumentacija</option>
            <option value="Risk Assessment">Ocena tveganja</option>
            <option value="Legal Compliance">Pravna skladnost</option>
            <option value="Compliance Certificate">Skladnostni certifikat</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="text-2xl font-bold text-text-primary">{mockDocuments.length}</div>
            <div className="text-sm text-text-secondary">Skupaj dokumentov</div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="text-2xl font-bold text-green-500">
              {mockDocuments.filter(d => d.status === 'Compliant').length}
            </div>
            <div className="text-sm text-text-secondary">Skladni</div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="text-2xl font-bold text-yellow-500">
              {mockDocuments.filter(d => d.status === 'Under Review').length}
            </div>
            <div className="text-sm text-text-secondary">V pregledu</div>
          </div>
          <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
            <div className="text-2xl font-bold text-red-500">
              {mockDocuments.filter(d => d.status === 'Needs Update' || isExpired(d.expiryDate)).length}
            </div>
            <div className="text-sm text-text-secondary">Potrebna posodobitev</div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Naslov</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Tip</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">AI sistem</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Status</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Poteče</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-primary">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border-subtle hover:bg-bg-near-black/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-accent-primary" />
                        <div>
                          <div className="font-medium text-text-primary">{doc.title}</div>
                          <div className="text-sm text-text-secondary">Verzija {doc.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{doc.type}</td>
                    <td className="px-6 py-4 text-text-secondary">{doc.aiSystem}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          {doc.status}
                        </span>
                        {isExpired(doc.expiryDate) && (
                          <span className="text-xs text-red-500 font-medium">POTEKEL</span>
                        )}
                        {isExpiringSoon(doc.expiryDate) && !isExpired(doc.expiryDate) && (
                          <span className="text-xs text-yellow-500 font-medium">POTEKA</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-secondary">{doc.expiryDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
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
            <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || filterType ? 'Ni rezultatov iskanja' : 'Še ni dokumentov skladnosti'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterType
                ? 'Poskusite z drugimi iskalnimi pogoji'
                : 'Dodajte dokumente o skladnosti z AI Act EU'
              }
            </p>
            {!searchTerm && !filterType && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                Dodaj dokument
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <AIComplianceAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveDocument}
      />

      {/* Upload Document Modal */}
      <AIComplianceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveDocument}
      />
    </div>
  )
}