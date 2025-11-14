import { useTranslation } from 'react-i18next'
import { Monitor, Package, Key, FileText } from 'lucide-react'
import InventoryExpiringItems from './other/InventoryExpiringItems'

interface InventoryPageProps {
  onNavigate?: (page: string) => void
}

export default function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { t } = useTranslation()
  
  const inventoryCategories = [
    {
      id: 'inventory-devices',
      title: t('pages.inventory.cards.devices.title'),
      description: t('pages.inventory.cards.devices.description'),
      icon: Monitor,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'inventory-software',
      title: t('pages.inventory.cards.software.title'),
      description: t('pages.inventory.cards.software.description'),
      icon: Package,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'inventory-licenses',
      title: t('pages.inventory.cards.licenses.title'),
      description: t('pages.inventory.cards.licenses.description'),
      icon: Key,
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
            {t('pages.inventory.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('pages.inventory.description')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Package className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryCategories.map((category) => {
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

      {/* Expiring Items Section */}
      <div className="mt-8">
        <InventoryExpiringItems />
      </div>
    </div>
  )
}
