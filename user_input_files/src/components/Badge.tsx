import { useTranslation } from 'react-i18next'

interface BadgeProps {
  type: 'status' | 'risk' | 'priority' | 'role'
  value: string
  className?: string
}

export default function Badge({ type, value, className = '' }: BadgeProps) {
  const { t } = useTranslation()
  const getDisplayValue = () => {
    if (type === 'risk') {
      // Uporabi i18n prevode za tveganja
      return t(`dashboard.${value.toLowerCase()}`)
    }
    if (type === 'status') {
      // Uporabi i18n prevode za status - najprej normaliziraj vrednost
      const normalizedValue = value.toLowerCase().replace(/ /g, '_').replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z')
      
      // Poskusi najti prevod
      const translation = t(`dashboard.status.${normalizedValue}`)
      
      // Če je prevod enak ključu (pomeni da prevod ne obstaja), poskusi druge variacije
      if (translation === `dashboard.status.${normalizedValue}`) {
        // Poskusi z original vrednostjo
        const altTranslation = t(`dashboard.status.${value.toLowerCase()}`)
        if (altTranslation !== `dashboard.status.${value.toLowerCase()}`) {
          return altTranslation
        }
        
        // Poskusi z različico z presledki
        const spaceTranslation = t(`dashboard.status.${value.toLowerCase().replace(/_/g, ' ')}`)
        if (spaceTranslation !== `dashboard.status.${value.toLowerCase().replace(/_/g, ' ')}`) {
          return spaceTranslation
        }
        
        // Če noben prevod ne obstaja, vrni original vrednost
        return value
      }
      
      return translation
    }
    return value
  }

  const getStyles = () => {
    switch (type) {
      case 'risk':
        switch (value.toLowerCase()) {
          case 'critical':
          case 'visoka':
            return 'text-red-500 bg-red-500/10'
          case 'high':
            return 'text-red-500 bg-red-500/10'
          case 'medium':
          case 'srednja':
            return 'text-yellow-500 bg-yellow-500/10'
          case 'low':
          case 'nizka':
            return 'text-green-500 bg-green-500/10'
          default:
            return 'bg-bg-surface-hover text-text-secondary'
        }
      
      case 'priority':
        switch (value.toLowerCase()) {
          case 'visoka':
            return 'bg-risk-high/15 text-risk-high border border-risk-high/30'
          case 'normalna':
            return 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
          case 'nizka':
            return 'bg-risk-low/15 text-risk-low border border-risk-low/30'
          default:
            return 'bg-bg-surface-hover text-text-secondary border border-border-subtle'
        }
      
      case 'role':
        switch (value.toLowerCase()) {
          case 'owner':
            return 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
          case 'admin':
            return 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
          case 'member':
            return 'bg-green-900/50 text-green-400 border border-green-500/30'
          case 'viewer':
            return 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
          default:
            return 'bg-bg-surface-hover text-text-secondary border border-border-subtle'
        }
      
      case 'status':
        switch (value.toLowerCase()) {
          case 'odprt':
          case 'open':
          case 'in progress':
          case 'investigating':
          case 'v obdelavi':
          case 'v teku':
            return 'text-red-500 bg-red-500/10'
          case 'zaprt':
          case 'resolved':
          case 'closed':
            return 'text-green-500 bg-green-500/10'
          case 'mitigated':
          case 'odpravljeno':
            return 'text-green-500 bg-green-500/10'
          default:
            return 'text-text-secondary bg-bg-surface-hover'
        }
      
      default:
        return 'bg-bg-surface-hover text-text-secondary'
    }
  }

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full
      text-caption font-medium uppercase tracking-wider
      ${getStyles()} ${className}
    `}>
      {getDisplayValue()}
    </span>
  )
}
