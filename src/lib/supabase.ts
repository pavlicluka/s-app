import { createClient } from '@supabase/supabase-js'

// Get environment variables from multiple sources with fallbacks
function getEnvVar(key: string): string | undefined {
  // Priority 1: Window environment (injected in index.html)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const val = (window as any).__ENV__[key]
    if (val && !val.startsWith('%')) return val
  }
  
  // Priority 2: Vite import.meta.env
  if (import.meta.env[key]) {
    return import.meta.env[key]
  }
  
  // Priority 3: Process env (Node/build time)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  }
  
  return undefined
}

// Try to get environment variables, with fallback to project-specific values
let supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL')
let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')

// Fallback to hardcoded project values if environment variables are not available
// These should match the actual Supabase project from project_info
if (!supabaseUrl || supabaseUrl.includes('%VITE_SUPABASE')) {
  supabaseUrl = 'https://ckxlbiiirfdogobccmjs.supabase.co'
  console.warn('⚠️ Using fallback Supabase URL - environment variables not properly configured')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('%VITE_SUPABASE')) {
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGxiaWlpcmZkb2dvYmNjbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjI5NjIsImV4cCI6MjA3NzQzODk2Mn0.Y8T0bCsL5t_9u71z-yHYxrdyl4rqPN3fUMBg9k-p_TA'
  console.warn('⚠️ Using fallback Supabase anon key - environment variables not properly configured')
}

// Log environment variable status for debugging (only if values are missing)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('⚠️ Supabase environment variables missing:', {
    urlAvailable: !!supabaseUrl,
    keyAvailable: !!supabaseAnonKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    windowEnvAvailable: !!(window as any).__ENV__,
    importMetaEnv: !!import.meta.env.VITE_SUPABASE_URL
  })
} else if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase environment variables loaded successfully')
}

// Create client with fallback error handling
let supabaseClient: ReturnType<typeof createClient> | null = null

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables:
    - VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ MISSING'}
    - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ MISSING'}
    
    Please ensure these are set in your .env file or deployment environment.`)
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client initialized successfully')
} catch (error: any) {
  console.error('❌ Failed to initialize Supabase:', error.message)
  
  // Create a dummy client that will show clear errors
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    } catch (fallbackError) {
      console.error('❌ Fallback Supabase creation also failed:', fallbackError)
    }
  }
}

// Ensure we export a client (even if misconfigured, better to fail gracefully)
export const supabase = supabaseClient || createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Add a check function for runtime verification
export function validateSupabaseConfig() {
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL environment variable is not set')
  }
  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is not set')
  }
  return true
}

// Types for database tables
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user' | 'super_admin'
  organization_id: string | null
  created_at: string
  updated_at: string
}

export interface Incident {
  id: number
  incident_id: string
  type: string
  estimated_damage: 'Low' | 'Medium' | 'High'
  detected_at: string
  resolved_at: string | null
  nis2_required: boolean
  control_manager: string | null
  report_date: string | null
  status: 'open' | 'resolved' | 'investigating'
  created_at: string
}

export interface CyberReport {
  id: number
  reference_number: string
  subject: string
  report_type: string
  incident_start: string
  last_reporting: string | null
  status: 'draft' | 'submitted' | 'under_review' | 'closed'
  created_at: string
  updated_at: string
}

export interface Device {
  id: number
  manufacturer: string
  model: string
  device_type: string
  location: string
  device_user: string | null
  risk_level: 'Low' | 'Medium' | 'High'
  last_check: string | null
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
}

export interface SupportRequest {
  id: number
  ticket_id: string
  user_id: string | null
  full_name: string
  subject: string
  priority: 'Visoka' | 'Normalna' | 'Nizka'
  status: 'Odprt' | 'V obdelavi' | 'Zaprt'
  created_at: string
  updated_at: string
}

export interface RiskData {
  id: number
  category: 'inventory' | 'suppliers' | 'potentials'
  risk_level: 'Visoko tveganje' | 'Srednje tveganje' | 'Nizko tveganje'
  count: number
  created_at: string
}

export interface CyberIncidentReport {
  id: string
  // Legacy fields - now nullable with defaults
  incident_number: string | null
  detection_datetime: string | null
  incident_type: string | null
  incident_description: string | null
  impact_assessment: string | null
  incident_status: 'v teku' | 'rešen' | 'zaprt' | null
  entity_identifier: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  report_datetime: string | null
  incident_cause: 'tehnična napaka' | 'človeška napaka' | 'zlonamerno dejanje' | 'naravna nesreča' | 'drugo' | '' | null
  incident_impact: string | null
  response_measures: string | null
  lessons_learned: string | null
  report_type: 'prvo_porocilo' | 'vmesno_porocilo' | 'obvescanje_pno' | 'koncno_porocilo' | null
  created_at: string
  updated_at: string
  
  // Sekcija 0: Osnovni podatki
  referencna_stevilka: string | null
  zadeva: string | null
  tip_porocila: 'prostovoljna_priglasitev' | 'prvo_porocilo' | 'vmesno_porocilo' | 'koncno_porocilo' | '' | null
  
  // Sekcija 1: Splošne informacije
  naziv_subjekta: string | null
  sektor: string | null
  kontakt_tehnicni_ime: string | null
  kontakt_tehnicni_email: string | null
  kontakt_tehnicni_telefon: string | null
  kontakt_oseba_ime: string | null
  kontakt_oseba_email: string | null
  kontakt_oseba_telefon: string | null
  
  // Sekcija 2: Začetne informacije
  zacetek_incidenta: string | null
  cas_zaznave: string | null
  opis_incidenta: string | null
  taksonomija: string | null
  ocena_nevarnosti: string | null
  ocena_vpliva: string | null
  stopnja_incidenta: string | null
  opombe: string | null
  
  // Sekcija 3: Vmesno/končno poročanje
  cas_zadnjega_porocanja: string | null
  trenutno_stanje: string | null
  opis_napake_sistem: string | null
  opis_napake_streznik: string | null
  opis_napake_aplikacije: string | null
  opis_napake_drugo: string | null
  izvor_usb: boolean | null
  izvor_email: boolean | null
  izvor_vdor: boolean | null
  izvor_spletno: boolean | null
  izvor_datoteke: boolean | null
  izvor_drugo: string | null
  ogrozena_storitev_zinfv: boolean | null
  ogrozena_storitev_ostale: boolean | null
  cezmejni_vpliv_da_ne: boolean | null
  cezmejni_vpliv_opis: string | null
  akcijski_ze_sprejeti: string | null
  akcijski_nacrtovani: string | null
  povzrocena_skoda: string | null
  potrebe_odprava: string | null
  casovni_okvir: string | null
  priloge_seznam: string | null
}

export interface NIS2Documentation {
  id: string
  title: string
  description: string | null
  document_type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'csv'
  file_name: string
  file_path: string
  file_size: number
  uploaded_by: string
  category: string | null
  tags: string[] | null
  is_confidential: boolean
  version: string | null
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface NIS2Control {
  id: string
  organization_id: string
  control_id: string
  title: string
  description: string | null
  control_type: string
  control_category: string
  article_reference: string | null
  annex_reference: string | null
  implementation_requirement: string | null
  status: string
  implementation_date: string | null
  review_date: string | null
  next_review: string | null
  owner: string
  responsible_team: string | null
  scope: string | null
  procedures: string | null
  evidence_required: string | null
  risk_level: string | null
  threat_level: string | null
  vulnerability_level: string | null
  mitigation_effectiveness: string | null
  monitoring_frequency: string | null
  kpis: string | null
  success_criteria: string | null
  current_metrics: any
  regulatory_framework: string
  compliance_status: string
  gap_analysis: string | null
  improvement_plan: string | null
  document_links: string | null
  training_requirements: string | null
  policy_references: string | null
  priority: string
  last_audit_date: string | null
  audit_findings: string | null
  action_items: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  audit_trail: any[]
}

export interface RiskData {
  id: number
  category: 'inventory' | 'suppliers' | 'potentials'
  risk_level: 'Visoko tveganje' | 'Srednje tveganje' | 'Nizko tveganje'
  count: number
  created_at: string
}


// =====================================================
// GDPR DATA BREACH LOG - Celovit interface
// =====================================================
export interface GDPRDataBreachLog {
  id: string
  
  // SEKCIJA A: Identifikacija incidenta
  breach_id: string
  detection_datetime: string
  discovery_method: string
  breach_type: string[]
  information_system: string
  database_table?: string | null
  data_categories: string[]
  
  // SEKCIJA B: Narava kršitve
  breach_description: string
  breach_cause: string
  breach_source: 'internal' | 'external' | 'mixed'
  affected_subjects_count: number
  affected_records_count: number
  breach_start_datetime: string
  breach_end_datetime?: string | null
  
  // SEKCIJA C: Kontakt
  dpo_contact_name: string
  dpo_contact_email: string
  dpo_contact_phone?: string | null
  dpo_contact_department?: string | null
  
  // SEKCIJA D: Ocena tveganja
  probability_of_abuse: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  severity_of_consequences: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  likely_risk: boolean
  high_risk: boolean
  consequences_for_individuals?: string[] | null
  affected_areas?: string[] | null
  
  // SEKCIJA E: Ukrepi
  containment_measures: string[]
  containment_datetime?: string | null
  corrective_measures: string
  corrective_deadline?: string | null
  responsible_person?: string | null
  reported_to_authority: boolean
  notification_sent_at?: string | null
  notification_deadline?: string | null
  ip_reference_number?: string | null
  reason_for_delay?: string | null
  notify_individuals: boolean
  notify_individuals_date?: string | null
  notification_content?: string | null
  method_of_notification?: string | null
  exception_applied?: string | null
  
  // SEKCIJA F: ZVOP-2 zahteve
  processing_log_maintained: boolean
  processing_log_references?: string[] | null
  processing_action_type?: string | null
  processing_action_datetime?: string | null
  processing_executor?: string | null
  data_users?: string | null
  legal_hold_procedure: boolean
  legal_hold_type?: string | null
  deletion_prohibition: boolean
  deletion_prohibition_date?: string | null
  copy_order: boolean
  copy_count?: string | null
  special_processing: boolean
  special_processing_categories?: string[] | null
  data_residency_location?: string | null
  csirt_notification_required: boolean
  csirt_notification_date?: string | null
  csirt_reference_number?: string | null
  
  // SEKCIJA G: Posredovanja
  third_party_disclosures: boolean
  disclosure_records?: any | null
  disclosure_retention_period: string
  
  // SEKCIJA H: Dokumentacija
  attachments?: any | null
  attachment_description?: string | null
  internal_reports?: string | null
  authority_communications?: any | null
  
  // Dodatna polja
  incident_link?: string | null
  status: 'open' | 'in_progress' | 'mitigated' | 'closed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  breach_case_owner?: string | null
  escalation_flag: boolean
  version_history?: any | null
  evidence_hash?: string | null
  national_reporting_details?: any | null
  cross_border_details?: string | null
  
  // Audit polja
  created_at: string
  updated_at: string
  created_by?: string | null
  
  // Stara polja (backward compatibility)
  breach_date?: string | null
  discovery_date?: string | null
  affected_records?: number | null
  reporting_date?: string | null
  mitigation_steps?: string | null
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
}

// =====================================================
// AI ACT EU - AI System interfaces
// =====================================================

// Database interface (snake_case)
export interface AISystemDB {
  id: string
  user_id: string
  name: string
  description?: string | null
  category: string
  risk_level: string
  role: string
  provider: string
  purpose: string
  target_users: string
  input_data?: string | null
  output_data?: string | null
  training_data?: string | null
  bias_testing?: string | null
  discrimination_measures?: string | null
  data_processing?: string | null
  compliance_status?: string | null
  human_oversight?: string | null
  transparency?: string | null
  robustness?: string | null
  cybersecurity?: string | null
  decision_making?: string | null
  appeal_process?: string | null
  conformity_assessment?: boolean | null
  eu_declaration?: boolean | null
  ce_marking?: boolean | null
  registration?: boolean | null
  post_market_monitoring?: boolean | null
  incident_reporting?: boolean | null
  monitoring?: string | null
  incidents?: number | null
  fr_assessment?: boolean | null
  public_training_summary?: string | null
  code_of_practice?: string | null
  gdpr_reference?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}

// Client-side interface (camelCase) - for backward compatibility
export interface AISystem {
  id: string
  name: string
  description: string
  category: string
  riskLevel: string
  role: string
  provider: string
  purpose: string
  targetUsers: string
  inputData: string
  outputData: string
  trainingData: string
  biasTesting: string
  discriminationMeasures: string
  dataProcessing: string
  complianceStatus: string
  humanOversight: string
  transparency: string
  robustness: string
  cybersecurity: string
  decisionMaking: string
  appealProcess: string
  conformityAssessment: boolean
  euDeclaration: boolean
  ceMarking: boolean
  registration: boolean
  postMarketMonitoring: boolean
  incidentReporting: boolean
  monitoring: string
  incidents: number
  frAssessment: boolean
  publicTrainingSummary: string
  codeOfPractice: string
  gdprReference: string
  lastUpdate: string
  createdBy: string
}

// Helper functions to convert between camelCase and snake_case
export function aiSystemToDb(system: AISystem): Omit<AISystemDB, 'user_id' | 'created_at' | 'updated_at'> {
  return {
    id: system.id,
    name: system.name,
    description: system.description || null,
    category: system.category,
    risk_level: system.riskLevel,
    role: system.role,
    provider: system.provider,
    purpose: system.purpose,
    target_users: system.targetUsers,
    input_data: system.inputData || null,
    output_data: system.outputData || null,
    training_data: system.trainingData || null,
    bias_testing: system.biasTesting || null,
    discrimination_measures: system.discriminationMeasures || null,
    data_processing: system.dataProcessing || null,
    compliance_status: system.complianceStatus || null,
    human_oversight: system.humanOversight || null,
    transparency: system.transparency || null,
    robustness: system.robustness || null,
    cybersecurity: system.cybersecurity || null,
    decision_making: system.decisionMaking || null,
    appeal_process: system.appealProcess || null,
    conformity_assessment: system.conformityAssessment || null,
    eu_declaration: system.euDeclaration || null,
    ce_marking: system.ceMarking || null,
    registration: system.registration || null,
    post_market_monitoring: system.postMarketMonitoring || null,
    incident_reporting: system.incidentReporting || null,
    monitoring: system.monitoring || null,
    incidents: system.incidents || null,
    fr_assessment: system.frAssessment || null,
    public_training_summary: system.publicTrainingSummary || null,
    code_of_practice: system.codeOfPractice || null,
    gdpr_reference: system.gdprReference || null,
    created_by: system.createdBy
  }
}

export function aiSystemFromDb(dbSystem: AISystemDB): AISystem {
  return {
    id: dbSystem.id,
    name: dbSystem.name,
    description: dbSystem.description || '',
    category: dbSystem.category,
    riskLevel: dbSystem.risk_level,
    role: dbSystem.role,
    provider: dbSystem.provider,
    purpose: dbSystem.purpose,
    targetUsers: dbSystem.target_users,
    inputData: dbSystem.input_data || '',
    outputData: dbSystem.output_data || '',
    trainingData: dbSystem.training_data || '',
    biasTesting: dbSystem.bias_testing || '',
    discriminationMeasures: dbSystem.discrimination_measures || '',
    dataProcessing: dbSystem.data_processing || '',
    complianceStatus: dbSystem.compliance_status || '',
    humanOversight: dbSystem.human_oversight || '',
    transparency: dbSystem.transparency || '',
    robustness: dbSystem.robustness || '',
    cybersecurity: dbSystem.cybersecurity || '',
    decisionMaking: dbSystem.decision_making || '',
    appealProcess: dbSystem.appeal_process || '',
    conformityAssessment: dbSystem.conformity_assessment || false,
    euDeclaration: dbSystem.eu_declaration || false,
    ceMarking: dbSystem.ce_marking || false,
    registration: dbSystem.registration || false,
    postMarketMonitoring: dbSystem.post_market_monitoring || false,
    incidentReporting: dbSystem.incident_reporting || false,
    monitoring: dbSystem.monitoring || '',
    incidents: dbSystem.incidents || 0,
    frAssessment: dbSystem.fr_assessment || false,
    publicTrainingSummary: dbSystem.public_training_summary || '',
    codeOfPractice: dbSystem.code_of_practice || '',
    gdprReference: dbSystem.gdpr_reference || '',
    lastUpdate: dbSystem.updated_at || dbSystem.created_at || '',
    createdBy: dbSystem.created_by
  }
}
// =====================================================
// DPO CONSULTATION RECORDS - DPO Consultation interfaces
// =====================================================

// Interface za udeležence
export interface Participant {
  name: string
  surname: string
  role: string
  email: string
}

// Interface za dodeljene ukrepe
export interface AssignedMeasure {
  person: string
  measure: string
  deadline: string
}

// Interface za odgovorne osebe
export interface ResponsiblePerson {
  name: string
  role: string
  responsibilities: string
}

// Interface za priloge
export interface Attachment {
  filename: string
  path: string
  size: number
  uploadedAt: string
}

// Database interface (snake_case)
export interface DPOConsultationRecordDB {
  id: string
  user_id: string
  consultation_date: string
  title: string
  location_type: 'prisoten' | 'hybrid' | 'online'
  duration_minutes?: number | null
  dpo_name: string
  consultation_leader: string
  participants?: Participant[] | null
  external_advisors?: string | null
  topics_discussed?: string | null
  key_issues?: string | null
  documentation_presented?: string | null
  existing_measures?: string | null
  dpo_legal_advice?: string | null
  recommended_measures?: string | null
  risk_identification?: string | null
  deadline_for_action?: string | null
  final_decisions?: string | null
  assigned_measures?: AssignedMeasure[] | null
  monitoring_oversight?: string | null
  responsible_persons?: ResponsiblePerson[] | null
  attachments?: Attachment[] | null
  additional_notes?: string | null
  next_review_date?: string | null
  dpo_signature?: string | null
  leader_signature?: string | null
  confirmation_date?: string | null
  record_status: 'osnutek' | 'finalen'
  retention_period?: string | null
  document_number?: string | null
  document_version?: number | null
  created_at?: string
  updated_at?: string
  created_by: string
}

// Client-side interface (camelCase)
export interface DPOConsultationRecord {
  id: string
  consultationDate: string
  title: string
  locationType: 'prisoten' | 'hybrid' | 'online'
  durationMinutes: number
  dpoName: string
  consultationLeader: string
  participants: Participant[]
  externalAdvisors: string
  topicsDiscussed: string
  keyIssues: string
  documentationPresented: string
  existingMeasures: string
  dpoLegalAdvice: string
  recommendedMeasures: string
  riskIdentification: string
  deadlineForAction: string
  finalDecisions: string
  assignedMeasures: AssignedMeasure[]
  monitoringOversight: string
  responsiblePersons: ResponsiblePerson[]
  attachments: Attachment[]
  additionalNotes: string
  nextReviewDate: string
  dpoSignature: string
  leaderSignature: string
  confirmationDate: string
  recordStatus: 'osnutek' | 'finalen'
  retentionPeriod: string
  documentNumber: string
  documentVersion: number
  lastUpdate: string
  createdBy: string
}

// Helper functions to convert between camelCase and snake_case
export function dpoConsultationToDb(record: DPOConsultationRecord): Omit<DPOConsultationRecordDB, 'user_id' | 'created_at' | 'updated_at'> {
  return {
    id: record.id,
    consultation_date: record.consultationDate,
    title: record.title,
    location_type: record.locationType,
    duration_minutes: record.durationMinutes || null,
    dpo_name: record.dpoName,
    consultation_leader: record.consultationLeader,
    participants: record.participants || null,
    external_advisors: record.externalAdvisors || null,
    topics_discussed: record.topicsDiscussed || null,
    key_issues: record.keyIssues || null,
    documentation_presented: record.documentationPresented || null,
    existing_measures: record.existingMeasures || null,
    dpo_legal_advice: record.dpoLegalAdvice || null,
    recommended_measures: record.recommendedMeasures || null,
    risk_identification: record.riskIdentification || null,
    deadline_for_action: record.deadlineForAction || null,
    final_decisions: record.finalDecisions || null,
    assigned_measures: record.assignedMeasures || null,
    monitoring_oversight: record.monitoringOversight || null,
    responsible_persons: record.responsiblePersons || null,
    attachments: record.attachments || null,
    additional_notes: record.additionalNotes || null,
    next_review_date: record.nextReviewDate || null,
    dpo_signature: record.dpoSignature || null,
    leader_signature: record.leaderSignature || null,
    confirmation_date: record.confirmationDate || null,
    record_status: record.recordStatus,
    retention_period: record.retentionPeriod || null,
    document_number: record.documentNumber || null,
    document_version: record.documentVersion || null,
    created_by: record.createdBy
  }
}

export function dpoConsultationFromDb(dbRecord: DPOConsultationRecordDB): DPOConsultationRecord {
  return {
    id: dbRecord.id,
    consultationDate: dbRecord.consultation_date,
    title: dbRecord.title,
    locationType: dbRecord.location_type,
    durationMinutes: dbRecord.duration_minutes || 0,
    dpoName: dbRecord.dpo_name,
    consultationLeader: dbRecord.consultation_leader,
    participants: dbRecord.participants || [],
    externalAdvisors: dbRecord.external_advisors || '',
    topicsDiscussed: dbRecord.topics_discussed || '',
    keyIssues: dbRecord.key_issues || '',
    documentationPresented: dbRecord.documentation_presented || '',
    existingMeasures: dbRecord.existing_measures || '',
    dpoLegalAdvice: dbRecord.dpo_legal_advice || '',
    recommendedMeasures: dbRecord.recommended_measures || '',
    riskIdentification: dbRecord.risk_identification || '',
    deadlineForAction: dbRecord.deadline_for_action || '',
    finalDecisions: dbRecord.final_decisions || '',
    assignedMeasures: dbRecord.assigned_measures || [],
    monitoringOversight: dbRecord.monitoring_oversight || '',
    responsiblePersons: dbRecord.responsible_persons || [],
    attachments: dbRecord.attachments || [],
    additionalNotes: dbRecord.additional_notes || '',
    nextReviewDate: dbRecord.next_review_date || '',
    dpoSignature: dbRecord.dpo_signature || '',
    leaderSignature: dbRecord.leader_signature || '',
    confirmationDate: dbRecord.confirmation_date || '',
    recordStatus: dbRecord.record_status,
    retentionPeriod: dbRecord.retention_period || '5 let',
    documentNumber: dbRecord.document_number || '',
    documentVersion: dbRecord.document_version || 1,
    lastUpdate: dbRecord.updated_at || dbRecord.created_at || '',
    createdBy: dbRecord.created_by
  }
}

// GDPR Consent Records Types
export interface GDPRConsentRecord {
  id: string
  consentId: string
  consentVersion: string
  
  // Podatki o posamezniku
  dataSubjectName?: string
  dataSubjectContact?: string
  dataSubjectAgeStatus?: string
  isChild: boolean
  parentalConsentGiven: boolean
  parentalConsentDetails?: string
  
  // Podatki o privolitvi
  purposesOfProcessing: string
  dataCategories: string
  additionalProcessing?: string
  consentChannel: string
  consentMethod: string
  consentSegments?: string
  specialConditions?: string
  
  // Podatki o upravljavcu
  controllerIdentity: string
  dpoContact?: string
  processorIdentity?: string
  legalBasisAdditional?: string
  
  // Čas in datum
  consentObtainedAt: string
  consentValidityStart: string
  consentValidityEnd?: string
  storagePeriodStart: string
  storagePeriodEnd?: string
  
  // Status in upravljanje
  consentStatus: string
  statusReason?: string
  dpiaReference?: string
  
  // Dodatni podatki
  ipAddress?: string
  sessionId?: string
  userAccountId?: string
  geolocation?: string
  
  // Notranja evidenca
  internalReference?: string
  connectedRequests?: string
  systemSource?: string
  
  // Kvalifikacija dokumentov
  verificationStatus?: string
  electronicSignature?: string
  signatoryData?: string
  archiveLocation?: string
  
  // Dokumenti
  consentDocumentPath?: string
  additionalDocumentsPaths?: string[]
  
  // Preklic
  withdrawnAt?: string
  withdrawalChannel?: string
  withdrawalReason?: string
  withdrawalConfirmed: boolean
  
  // Metapodatki
  createdAt?: string
  updatedAt?: string
  auditTrail?: any[]
}

export interface GDPRConsentRecordDB {
  id: string
  user_id: string
  consent_id: string
  consent_version: string
  
  // Podatki o posamezniku
  data_subject_name?: string
  data_subject_contact?: string
  data_subject_age_status?: string
  is_child: boolean
  parental_consent_given: boolean
  parental_consent_details?: string
  
  // Podatki o privolitvi
  purposes_of_processing: string
  data_categories: string
  additional_processing?: string
  consent_channel: string
  consent_method: string
  consent_segments?: string
  special_conditions?: string
  
  // Podatki o upravljavcu
  controller_identity: string
  dpo_contact?: string
  processor_identity?: string
  legal_basis_additional?: string
  
  // Čas in datum
  consent_obtained_at: string
  consent_validity_start: string
  consent_validity_end?: string
  storage_period_start: string
  storage_period_end?: string
  
  // Status in upravljanje
  consent_status: string
  status_reason?: string
  dpia_reference?: string
  
  // Dodatni podatki
  ip_address?: string
  session_id?: string
  user_account_id?: string
  geolocation?: string
  
  // Notranja evidenca
  internal_reference?: string
  connected_requests?: string
  system_source?: string
  
  // Kvalifikacija dokumentov
  verification_status?: string
  electronic_signature?: string
  signatory_data?: string
  archive_location?: string
  
  // Dokumenti
  consent_document_path?: string
  additional_documents_paths?: string[]
  
  // Preklic
  withdrawn_at?: string
  withdrawal_channel?: string
  withdrawal_reason?: string
  withdrawal_confirmed: boolean
  
  // Metapodatki
  created_at: string
  updated_at: string
  audit_trail?: any[]
}

// Helper functions for GDPR Consent Records
export function consentRecordToDb(record: Partial<GDPRConsentRecord>): Partial<GDPRConsentRecordDB> {
  return {
    consent_id: record.consentId,
    consent_version: record.consentVersion,
    
    // Podatki o posamezniku
    data_subject_name: record.dataSubjectName,
    data_subject_contact: record.dataSubjectContact,
    data_subject_age_status: record.dataSubjectAgeStatus,
    is_child: record.isChild || false,
    parental_consent_given: record.parentalConsentGiven || false,
    parental_consent_details: record.parentalConsentDetails,
    
    // Podatki o privolitvi
    purposes_of_processing: record.purposesOfProcessing,
    data_categories: record.dataCategories,
    additional_processing: record.additionalProcessing,
    consent_channel: record.consentChannel,
    consent_method: record.consentMethod,
    consent_segments: record.consentSegments,
    special_conditions: record.specialConditions,
    
    // Podatki o upravljavcu
    controller_identity: record.controllerIdentity,
    dpo_contact: record.dpoContact,
    processor_identity: record.processorIdentity,
    legal_basis_additional: record.legalBasisAdditional,
    
    // Čas in datum
    consent_obtained_at: record.consentObtainedAt,
    consent_validity_start: record.consentValidityStart,
    consent_validity_end: record.consentValidityEnd,
    storage_period_start: record.storagePeriodStart,
    storage_period_end: record.storagePeriodEnd,
    
    // Status in upravljanje
    consent_status: record.consentStatus,
    status_reason: record.statusReason,
    dpia_reference: record.dpiaReference,
    
    // Dodatni podatki
    ip_address: record.ipAddress,
    session_id: record.sessionId,
    user_account_id: record.userAccountId,
    geolocation: record.geolocation,
    
    // Notranja evidenca
    internal_reference: record.internalReference,
    connected_requests: record.connectedRequests,
    system_source: record.systemSource,
    
    // Kvalifikacija dokumentov
    verification_status: record.verificationStatus,
    electronic_signature: record.electronicSignature,
    signatory_data: record.signatoryData,
    archive_location: record.archiveLocation,
    
    // Dokumenti
    consent_document_path: record.consentDocumentPath,
    additional_documents_paths: record.additionalDocumentsPaths,
    
    // Preklic
    withdrawn_at: record.withdrawnAt,
    withdrawal_channel: record.withdrawalChannel,
    withdrawal_reason: record.withdrawalReason,
    withdrawal_confirmed: record.withdrawalConfirmed || false
  }
}

export function consentRecordFromDb(dbRecord: GDPRConsentRecordDB): GDPRConsentRecord {
  return {
    id: dbRecord.id,
    consentId: dbRecord.consent_id,
    consentVersion: dbRecord.consent_version,
    
    // Podatki o posamezniku
    dataSubjectName: dbRecord.data_subject_name,
    dataSubjectContact: dbRecord.data_subject_contact,
    dataSubjectAgeStatus: dbRecord.data_subject_age_status,
    isChild: dbRecord.is_child,
    parentalConsentGiven: dbRecord.parental_consent_given,
    parentalConsentDetails: dbRecord.parental_consent_details,
    
    // Podatki o privolitvi
    purposesOfProcessing: dbRecord.purposes_of_processing,
    dataCategories: dbRecord.data_categories,
    additionalProcessing: dbRecord.additional_processing,
    consentChannel: dbRecord.consent_channel,
    consentMethod: dbRecord.consent_method,
    consentSegments: dbRecord.consent_segments,
    specialConditions: dbRecord.special_conditions,
    
    // Podatki o upravljavcu
    controllerIdentity: dbRecord.controller_identity,
    dpoContact: dbRecord.dpo_contact,
    processorIdentity: dbRecord.processor_identity,
    legalBasisAdditional: dbRecord.legal_basis_additional,
    
    // Čas in datum
    consentObtainedAt: dbRecord.consent_obtained_at,
    consentValidityStart: dbRecord.consent_validity_start,
    consentValidityEnd: dbRecord.consent_validity_end,
    storagePeriodStart: dbRecord.storage_period_start,
    storagePeriodEnd: dbRecord.storage_period_end,
    
    // Status in upravljanje
    consentStatus: dbRecord.consent_status,
    statusReason: dbRecord.status_reason,
    dpiaReference: dbRecord.dpia_reference,
    
    // Dodatni podatki
    ipAddress: dbRecord.ip_address,
    sessionId: dbRecord.session_id,
    userAccountId: dbRecord.user_account_id,
    geolocation: dbRecord.geolocation,
    
    // Notranja evidenca
    internalReference: dbRecord.internal_reference,
    connectedRequests: dbRecord.connected_requests,
    systemSource: dbRecord.system_source,
    
    // Kvalifikacija dokumentov
    verificationStatus: dbRecord.verification_status,
    electronicSignature: dbRecord.electronic_signature,
    signatoryData: dbRecord.signatory_data,
    archiveLocation: dbRecord.archive_location,
    
    // Dokumenti
    consentDocumentPath: dbRecord.consent_document_path,
    additionalDocumentsPaths: dbRecord.additional_documents_paths,
    
    // Preklic
    withdrawnAt: dbRecord.withdrawn_at,
    withdrawalChannel: dbRecord.withdrawal_channel,
    withdrawalReason: dbRecord.withdrawal_reason,
    withdrawalConfirmed: dbRecord.withdrawal_confirmed,
    
    // Metapodatki
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    auditTrail: dbRecord.audit_trail
  }
}