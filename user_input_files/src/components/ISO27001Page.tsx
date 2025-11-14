import { 
  FileCheck, 
  FileSearch, 
  AlertTriangle, 
  Shield, 
  Settings, 
  Award, 
  Package, 
  Bell, 
  CheckCircle, 
  ClipboardList,
  Target,
  UserCog
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ISO27001PageProps {
  onNavigate?: (page: string) => void
}

export default function ISO27001Page({ onNavigate }: ISO27001PageProps) {
  const { t } = useTranslation()
  
  const isoCategories = [
    {
      id: 'iso-scope',
      title: t('pages.iso27001.cards.scope.title'),
      description: t('pages.iso27001.cards.scope.description'),
      icon: Target,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30'
    },
    {
      id: 'iso-information-security-policy',
      title: t('pages.iso27001.cards.informationSecurityPolicy.title'),
      description: t('pages.iso27001.cards.informationSecurityPolicy.description'),
      icon: Shield,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'iso-audit',
      title: t('pages.iso27001.cards.audit.title'),
      description: t('pages.iso27001.cards.audit.description'),
      icon: FileSearch,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'iso-risk',
      title: t('pages.iso27001.cards.risk.title'),
      description: t('pages.iso27001.cards.risk.description'),
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },

    {
      id: 'iso-controls',
      title: t('pages.iso27001.cards.controls.title'),
      description: t('pages.iso27001.cards.controls.description'),
      icon: Settings,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'iso-vloge-odgovornosti',
      title: t('pages.iso27001.cards.rolesAndResponsibilities.title'),
      description: t('pages.iso27001.cards.rolesAndResponsibilities.description'),
      icon: UserCog,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30'
    },
    {
      id: 'iso-certification',
      title: t('pages.iso27001.cards.certification.title'),
      description: t('pages.iso27001.cards.certification.description'),
      icon: Award,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'iso-assets',
      title: t('pages.iso27001.cards.assets.title'),
      description: t('pages.iso27001.cards.assets.description'),
      icon: Package,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'iso-incident',
      title: t('pages.iso27001.cards.incident.title'),
      description: t('pages.iso27001.cards.incident.description'),
      icon: Bell,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'iso-compliance',
      title: t('pages.iso27001.cards.compliance.title'),
      description: t('pages.iso27001.cards.compliance.description'),
      icon: CheckCircle,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    },
    {
      id: 'iso-soa',
      title: t('pages.iso27001.cards.soa.title'),
      description: t('pages.iso27001.cards.soa.description'),
      icon: ClipboardList,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('pages.iso27001.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('pages.iso27001.description')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isoCategories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => onNavigate?.(category.id)}
              className="bg-bg-surface p-6 rounded-lg border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 text-left group hover:bg-bg-surface-hover"
            >
              <div className={`w-12 h-12 rounded-lg ${category.bgColor} border ${category.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${category.iconColor}`} />
              </div>
              <h3 className="text-heading-md font-semibold text-text-primary mb-2">
                {category.title}
              </h3>
              <p className="text-body-sm text-text-secondary">
                {category.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
