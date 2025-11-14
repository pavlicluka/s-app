import { FileText, BookOpen, File } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProceduresPoliciesPageProps {
  onNavigate?: (page: string) => void
}

export default function ProceduresPoliciesPage({ onNavigate }: ProceduresPoliciesPageProps) {
  const { t } = useTranslation()
  
  const categories = [
    {
      id: 'procedures-list',
      title: t('pages.procedures.cards.procedures.title'),
      description: t('pages.procedures.cards.procedures.description'),
      icon: FileText,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'policies-list',
      title: t('pages.procedures.cards.policies.title'),
      description: t('pages.procedures.cards.policies.description'),
      icon: BookOpen,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'templates-list',
      title: t('pages.procedures.cards.templates.title'),
      description: t('pages.procedures.cards.templates.description'),
      icon: File,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('pages.procedures.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('pages.procedures.description')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
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
