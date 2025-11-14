import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider } from './hooks/useProfile'
import { OrganizationProvider } from './hooks/useOrganization'
import OrganizationSettingsPage from './components/organization/OrganizationSettingsPage'
import UserInvitationUI from './components/organization/UserInvitationUI'
import i18n from './i18n' // Uvozimo i18next za preverjanje stanja
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import WorkspacesPage from './components/WorkspacesPage'
import NIS2Page from './components/NIS2Page'
import NIS2DocumentationPage from './components/NIS2DocumentationPage'
import NIS2ControlsPage from './components/NIS2ControlsPage'
import NIS2NonConformitiesPage from './components/NIS2NonConformitiesPage'
import NIS2SupplyChainPage from './components/NIS2SupplyChainPage'
import NIS2ResponsibilityManagementPage from './components/NIS2ResponsibilityManagementPage'
import GDPRPage from './components/GDPRPage'
import ISO27001Page from './components/ISO27001Page'
import EducationModules from './components/other/EducationModules'
import { useTranslation } from 'react-i18next'
import { Play, Bot, FileText, AlertTriangle, Shield, FileCheck, BookOpen, Monitor, Settings } from 'lucide-react'
import InventoryPage from './components/InventoryPage'
import ProceduresPoliciesPage from './components/ProceduresPoliciesPage'
import SupportPage from './components/SupportPage'
import SettingsPage from './components/SettingsPage'
import SuperAdminPage from './components/SuperAdminPage'
import MISPPage from './components/MISPPage'
import Login from './components/Login'
import CyberIncidentReportPage from './pages/CyberIncidentReportPage'
import IncidentRedirect from './components/IncidentRedirect'
import SendMessage from './components/SendMessage'
import RiskRegister from './components/nis2/RiskRegister'
import ProfileEditPage from './pages/ProfileEditPage'
import AuditTrailPage from './pages/AuditTrailPage'
import ChangePasswordModal from './components/modals/ChangePasswordModal'
import ITSecutityTestsOrder from './components/ITSecutityTestsOrder'
import EducationOrder from './components/EducationOrder'
import ITServicesOrder from './components/ITServicesOrder'
import ServicesQuoteOrder from './components/ServicesQuoteOrder'
import ServicesOrderOverview from './components/ServicesOrderOverview'
import InventoryDevices from './components/other/InventoryDevices'
import InventorySoftware from './components/other/InventorySoftware'
import InventoryLicenses from './components/other/InventoryLicenses'

// GDPR components
import GDPRProcessingActivitiesRecord from './components/gdpr/GDPRProcessingActivitiesRecord'
import GDPRDataProtection from './components/gdpr/GDPRDataProtection'
import GDPRPrivacyPolicy from './components/gdpr/GDPRPrivacyPolicy'
import GDPRConsentManagement from './components/gdpr/GDPRConsentManagement'
import GDPRRightForgotten from './components/gdpr/GDPRRightForgotten'
import GDPRDataBreachLog from './components/gdpr/GDPRDataBreachLog'
import GDPRIncidentEvidence from './components/gdpr/GDPRIncidentEvidence'
import ZVOP2Compliance from './components/gdpr/ZVOP2Compliance'
import GDPRAuditTrail from './components/gdpr/GDPRAuditTrail'
import GDPRDPIA from './components/gdpr/GDPRDPIA'
import GDPRControllerProcessor from './components/gdpr/GDPRControllerProcessor'
// GDPRReminderSystem removed - now using useActiveAlerts hook in Dashboard
import GDPRUsposabljanjaEvidence from './components/gdpr/GDPRUsposabljanjaEvidence'

// ISO components
import ISMScope from './components/iso/ISMScope'
import InformationSecurityPolicy from './components/iso/InformationSecurityPolicy'
import ISOAuditLog from './components/iso/ISOAuditLog'
import ISORiskAssessment from './components/iso/ISORiskAssessment'
import ISOSecurityPolicies from './components/iso/ISOSecurityPolicies'
import ISOControlsManagement from './components/iso/ISOControlsManagement'
import ISORolesAndResponsibilities from './components/iso/ISORolesAndResponsibilities'
import ISOCertificationStatus from './components/iso/ISOCertificationStatus'
import ISOAssetManagement from './components/iso/ISOAssetManagement'
import ISOIncidentResponse from './components/iso/ISOIncidentResponse'
import ISOComplianceTracking from './components/iso/ISOComplianceTracking'
import ISOStatementApplicability from './components/iso/ISOStatementApplicability'

// AI Act EU components
import AIActPage from './components/AIActPage'
import AISystemsPage from './components/AISystemsPage'
import AICompliancePage from './components/AICompliancePage'
import AIRiskAssessmentPage from './components/AIRiskAssessmentPage'
import AITransparencyPage from './components/AITransparencyPage'

// ZZPri components
import ZZPriPage from './components/ZZPriPage'
import ZZPriPrijavePage from './components/ZZPriPrijavePage'
import ZZPriZaupnikiPage from './components/ZZPriZaupnikiPage'
import ZZPriObrazciPage from './components/ZZPriObrazciPage'
import ZZPriDokumentacijaPage from './components/ZZPriDokumentacijaPage'

// Alerts component
import AlertsPage from './components/AlertsPage'

// Other components
import Procedures from './components/other/Procedures'
import Policies from './components/other/Policies'
import Templates from './components/other/Templates'
import SupportTicketManagement from './components/other/SupportTicketManagement'
import SettingsAdvancedConfig from './components/other/SettingsAdvancedConfig'
import SOCPage from './components/SOCPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'

  console.log('🚀 AppContent: user:', user?.id || 'null', 'loading:', loading, 'demoMode:', isDemoMode);

  // Function to load chatbot script after successful login
  const loadChatbot = () => {
    // Check if chatbot script is already loaded
    if (document.querySelector('script[src="https://ai-stein.net/vendor/chatbot/js/external-chatbot.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://ai-stein.net/vendor/chatbot/js/external-chatbot.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-chatbot-uuid', 'dad681fb-4d9e-4c7b-9949-b2b245bb6bb1');
    script.setAttribute('data-iframe-width', '420');
    script.setAttribute('data-iframe-height', '550');
    script.setAttribute('data-language', 'en');
    document.head.appendChild(script);
  };

  // Load chatbot after user successfully logs in
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ App: Loading chatbot for authenticated user');
      loadChatbot();
    }
  }, [user, loading]);

  if (loading && !isDemoMode) {
    console.log('⏳ App: Prikazujem loading indikator');
    return (
      <div className="min-h-screen bg-bg-near-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!user && !isDemoMode) {
    console.log('🔐 App: Prikazujem Login komponento');
    return <Login />
  }

  console.log('🏠 App: Prikazujem glavno aplikacijo (user:', user?.id || 'null', ', demoMode:', isDemoMode, ')');

  // Video Education Page Component
  const VideoEducationPage = () => {
    const { t } = useTranslation()
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">
            {t('navigation.videoEducation')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* 4 Video Placeholders */}
          {[1, 2, 3, 4].map((index) => (
            <div 
              key={index}
              className="bg-bg-surface border border-border-subtle rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] hover:bg-bg-surface-hover transition-colors duration-200"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-bg-surface-hover rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-text-tertiary" />
                </div>
                <div className="text-center">
                  <p className="text-body font-medium text-text-secondary">
                    Video v pripravi
                  </p>
                  <p className="text-body-sm text-text-tertiary mt-1">
                    Video {index}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // AI Act EU Overview Page Component
  const AIActOverviewPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    const { t } = useTranslation()
    
    const cards = [
      {
        id: 'ai-systems',
        title: 'AI sistemi',
        description: 'Upravljanje in nadzor AI sistemov v skladu z AI Act EU',
        icon: 'Bot',
        color: 'text-blue-400'
      },
      {
        id: 'ai-compliance',
        title: 'Dokumenti skladnosti',
        description: 'Dokumentacija in dokazila o skladnosti z AI Act EU',
        icon: 'FileText',
        color: 'text-green-400'
      },
      {
        id: 'ai-risk-assessment',
        title: 'Ocenjevanje tveganj',
        description: 'Ocenjevanje tveganj in upravljanje AI sistemov',
        icon: 'AlertTriangle',
        color: 'text-yellow-400'
      },
      {
        id: 'ai-transparency',
        title: 'Preglednost AI sistemov',
        description: 'Sledljivost in transparentnost AI sistemov',
        icon: 'Shield',
        color: 'text-purple-400'
      }
    ]

    const getIcon = (iconName: string) => {
      switch(iconName) {
        case 'Bot': return <Bot className="w-8 h-8" />
        case 'FileText': return <FileText className="w-8 h-8" />
        case 'AlertTriangle': return <AlertTriangle className="w-8 h-8" />
        case 'Shield': return <Shield className="w-8 h-8" />
        default: return <FileCheck className="w-8 h-8" />
      }
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">AI Act EU</h1>
              <p className="text-text-secondary">
                Upravljanje in nadzor skladnosti z Evropskim aktom o umetni inteligenci
              </p>
            </div>
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6 hover:bg-bg-surface-hover cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-bg-near-black ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                  {getIcon(card.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-text-secondary text-body-sm mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-accent-primary text-body-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    Pojdi na stran
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Services Order Overview Page Component
  const ServicesOrderOverviewPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    const { t } = useTranslation()
    
    const cards = [
      {
        id: 'it-security-tests-order',
        title: 'Naročilo IT-testov',
        description: 'Naročilo IT-varnostnih testov in varnostnih storitev',
        icon: 'FileCheck',
        color: 'text-red-400'
      },
      {
        id: 'education-order',
        title: 'Naročilo izobraževanja',
        description: 'Naročilo izobraževalnih storitev in usposabljanj',
        icon: 'BookOpen',
        color: 'text-blue-400'
      },
      {
        id: 'it-services-order',
        title: 'Naročilo IT-storitev',
        description: 'Naročilo IT-svetovanja in tehnične pomoči',
        icon: 'Monitor',
        color: 'text-green-400'
      }
    ]

    const getIcon = (iconName: string) => {
      switch(iconName) {
        case 'FileCheck': return <FileCheck className="w-8 h-8" />
        case 'BookOpen': return <BookOpen className="w-8 h-8" />
        case 'Monitor': return <Monitor className="w-8 h-8" />
        case 'Shield': return <Shield className="w-8 h-8" />
        default: return <FileCheck className="w-8 h-8" />
      }
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Naročilo storitev</h1>
              <p className="text-text-secondary">
                Upravljanje in naročilo različnih storitev
              </p>
            </div>
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6 hover:bg-bg-surface-hover cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-bg-near-black ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                  {getIcon(card.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-text-secondary text-body-sm mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-accent-primary text-body-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    Pojdi na stran
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Education Overview Page Component
  const EducationOverviewPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    const { t } = useTranslation()
    
    const cards = [
      {
        id: 'education-modules',
        title: 'Izobraževalni moduli',
        description: 'Upravljanje in dostop do izobraževalnih modulov',
        icon: 'BookOpen',
        color: 'text-blue-400'
      },
      {
        id: 'video-education',
        title: 'Video izobraževanje',
        description: 'Video vsebine za učenje in usposabljanje',
        icon: 'Play',
        color: 'text-green-400'
      }
    ]

    const getIcon = (iconName: string) => {
      switch(iconName) {
        case 'BookOpen': return <BookOpen className="w-8 h-8" />
        case 'Play': return <Play className="w-8 h-8" />
        default: return <BookOpen className="w-8 h-8" />
      }
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Izobraževanje</h1>
              <p className="text-text-secondary">
                Upravljanje izobraževalnih vsebin in modulov
              </p>
            </div>
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6 hover:bg-bg-surface-hover cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-bg-near-black ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                  {getIcon(card.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-text-secondary text-body-sm mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-accent-primary text-body-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    Pojdi na stran
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render current page
  const renderPage = () => {
    console.log('🎯 App: renderPage called with currentPage:', currentPage, 'user:', user?.id || 'null', 'demoMode:', isDemoMode)
    console.log('🔍 App: Current page state debug - page type:', typeof currentPage, 'value:', currentPage)
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />
      case 'workspaces':
        return <WorkspacesPage />
      case 'alerts':
        return <AlertsPage onNavigate={setCurrentPage} />
      case 'nis2':
        return <NIS2Page setCurrentPage={setCurrentPage} />
      case 'nis2-documentation':
        return <NIS2DocumentationPage setCurrentPage={setCurrentPage} />
      case 'nis2-controls':
        return <NIS2ControlsPage setCurrentPage={setCurrentPage} />
      case 'nis2-supply-chain':
        return <NIS2SupplyChainPage setCurrentPage={setCurrentPage} />
      case 'nis2-non-conformities':
        return <NIS2NonConformitiesPage setCurrentPage={setCurrentPage} />
      case 'evidenca-odgovornih-oseb':
        return <NIS2ResponsibilityManagementPage setCurrentPage={setCurrentPage} />
      case 'cyber-incident-report':
        return <CyberIncidentReportPage />
      case 'nis2-risk-register':
        return <RiskRegister />
      case 'profile-edit':
        return <ProfileEditPage onNavigate={setCurrentPage} />
      case 'change-password':
        setShowPasswordModal(true)
        setCurrentPage('dashboard')
        return <Dashboard setCurrentPage={setCurrentPage} />
      case 'audit-trail':
        return <AuditTrailPage onNavigate={setCurrentPage} />
      case 'aiact':
        return <AIActOverviewPage onNavigate={setCurrentPage} />
      case 'ai-act-eu':
        return <AIActOverviewPage onNavigate={setCurrentPage} />
      case 'ai-systems':
        return <AISystemsPage onNavigate={setCurrentPage} />
      case 'ai-compliance':
        return <AICompliancePage onNavigate={setCurrentPage} />
      case 'ai-risk-assessment':
        return <AIRiskAssessmentPage onNavigate={setCurrentPage} />
      case 'ai-transparency':
        return <AITransparencyPage onNavigate={setCurrentPage} />
      case 'gdpr':
        return <GDPRPage onNavigate={setCurrentPage} />
      case 'iso27001':
        return <ISO27001Page onNavigate={setCurrentPage} />
      
      // ZZPri pages
      case 'zzzpri':
        return <ZZPriPage onNavigate={setCurrentPage} />
      case 'zzzpri-dashboard':
        return <ZZPriPage onNavigate={setCurrentPage} />
      case 'zzzpri-prijave':
        return <ZZPriPrijavePage />
      case 'zzzpri-zaupniki':
        return <ZZPriZaupnikiPage />
      case 'zzzpri-obrazci':
        return <ZZPriObrazciPage />
      case 'zzzpri-postopki':
        return <ZZPriPage onNavigate={setCurrentPage} />
      case 'zzzpri-porocila':
        return <ZZPriPage onNavigate={setCurrentPage} />
      case 'zzzpri-statistike':
        return <ZZPriPage onNavigate={setCurrentPage} />
      case 'zzzpri-dokumentacija':
        return <ZZPriDokumentacijaPage />
      case 'zzzpri-navodila':
        return <ZZPriDokumentacijaPage />
      case 'zzzpri-nastavitve':
        return <ZZPriPage onNavigate={setCurrentPage} />
        
      case 'educations':
        return <EducationModules />
      case 'education-modules':
        return <EducationModules />
      case 'video-education':
        return <VideoEducationPage />
      case 'education':
        return <EducationOverviewPage onNavigate={setCurrentPage} />
      case 'inventory':
        return <InventoryPage onNavigate={setCurrentPage} />
      case 'procedures':
        return <ProceduresPoliciesPage onNavigate={setCurrentPage} />
      case 'support':
        return <SupportPage />
      case 'settings':
        return <SettingsPage />
      case 'super-admin':
        return <SuperAdminPage />
      
      // GDPR subpages
      case 'processing-activities':
        return <GDPRProcessingActivitiesRecord />
      case 'gdpr-data-protection':
        return <GDPRDataProtection />
      case 'gdpr-privacy-policy':
        return <GDPRPrivacyPolicy />
      case 'gdpr-consent':
        return <GDPRConsentManagement />
      case 'gdpr-forgotten':
        return <GDPRRightForgotten />
      case 'gdpr-breach':
        return <GDPRIncidentEvidence />
      case 'gdpr-usposabljanja':
        return <GDPRUsposabljanjaEvidence />
      case 'zvop-2':
        return <ZVOP2Compliance />
      case 'gdpr-audit':
        return <GDPRAuditTrail />
      case 'gdpr-dpia':
        return <GDPRDPIA />
      case 'gdpr-controller':
        return <GDPRControllerProcessor />
      case 'gdpr-processors':
        return <GDPRControllerProcessor />
      
      // ISO subpages
      case 'iso-scope':
        return <ISMScope />
      case 'iso-information-security-policy':
        return <InformationSecurityPolicy />
      case 'iso-audit':
        return <ISOAuditLog />
      case 'iso-risk':
        return <ISORiskAssessment />

      case 'iso-controls':
        return <ISOControlsManagement />
      case 'iso-vloge-odgovornosti':
        return <ISORolesAndResponsibilities />
      case 'iso-certification':
        return <ISOCertificationStatus />
      case 'iso-assets':
        return <ISOAssetManagement />
      case 'iso-incident':
        return <ISOIncidentResponse />
      case 'iso-compliance':
        return <ISOComplianceTracking />
      case 'iso-soa':
        return <ISOStatementApplicability />
      
      // Other subpages
      case 'procedures-list':
        return <Procedures />
      case 'policies-list':
        return <Policies />
      case 'templates-list':
        return <Templates />
      case 'inventory-devices':
        return <InventoryDevices />
      case 'inventory-software':
        return <InventorySoftware />
      case 'inventory-licenses':
        return <InventoryLicenses />
      case 'it-security-tests-order':
        return <ITSecutityTestsOrder />
      case 'education-order':
        return <EducationOrder />
      case 'it-services-order':
        return <ITServicesOrder />
      case 'services-quote-order':
        return <ServicesQuoteOrder />
      case 'additional-services':
        return <ServicesOrderOverview onNavigate={setCurrentPage} />
      case 'support-basic':
        return <SupportPage />
      case 'support-send-message':
        return <SendMessage />
      case 'support-tickets':
        return <SupportTicketManagement />
      case 'settings-basic':
        return <SettingsPage />
      case 'settings-advanced':
        return <SettingsAdvancedConfig />
      case 'misp':
        return <MISPPage setCurrentPage={setCurrentPage} />
        
      // Organization management pages
      case 'organization-management':
        return <OrganizationSettingsPage setCurrentPage={setCurrentPage} />
      case 'organization-invite':
        return <UserInvitationUI setCurrentPage={setCurrentPage} />
        
      // SOC page
      case 'soc':
        return <SOCPage onNavigate={setCurrentPage} />
        
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-bg-near-black">
      {/* Sidebar */}
      <Sidebar activePage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content Area */}
      <div className="md:ml-[280px] ml-0 pt-20">
        {/* Header */}
        <Header onNavigate={setCurrentPage} />

        {/* Change Password Modal */}
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}

        {/* GDPR Reminder System removed - now using useActiveAlerts hook in Dashboard */}

        {/* Main Content */}
        <main className="p-4 md:p-8">
          {isDemoMode && (
            <div className="mb-4 p-4 bg-accent-primary/20 border border-accent-primary/40 rounded-lg">
              <p className="text-body-sm text-accent-primary font-medium">
                Demo način - Prikazani so demo podatki brez avtentikacije
              </p>
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <OrganizationProvider>
          <AppContent />
        </OrganizationProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}
