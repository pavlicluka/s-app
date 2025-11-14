import { useState } from 'react'
import { X, Edit, Download, FileText, Mail, Calendar, Users, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface GDPRIncidentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  incident: any
  onSave: () => void
}

export default function GDPRIncidentDetailModal({ isOpen, onClose, incident, onSave }: GDPRIncidentDetailModalProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(incident || {})

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('gdpr_data_breach_log')
        .update(formData)
        .eq('id', incident.id)

      if (error) throw error
      onSave()
      setEditing(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Napaka pri shranjevanju')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const getSeverityStyle = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-risk-critical/20 text-risk-critical border-risk-critical/30'
      case 'high': return 'bg-risk-high/20 text-risk-high border-risk-high/30'
      case 'medium': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30'
      default: return 'bg-risk-low/20 text-risk-low border-risk-low/30'
    }
  }

  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 'bg-status-success/10 text-status-success border-status-success/20'
      case 'contained': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
      case 'investigating': return 'bg-status-warning/10 text-status-warning border-status-warning/20'
      default: return 'bg-text-muted/10 text-text-muted border-text-muted/20'
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('sl-SI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSinceBreach = (breachDate: string) => {
    const breach = new Date(breachDate)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - breach.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Pravkar'
    if (diffHours < 24) return `Pred ${diffHours} urami`
    const diffDays = Math.floor(diffHours / 24)
    return `Pred ${diffDays} dnevi`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-h3 text-text-primary">{incident?.breach_id}</h2>
              <p className="text-body-sm text-text-secondary">Podrobnosti incidenta po GDPR členih 33-34</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
              title="Uredi"
            >
              <Edit className="w-5 h-5 text-accent-primary" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-bg-near-black rounded-sm border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${getSeverityStyle(incident?.severity)}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-body-sm text-text-secondary">Resnost</p>
                  <p className="text-h5 text-text-primary capitalize">{incident?.severity}</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-near-black rounded-sm border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${getStatusStyle(incident?.status)}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-body-sm text-text-secondary">Status</p>
                  <p className="text-h5 text-text-primary capitalize">{incident?.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-near-black rounded-sm border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  incident?.ip_notification_sent 
                    ? 'bg-status-success/10 text-status-success' 
                    : 'bg-text-muted/10 text-text-muted'
                }`}>
                  {incident?.ip_notification_sent ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-body-sm text-text-secondary">Prijava IP</p>
                  <p className="text-h5 text-text-primary">
                    {incident?.ip_notification_sent ? 'Da' : 'Ne'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-bg-near-black rounded-sm border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  incident?.data_subjects_notified 
                    ? 'bg-status-success/10 text-status-success' 
                    : 'bg-text-muted/10 text-text-muted'
                }`}>
                  {incident?.data_subjects_notified ? <CheckCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-body-sm text-text-secondary">Obveščeni</p>
                  <p className="text-h5 text-text-primary">
                    {incident?.data_subjects_notified ? 'Da' : 'Ne'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* A1: Identifikacija incidenta */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">A1: Identifikacija incidenta</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">ID incidenta</label>
                    <p className="text-body text-text-primary font-mono">{incident?.breach_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nastanek kršitve</label>
                    <p className="text-body text-text-primary">
                      {formatDateTime(incident?.breach_start_datetime)} 
                      <span className="text-xs text-text-muted ml-2">({getTimeSinceBreach(incident?.breach_start_datetime)})</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Način odkritja</label>
                    <p className="text-body text-text-primary">{incident?.detection_method}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Časovni razpon</label>
                    <p className="text-body text-text-primary">
                      {formatDateTime(incident?.time_span_start)} - {formatDateTime(incident?.time_span_end)}
                    </p>
                  </div>
                </div>
              </div>

              {/* A2: Narava kršitve */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">A2: Narava kršitve</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tip kršitve</label>
                    <div className="flex flex-wrap gap-2">
                      {incident?.breach_type && Array.isArray(incident.breach_type) ? (
                        incident.breach_type.map((type: string) => (
                          <span key={type} className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-sm">
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-sm">
                          {incident?.breach_type || 'Ni določen'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Opis kršitve</label>
                    <p className="text-body text-text-primary">{incident?.breach_description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Vzrok</label>
                      <p className="text-body text-text-primary">{incident?.root_cause}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Notranja/Zunanja</label>
                      <p className="text-body text-text-primary">{incident?.internal_external}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Prizadeti sistemi</label>
                      <p className="text-body text-text-primary">
                        {incident?.affected_systems && Array.isArray(incident.affected_systems) 
                          ? incident.affected_systems.join(', ')
                          : incident?.affected_systems || 'Ni določeno'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* B: Obseg */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">B: Obseg kršitve</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Prizadeti posamezniki</label>
                    <p className="text-h4 text-text-primary">{incident?.estimated_individuals_affected || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Prizadeti zapisi</label>
                    <p className="text-h4 text-text-primary">{incident?.affected_records || 0}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Kategorije podatkov</label>
                    <div className="flex flex-wrap gap-2">
                      {incident?.data_categories && Array.isArray(incident.data_categories) ? (
                        incident.data_categories.map((category: string) => (
                          <span key={category} className="px-2 py-1 bg-bg-surface text-text-primary rounded text-sm border border-border-subtle">
                            {category}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-bg-surface text-text-primary rounded text-sm border border-border-subtle">
                          {incident?.data_categories || 'Ni določeno'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* E: Ukrepi */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">E: Ukrepi in ukrepanje</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Ukrepi zajezitve</label>
                    <div className="flex flex-wrap gap-2">
                      {incident?.containment_measures && Array.isArray(incident.containment_measures) ? (
                        incident.containment_measures.map((measure: string) => (
                          <span key={measure} className="px-2 py-1 bg-status-success/10 text-status-success rounded text-sm">
                            {measure}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-status-success/10 text-status-success rounded text-sm">
                          {incident?.containment_measures || 'Ni določeno'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Korektivni ukrepi</label>
                    <p className="text-body text-text-primary">{incident?.corrective_measures}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Rok korektivnih ukrepov</label>
                      <p className="text-body text-text-primary">{formatDateTime(incident?.corrective_deadline)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Odgovorna oseba</label>
                      <p className="text-body text-text-primary">{incident?.corrective_owner}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* C: Kontakt */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">C: Kontakt (GDPR 33(3)(b))</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">DPO ime</label>
                    <p className="text-body text-text-primary">{incident?.dpo_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">E-pošta</label>
                    <p className="text-body text-text-primary">{incident?.dpo_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefon</label>
                    <p className="text-body text-text-primary">{incident?.dpo_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Organizacija</label>
                    <p className="text-body text-text-primary">{incident?.dpo_organization}</p>
                  </div>
                </div>
              </div>

              {/* D: Ocena tveganja */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">D: Ocena tveganja (GDPR 33(3)(c))</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Verjetnost zlorabe</label>
                    <p className="text-body text-text-primary">{incident?.risk_probability}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Resnost posledic</label>
                    <p className="text-body text-text-primary">{incident?.risk_severity}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Verjetno tveganje</span>
                    <span className={`text-sm ${incident?.likely_risk ? 'text-status-warning' : 'text-text-muted'}`}>
                      {incident?.likely_risk ? 'Da' : 'Ne'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Veliko tiskanje</span>
                    <span className={`text-sm ${incident?.high_risk ? 'text-status-warning' : 'text-text-muted'}`}>
                      {incident?.high_risk ? 'Da' : 'Ne'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Možne posledice</label>
                    <div className="flex flex-wrap gap-1">
                      {incident?.consequences && Array.isArray(incident.consequences) ? (
                        incident.consequences.map((consequence: string) => (
                          <span key={consequence} className="px-2 py-1 bg-status-warning/10 text-status-warning rounded text-xs">
                            {consequence}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-status-warning/10 text-status-warning rounded text-xs">
                          {incident?.consequences || 'Ni določeno'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Poročanja */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">Poročanja in obvestila</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Prijava IP</span>
                    <div className="flex items-center gap-2">
                      {incident?.ip_notification_sent ? (
                        <CheckCircle className="w-4 h-4 text-status-success" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-text-muted rounded-full" />
                      )}
                      <span className={`text-sm ${incident?.ip_notification_sent ? 'text-status-success' : 'text-text-muted'}`}>
                        {incident?.ip_notification_sent ? 'Prijavljeno' : 'Ni prijavljeno'}
                      </span>
                    </div>
                  </div>
                  {incident?.ip_notification_sent && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Datum prijave IP</label>
                      <p className="text-body text-text-primary">{formatDateTime(incident?.ip_notification_datetime)}</p>
                      {incident?.ip_reference && (
                        <>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Referenca IP</label>
                          <p className="text-body text-text-primary font-mono">{incident?.ip_reference}</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Obveščanje posameznikov</span>
                    <div className="flex items-center gap-2">
                      {incident?.data_subjects_notified ? (
                        <CheckCircle className="w-4 h-4 text-status-success" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-text-muted rounded-full" />
                      )}
                      <span className={`text-sm ${incident?.data_subjects_notified ? 'text-status-success' : 'text-text-muted'}`}>
                        {incident?.data_subjects_notified ? 'Obveščeno' : 'Ni obveščeno'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZVOP-2 nacionalne zahteve */}
              <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-h5 text-text-primary">ZVOP-2 zahteve</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Posebne obdelave</span>
                    <span className={`text-sm ${incident?.special_processing ? 'text-status-warning' : 'text-text-muted'}`}>
                      {incident?.special_processing ? 'Da' : 'Ne'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Lokacija hrambe</label>
                    <p className="text-body text-text-primary">{incident?.data_location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">CSIRT obveščen</span>
                    <span className={`text-sm ${incident?.csirt_notified ? 'text-status-success' : 'text-text-muted'}`}>
                      {incident?.csirt_notified ? 'Da' : 'Ne'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Prenosi podatkov</span>
                    <span className={`text-sm ${incident?.transfers_made ? 'text-status-warning' : 'text-text-muted'}`}>
                      {incident?.transfers_made ? 'Da' : 'Ne'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priloge */}
              {incident?.file_url && (
                <div className="bg-bg-near-black rounded-sm border border-border-subtle p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-accent-primary" />
                    <h3 className="text-h5 text-text-primary">Priloge</h3>
                  </div>
                  <a
                    href={incident.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-bg-surface rounded border border-border-subtle hover:border-accent-primary transition-colors"
                  >
                    <FileText className="w-4 h-4 text-accent-primary" />
                    <div className="flex-1">
                      <p className="text-body text-text-primary">{incident?.file_name}</p>
                      {incident?.file_size && (
                        <p className="text-xs text-text-muted">
                          {Math.round(incident.file_size / 1024)} KB
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-accent-primary" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">
                Ustvarjeno: {formatDateTime(incident?.created_at)}
              </span>
              {incident?.updated_at !== incident?.created_at && (
                <span className="text-sm text-text-muted">
                  Posodobljeno: {formatDateTime(incident?.updated_at)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // PDF generation functionality would go here
                  alert('PDF generiranje bo implementirano v naslednjem koraku')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                Generiraj PDF poročilo
              </button>
              
              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-status-success text-white rounded hover:bg-status-success-hover transition-colors disabled:opacity-50"
                >
                  {saving ? 'Shranjevanje...' : 'Shrani spremembe'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
