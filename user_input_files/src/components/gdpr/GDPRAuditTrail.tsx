import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '../../hooks/useOrganization'
import { 
  List, 
  Plus, 
  FileText, 
  Download, 
  AlertCircle, 
  Search, 
  Filter,
  Shield,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Database,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface AuditRecord {
  id: string
  timestamp: string
  actionType: string
  actionCategory: string
  table: string
  description: string
  userId: string
  userName: string
  userEmail: string
  ipAddress: string
  userAgent: string
  affectedRecords: number
  legalBasis: string
  dataCategory: string
  consentRecord?: string
  retentionPeriod?: string
  zvop2Compliance: boolean
  gdprCompliance: boolean
  fileUrl?: string
  fileName?: string
  riskLevel: 'low' | 'medium' | 'high'
  complianceStatus: 'compliant' | 'partial' | 'non-compliant'
  reviewRequired: boolean
  reviewDate?: string
}

export default function GDPRAuditTrail() {
  const { t } = useTranslation()
  const { organizationId, loading: orgLoading, error: orgError } = useOrganization()
  const [records, setRecords] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterCompliance, setFilterCompliance] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [dateRange, setDateRange] = useState('')

  // Mock data with GDPR and ZVOP-2 specific records
  const mockAuditRecords: AuditRecord[] = [
    {
      id: '1',
      timestamp: '2024-12-05T10:30:15Z',
      actionType: 'Data Access Request',
      actionCategory: 'Data Subject Rights',
      table: 'user_data_requests',
      description: 'Dostop do osebnih podatkov za uporabnika ID: 12345',
      userId: 'admin_001',
      userName: 'Janez Novak',
      userEmail: 'janez.novak@company.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      affectedRecords: 15,
      legalBasis: 'Article 15 GDPR',
      dataCategory: 'Personal Data',
      retentionPeriod: '2 years',
      zvop2Compliance: true,
      gdprCompliance: true,
      fileUrl: '/documents/access-request-12345.pdf',
      fileName: 'access-request-12345.pdf',
      riskLevel: 'low',
      complianceStatus: 'compliant',
      reviewRequired: false
    },
    {
      id: '2',
      timestamp: '2024-12-05T09:15:22Z',
      actionType: 'Data Deletion',
      actionCategory: 'Data Subject Rights',
      table: 'user_accounts',
      description: 'Brisanje računa in vseh povezanih podatkov',
      userId: 'admin_002',
      userName: 'Maria Kovač',
      userEmail: 'maria.kovac@company.com',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      affectedRecords: 25,
      legalBasis: 'Article 17 GDPR',
      dataCategory: 'Personal Data',
      retentionPeriod: 'Immediately',
      zvop2Compliance: true,
      gdprCompliance: true,
      fileUrl: '/documents/deletion-log-12346.pdf',
      fileName: 'deletion-log-12346.pdf',
      riskLevel: 'high',
      complianceStatus: 'compliant',
      reviewRequired: true,
      reviewDate: '2024-12-12'
    },
    {
      id: '3',
      timestamp: '2024-12-05T08:45:33Z',
      actionType: 'Consent Withdrawal',
      actionCategory: 'Legal Basis Management',
      table: 'consent_records',
      description: 'Preklic soglasja za marketing komunikacijo',
      userId: 'user_789',
      userName: 'Peter Horvat',
      userEmail: 'peter.horvat@gmail.com',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      affectedRecords: 8,
      legalBasis: 'Article 6(1)(a) GDPR',
      dataCategory: 'Contact Data',
      consentRecord: 'consent_20241115_001',
      retentionPeriod: '3 years after withdrawal',
      zvop2Compliance: true,
      gdprCompliance: true,
      riskLevel: 'low',
      complianceStatus: 'compliant',
      reviewRequired: false
    },
    {
      id: '4',
      timestamp: '2024-12-05T07:20:11Z',
      actionType: 'Data Processing',
      actionCategory: 'Processing Activities',
      table: 'customer_database',
      description: 'Obdelava podatkov za analizo prodaje',
      userId: 'data_analyst_001',
      userName: 'Ana Popović',
      userEmail: 'ana.popovic@company.com',
      ipAddress: '192.168.1.150',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      affectedRecords: 1200,
      legalBasis: 'Article 6(1)(f) GDPR - Legitimate Interest',
      dataCategory: 'Commercial Data',
      retentionPeriod: '5 years',
      zvop2Compliance: true,
      gdprCompliance: true,
      riskLevel: 'medium',
      complianceStatus: 'partial',
      reviewRequired: true,
      reviewDate: '2024-12-15'
    },
    {
      id: '5',
      timestamp: '2024-12-05T06:55:44Z',
      actionType: 'Third-Party Transfer',
      actionCategory: 'International Transfers',
      table: 'data_transfers',
      description: 'Prenos podatkov v ZDA (Adequacy Decision)',
      userId: 'compliance_officer',
      userName: 'Marko Stergar',
      userEmail: 'marko.stergar@company.com',
      ipAddress: '192.168.1.80',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      affectedRecords: 500,
      legalBasis: 'Article 45 GDPR - Adequacy Decision',
      dataCategory: 'Customer Data',
      retentionPeriod: 'As per third-party policy',
      zvop2Compliance: false,
      gdprCompliance: true,
      fileUrl: '/documents/transfer-agreement-2024.pdf',
      fileName: 'transfer-agreement-2024.pdf',
      riskLevel: 'high',
      complianceStatus: 'partial',
      reviewRequired: true,
      reviewDate: '2024-12-10'
    },
    {
      id: '6',
      timestamp: '2024-12-05T06:30:18Z',
      actionType: 'Security Breach',
      actionCategory: 'Security Incidents',
      table: 'security_incidents',
      description: 'Odkritje neavtoriziranega dostopa do podatkov',
      userId: 'security_team',
      userName: 'Security System',
      userEmail: 'security@company.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Security Monitor v2.1',
      affectedRecords: 2,
      legalBasis: 'Article 34 GDPR - Breach Notification',
      dataCategory: 'Authentication Data',
      zvop2Compliance: true,
      gdprCompliance: true,
      fileUrl: '/documents/incident-report-2024-12-05.pdf',
      fileName: 'incident-report-2024-12-05.pdf',
      riskLevel: 'high',
      complianceStatus: 'non-compliant',
      reviewRequired: true,
      reviewDate: '2024-12-08'
    }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRecords(mockAuditRecords)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.actionType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = !filterAction || record.actionType === filterAction
    const matchesCompliance = !filterCompliance || record.complianceStatus === filterCompliance
    const matchesCategory = !filterCategory || record.actionCategory === filterCategory
    return matchesSearch && matchesAction && matchesCompliance && matchesCategory
  })

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500 bg-green-500/10'
      case 'partial': return 'text-yellow-500 bg-yellow-500/10'
      case 'non-compliant': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'high': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />
      case 'partial': return <Clock className="w-4 h-4" />
      case 'non-compliant': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'Data Subject Rights': return <User className="w-4 h-4" />
      case 'Processing Activities': return <Database className="w-4 h-4" />
      case 'Legal Basis Management': return <Shield className="w-4 h-4" />
      case 'Security Incidents': return <AlertCircle className="w-4 h-4" />
      case 'International Transfers': return <TrendingUp className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getComplianceStats = () => {
    const total = records.length
    const compliant = records.filter(r => r.complianceStatus === 'compliant').length
    const partial = records.filter(r => r.complianceStatus === 'partial').length
    const nonCompliant = records.filter(r => r.complianceStatus === 'non-compliant').length
    const highRisk = records.filter(r => r.riskLevel === 'high').length
    const gdprCompliant = records.filter(r => r.gdprCompliance).length
    const zvop2Compliant = records.filter(r => r.zvop2Compliance).length

    return { total, compliant, partial, nonCompliant, highRisk, gdprCompliant, zvop2Compliant }
  }

  const stats = getComplianceStats()

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (orgError || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Dostop zavrnjen</h2>
          <p className="text-body text-text-secondary">
            {orgError || 'Organizacija ni najdena'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">GDPR & ZVOP-2 Audit Trail</h1>
              <p className="text-text-secondary">
                Celoten pregled aktivnosti obdelave podatkov in skladnosti z GDPR ter ZVOP-2
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-bg-pure-black text-text-secondary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200">
              <Download className="w-4 h-4 inline-block mr-2" />
              Izvozi poročilo
            </button>
            <button className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
              <Plus className="w-4 h-4 inline-block mr-2" />
              Nov vnos
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-accent-primary" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
              <div className="text-sm text-text-secondary">Skupaj zapisov</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.compliant}</div>
              <div className="text-sm text-text-secondary">Skladni</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.gdprCompliant}</div>
              <div className="text-sm text-text-secondary">GDPR skladni</div>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.highRisk}</div>
              <div className="text-sm text-text-secondary">Visoko tveganje</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Išči po opisu, uporabniku ali tipu dejanja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsi tipi dejanj</option>
            <option value="Data Access Request">Dostop do podatkov</option>
            <option value="Data Deletion">Brisanje podatkov</option>
            <option value="Consent Withdrawal">Preklic soglasja</option>
            <option value="Data Processing">Obdelava podatkov</option>
            <option value="Third-Party Transfer">Prenos podatkov</option>
            <option value="Security Breach">Varnostni incident</option>
          </select>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vse kategorije</option>
            <option value="Data Subject Rights">Pravice posameznikov</option>
            <option value="Processing Activities">Dejavnosti obdelave</option>
            <option value="Legal Basis Management">Pravne podlage</option>
            <option value="Security Incidents">Varnostni incidenti</option>
            <option value="International Transfers">Mednarodni prenosi</option>
          </select>
          <select 
            value={filterCompliance}
            onChange={(e) => setFilterCompliance(e.target.value)}
            className="px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="">Vsi statusi</option>
            <option value="compliant">Skladno</option>
            <option value="partial">Delno skladno</option>
            <option value="non-compliant">Neskladno</option>
          </select>
        </div>
      </div>

      {/* Audit Records Table */}
      <div className="bg-bg-surface rounded-lg border border-border-subtle">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-pure-black border-b border-border-subtle">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Čas</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Dejanje</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Opis</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Uporabnik</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Pravna podlaga</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">GDPR</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">ZVOP-2</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Tveganje</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Dokumenti</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary uppercase tracking-wide">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.timestamp).toLocaleString('sl-SI')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(record.actionCategory)}
                        <div>
                          <div className="font-medium text-text-primary text-sm">{record.actionType}</div>
                          <div className="text-xs text-text-secondary">{record.actionCategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-md">
                        {record.description}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        Vpliva: {record.affectedRecords} zapisov
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-secondary" />
                        <div>
                          <div className="text-sm text-text-primary">{record.userName}</div>
                          <div className="text-xs text-text-secondary">{record.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary max-w-[150px]">
                      {record.legalBasis}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {record.gdprCompliance ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {record.zvop2Compliance ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(record.riskLevel)}`}>
                        {record.riskLevel === 'low' ? 'Nizko' : record.riskLevel === 'medium' ? 'Srednje' : 'Visoko'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(record.complianceStatus)}`}>
                        {getComplianceIcon(record.complianceStatus)}
                        {record.complianceStatus === 'compliant' ? 'Skladno' : 
                         record.complianceStatus === 'partial' ? 'Delno' : 'Neskladno'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.fileUrl ? (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent-primary hover:text-accent-primary-hover transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm truncate max-w-[100px]">
                            {record.fileName || 'Dokument'}
                          </span>
                          <Download className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-text-muted text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
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
            <Shield className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || filterAction || filterCategory || filterCompliance ? 'Ni rezultatov iskanja' : 'Ni zapisov audit trail'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterAction || filterCategory || filterCompliance
                ? 'Poskusite z drugimi iskalnimi pogoji'
                : 'Audit trail še ni ustanovljen'
              }
            </p>
            {!searchTerm && !filterAction && !filterCategory && !filterCompliance && (
              <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200">
                <Plus className="w-4 h-4 inline-block mr-2" />
                Dodaj prvi zapis
              </button>
            )}
          </div>
        )}
      </div>

      {/* Compliance Summary */}
      {filteredRecords.length > 0 && (
        <div className="bg-bg-surface rounded-lg border border-border-subtle">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="text-lg font-semibold text-text-primary">Povzetek skladnosti</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GDPR Compliance */}
              <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  GDPR skladnost
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Skladni zapisi:</span>
                    <span className="text-green-500 font-medium">{stats.gdprCompliant}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-bg-surface rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.gdprCompliant / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* ZVOP-2 Compliance */}
              <div className="bg-bg-near-black rounded-lg p-4 border border-border-subtle">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  ZVOP-2 skladnost
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Skladni zapisi:</span>
                    <span className="text-accent-primary font-medium">{stats.zvop2Compliant}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-bg-surface rounded-full h-2">
                    <div 
                      className="bg-accent-primary h-2 rounded-full"
                      style={{ width: `${(stats.zvop2Compliant / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews Required */}
            {records.filter(r => r.reviewRequired && r.reviewDate).length > 0 && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Potrebni pregledi
                </h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  {records
                    .filter(r => r.reviewRequired && r.reviewDate)
                    .slice(0, 3)
                    .map((record, index) => (
                      <div key={index}>
                        Pregled za: {record.actionType} - {record.reviewDate}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}