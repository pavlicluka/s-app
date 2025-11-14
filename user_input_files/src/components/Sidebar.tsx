import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  Monitor, 
  Shield, 
  Lock, 
  FileCheck, 
  BookOpen, 
  Archive, 
  FileText, 
  HelpCircle, 
  Settings, 
  UserCog,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Truck,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import Logo from './common/Logo'

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

interface MenuItem {
  id: string
  label: string
  icon: any
  hasSubmenu: boolean
  submenu: any[]
  showOverview?: string
}

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const { t } = useTranslation()
  
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, hasSubmenu: false, submenu: [] },
    { id: 'workspaces', label: t('navigation.workspaces'), icon: Monitor, hasSubmenu: false, submenu: [] },
    { 
      id: 'alerts', 
      label: 'Opozorila', 
      icon: AlertTriangle, 
      hasSubmenu: false, 
      submenu: [] 
    },
    { 
      id: 'nis2', 
      label: t('navigation.nis2'), 
      icon: Shield, 
      hasSubmenu: true, 
      submenu: [
        { id: 'nis2-risk-register', label: 'Evidence tveganj' },
        { id: 'nis2-non-conformities', label: 'Evidence neskladnosti' },
        { id: 'evidenca-odgovornih-oseb', label: 'Evidence odgovornih oseb' },
        { id: 'nis2-supply-chain', label: 'Dobavne verige' },
        { id: 'nis2-controls', label: 'Kontrole in ukrepi' },
        { id: 'nis2-documentation', label: 'Dokumentacija' },
        { id: 'cyber-incident-report', label: t('navigation.nis2Submenu.cyberReports') || 'Poročanje o kibernetskih incidentih' }
      ]
    },
    { 
      id: 'ai-act-eu', 
      label: 'AI Act EU', 
      icon: FileCheck, 
      hasSubmenu: true,
      submenu: [
        { id: 'ai-systems', label: 'AI sistemi' },
        { id: 'ai-compliance', label: 'Dokumenti skladnosti' },
        { id: 'ai-risk-assessment', label: 'Ocenjevanje tveganj' },
        { id: 'ai-transparency', label: 'Preglednost AI sistemov' },
      ]
    },
    { 
      id: 'gdpr', 
      label: t('navigation.gdpr'), 
      icon: Lock, 
      hasSubmenu: true,
      submenu: [
        { id: 'processing-activities', label: t('navigation.gdprSubmenu.processingActivities') },
        { id: 'gdpr-processors', label: t('navigation.gdprSubmenu.processors') },
        { id: 'gdpr-breach', label: t('navigation.gdprSubmenu.breach') },
        { id: 'gdpr-forgotten', label: t('navigation.gdprSubmenu.forgotten') },
        { id: 'gdpr-data-protection', label: t('navigation.gdprSubmenu.dataProtection') },
        { id: 'gdpr-dpia', label: t('navigation.gdprSubmenu.dpia') },
        { id: 'gdpr-audit', label: t('navigation.gdprSubmenu.audit') },
        { id: 'gdpr-usposabljanja', label: t('navigation.gdprSubmenu.usposabljanja') },
        { id: 'zvop-2', label: t('navigation.gdprSubmenu.zvop2') },
        { id: 'gdpr-privacy-policy', label: t('navigation.gdprSubmenu.privacyPolicy') },
        { id: 'gdpr-consent', label: t('navigation.gdprSubmenu.consent') },
      ]
    },
    { 
      id: 'iso27001', 
      label: t('navigation.iso27001'), 
      icon: FileCheck, 
      hasSubmenu: true,
      submenu: [
        { id: 'iso-scope', label: 'Obseg ISMS' },
        { id: 'iso-information-security-policy', label: 'IT-varnostne politike' },
        { id: 'iso-audit', label: t('navigation.isoSubmenu.audit') },
        { id: 'iso-risk', label: t('navigation.isoSubmenu.risk') },
        { id: 'iso-controls', label: t('navigation.isoSubmenu.controls') },
        { id: 'iso-vloge-odgovornosti', label: t('navigation.isoSubmenu.rolesAndResponsibilities') },
        { id: 'iso-certification', label: t('navigation.isoSubmenu.certification') },
        { id: 'iso-assets', label: t('navigation.isoSubmenu.assets') },
        { id: 'iso-incident', label: t('navigation.isoSubmenu.incident') },
        { id: 'iso-compliance', label: t('navigation.isoSubmenu.compliance') },
        { id: 'iso-soa', label: t('navigation.isoSubmenu.soa') },
      ]
    },
    { 
      id: 'zzzpri', 
      label: t('navigation.zzzpri') || 'ZZPri', 
      icon: MessageSquare, 
      hasSubmenu: true,
      submenu: [
        { id: 'zzzpri-prijave', label: t('navigation.zzzpriSubmenu.prijave') || 'Prijave' },
        { id: 'zzzpri-zaupniki', label: t('navigation.zzzpriSubmenu.zaupniki') || 'Zaupniki' },
        { id: 'zzzpri-obrazci', label: t('navigation.zzzpriSubmenu.obrazci') || 'Obrazci' },
        { id: 'zzzpri-postopki', label: t('navigation.zzzpriSubmenu.postopki') || 'Postopki' },
        { id: 'zzzpri-porocila', label: t('navigation.zzzpriSubmenu.porocila') || 'Poročila' },
        { id: 'zzzpri-statistike', label: t('navigation.zzzpriSubmenu.statistike') || 'Statistike' },
        { id: 'zzzpri-dokumentacija', label: t('navigation.zzzpriSubmenu.dokumentacija') || 'Dokumentacija' },
        { id: 'zzzpri-nastavitve', label: t('navigation.zzzpriSubmenu.nastavitve') || 'Nastavitve' }
      ]
    },
    { 
      id: 'education', 
      label: t('navigation.education'), 
      icon: BookOpen, 
      hasSubmenu: true,
      submenu: [
        { id: 'education-modules', label: t('navigation.educationModules') },
        { id: 'video-education', label: t('navigation.videoEducation') },
      ]
    },
    { 
      id: 'inventory', 
      label: t('navigation.inventory'), 
      icon: Archive, 
      hasSubmenu: true,
      submenu: [
        { id: 'inventory-devices', label: t('navigation.inventorySubmenu.devices') },
        { id: 'inventory-software', label: t('navigation.inventorySubmenu.software') },
        { id: 'inventory-licenses', label: t('navigation.inventorySubmenu.licenses') },
      ]
    },
    { 
      id: 'additional-services', 
      label: 'Naročilo storitev', 
      icon: Settings, 
      hasSubmenu: true,
      submenu: [
        { id: 'it-security-tests-order', label: t('Naročilo IT-testov') },
        { id: 'education-order', label: 'Naročilo izobraževanja' },
        { id: 'it-services-order', label: 'Naročilo IT-storitev' },
        { id: 'services-quote-order', label: 'Naročilo ponudbe' },
      ],
      showOverview: 'additional-services'
    },
    { 
      id: 'procedures', 
      label: t('navigation.procedures'), 
      icon: FileText, 
      hasSubmenu: true,
      submenu: [
        { id: 'procedures-list', label: t('navigation.proceduresSubmenu.procedures') },
        { id: 'policies-list', label: t('navigation.proceduresSubmenu.policies') },
        { id: 'templates-list', label: t('navigation.proceduresSubmenu.templates') },
      ]
    },
    { 
      id: 'support', 
      label: t('navigation.support'), 
      icon: HelpCircle, 
      hasSubmenu: true,
      submenu: [
        { id: 'support-send-message', label: 'Pošljite sporočilo' },
        { id: 'support-tickets', label: t('support.table.ticketId') },
      ]
    },
    { 
      id: 'settings', 
      label: t('navigation.settings'), 
      icon: Settings, 
      hasSubmenu: true,
      submenu: [
        { id: 'settings-basic', label: t('settings.title') },
        { id: 'settings-advanced', label: t('settings.title') + ' - Napredno' },
      ]
    },
    { 
      id: 'soc', 
      label: 'SOC', 
      icon: Shield, 
      hasSubmenu: false, 
      submenu: [] 
    },
    { id: 'misp', label: 'MISP', icon: AlertTriangle, hasSubmenu: false, submenu: [] },
  ]
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handlePageChange = (page: string) => {
    console.log('🧭 Sidebar: handlePageChange called with page:', page)
    console.log('🧭 Sidebar: onPageChange function:', typeof onPageChange)
    onPageChange(page)
    // Zapri meni na mobilnih napravah po izbiri
    if (isMobile) {
      setIsMenuOpen(false)
    }
  }

  // Preveri velikost zaslona
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Zapri meni ob escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prepreči scroll na ozadju ko je meni odprt
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const SidebarContent = ({ isMobileDrawer = false }: { isMobileDrawer?: boolean }) => (
    <div className={`
      flex flex-col h-full bg-bg-pure-black border-border-subtle
      ${isMobileDrawer ? 'w-[280px]' : 'w-[280px]'}
    `}>
      {/* Logo */}
      <div className="h-[64px] flex items-center px-6 border-b border-border-subtle">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id || (item.showOverview && activePage === item.showOverview)
            const isExpanded = expandedItems.includes(item.id)

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    const targetId = item.showOverview || item.id
                    handlePageChange(targetId)
                    if (item.hasSubmenu) {
                      toggleExpand(item.id)
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between h-[44px] px-4 rounded-sm
                    transition-all duration-250 ease-out min-h-[44px]
                    ${isActive 
                      ? 'bg-bg-surface-hover text-text-primary border-l-3 border-l-accent-primary' 
                      : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className={`w-5 h-5 transition-colors duration-150 ${
                        isActive ? 'text-accent-primary' : ''
                      }`} 
                    />
                    <span className="text-body font-medium">{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  )}
                </button>

                {/* Submenu */}
                {item.hasSubmenu && isExpanded && item.submenu && (
                  <ul className="ml-8 mt-1 mb-2 space-y-1">
                    {item.submenu.map((subitem: any) => (
                      <li key={subitem.id}>
                        <button
                          onClick={() => handlePageChange(subitem.id)}
                          className={`
                            w-full text-left px-4 py-2 rounded-sm text-body-sm min-h-[44px]
                            transition-all duration-200
                            ${activePage === subitem.id
                              ? 'bg-bg-surface text-accent-primary font-medium'
                              : 'text-text-tertiary hover:bg-bg-surface hover:text-text-secondary'
                            }
                          `}
                        >
                          {subitem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  // Desktop sidebar (ne prikaže se na mobilnih)
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-0 h-screen w-[280px] bg-bg-pure-black border-r border-border-subtle flex flex-col">
        <SidebarContent />
      </div>
    )
  }

  // Mobile hamburger menu
  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`
          fixed top-4 left-4 z-[60] p-3 rounded-md bg-bg-surface border border-border-subtle
          hover:bg-bg-surface-hover transition-colors duration-200 min-w-[44px] min-h-[44px]
          flex items-center justify-center
        `}
        aria-label="Odpri meni"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-text-primary" />
        )}
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent isMobileDrawer={true} />
      </div>
    </>
  )
}
