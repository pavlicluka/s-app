import { 
  Lock, 
  Database, 
  FileText, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Shield, 
  FileSearch, 
  CheckSquare, 
  Users, 
  FileCheck, 
  GraduationCap 
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GDPRPageProps {
  onNavigate?: (page: string) => void
}

export default function GDPRPage({ onNavigate }: GDPRPageProps) {
  const { t } = useTranslation()
  
  const gdprCategories = [
    {
      id: 'gdpr-data-protection',
      title: t('pages.gdpr.cards.dataProtection.title'),
      description: t('pages.gdpr.cards.dataProtection.description'),
      icon: Database,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'gdpr-privacy-policy',
      title: t('pages.gdpr.cards.privacyPolicy.title'),
      description: t('pages.gdpr.cards.privacyPolicy.description'),
      icon: FileText,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'gdpr-consent',
      title: t('pages.gdpr.cards.consent.title'),
      description: t('pages.gdpr.cards.consent.description'),
      icon: UserCheck,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'gdpr-forgotten',
      title: t('pages.gdpr.cards.forgotten.title'),
      description: t('pages.gdpr.cards.forgotten.description'),
      icon: UserX,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'gdpr-breach',
      title: t('pages.gdpr.cards.breach.title'),
      description: t('pages.gdpr.cards.breach.description'),
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'zvop-2',
      title: t('pages.gdpr.cards.zvop2.title'),
      description: t('pages.gdpr.cards.zvop2.description'),
      icon: Shield,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'gdpr-audit',
      title: t('pages.gdpr.cards.audit.title'),
      description: t('pages.gdpr.cards.audit.description'),
      icon: FileSearch,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'gdpr-dpia',
      title: t('pages.gdpr.cards.dpia.title'),
      description: t('pages.gdpr.cards.dpia.description'),
      icon: CheckSquare,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    },
    {
      id: 'processing-activities',
      title: t('pages.gdpr.cards.processingActivities.title'),
      description: t('pages.gdpr.cards.processingActivities.description'),
      icon: FileCheck,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30'
    },
    {
      id: 'gdpr-usposabljanja',
      title: t('pages.gdpr.cards.usposabljanja.title'),
      description: t('pages.gdpr.cards.usposabljanja.description'),
      icon: GraduationCap,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30'
    },
    {
      id: 'gdpr-controller',
      title: t('pages.gdpr.cards.controller.title'),
      description: t('pages.gdpr.cards.controller.description'),
      icon: Users,
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
            {t('pages.gdpr.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('pages.gdpr.description')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gdprCategories.map((category) => {
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
