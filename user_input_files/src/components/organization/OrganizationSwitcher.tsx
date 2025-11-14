import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Building2, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'

interface OrganizationSwitcherProps {
  onInviteUser?: () => void
  onManageOrganization?: () => void
  className?: string
}

interface UserOrganization {
  id: string
  name: string
  role: string
  status: string
  logo_url: string | null
  description: string | null
  created_at: string
}

export default function OrganizationSwitcher({ 
  onInviteUser, 
  onManageOrganization, 
  className = '' 
}: OrganizationSwitcherProps) {
  console.log('🔍 OrganizationSwitcher: Component is rendering...')
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId, userProfile } = useOrganization()
  console.log('🔍 OrganizationSwitcher: User:', user?.id, 'OrganizationId:', organizationId, 'UserProfile:', userProfile)
  
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (user) {
      loadUserOrganizations()
    }
  }, [user])

  async function loadUserOrganizations() {
    if (!user) return

    console.log('🔍 OrganizationSwitcher: Starting to load user organizations for user:', user.id)
    setLoading(true)
    setError(null)

    try {
      // Get user's profile with organization data
      console.log('🔍 OrganizationSwitcher: Querying profiles with organizations...')
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          organization_id,
          organizations (
            id,
            name,
            logo_url,
            description,
            created_at,
            is_active
          )
        `)
        .eq('id', user.id)
        .single()

      console.log('🔍 OrganizationSwitcher: Query result - data:', data, 'error:', error)

      if (error) {
        console.error('❌ OrganizationSwitcher: Query error:', error)
        throw error
      }

      console.log('🔍 OrganizationSwitcher: Processing organization data...')
      // If user has organization, add it to the list
      const orgs = data?.organization_id && data.organizations ? [{
        id: (data.organizations as any).id,
        name: (data.organizations as any).name,
        role: data.role,
        status: 'active',
        logo_url: (data.organizations as any).logo_url,
        description: (data.organizations as any).description,
        created_at: (data.organizations as any).created_at
      }] : []

      console.log('✅ OrganizationSwitcher: Successfully processed organizations:', orgs)
      setUserOrganizations(orgs as UserOrganization[])
    } catch (err: any) {
      console.error('❌ OrganizationSwitcher: Error loading user organizations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitchOrganization(orgId: string) {
    if (orgId === organizationId) return

    try {
      // Update the user's current organization in their profile
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: orgId })
        .eq('id', user?.id)

      if (error) throw error

      // Refresh the page to reload with new organization context
      window.location.reload()
    } catch (err: any) {
      console.error('Error switching organization:', err)
      setError(err.message)
    }
  }

  const currentOrganization = userOrganizations.find(org => org.id === organizationId)
  const canInvite = ['owner', 'admin'].includes(userProfile?.role || '')

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-bg-near-black rounded-full"></div>
        </div>
        <div className="w-32 h-6 bg-bg-near-black rounded"></div>
      </div>
    )
  }

  if (error || userOrganizations.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-bg-near-black rounded-full flex items-center justify-center">
          <Building2 className="w-4 h-4 text-text-secondary" />
        </div>
        <div className="text-sm text-text-secondary">
          {error ? t('common.error') : t('organization.noOrganizations')}
        </div>
      </div>
    )
  }

  if (userOrganizations.length === 1) {
    // Single organization - just show the name
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
          {currentOrganization?.logo_url ? (
            <img 
              src={currentOrganization.logo_url} 
              alt={currentOrganization.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {currentOrganization?.name[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="text-body-lg font-medium text-text-primary">
            {currentOrganization?.name}
          </div>
          <div className="text-sm text-text-secondary">
            {t(`organization.roles.${currentOrganization?.role}`)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Organization Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 hover:bg-bg-near-black rounded transition-colors w-full"
      >
        <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center flex-shrink-0">
          {currentOrganization?.logo_url ? (
            <img 
              src={currentOrganization.logo_url} 
              alt={currentOrganization.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {currentOrganization?.name[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-body-lg font-medium text-text-primary truncate">
            {currentOrganization?.name}
          </div>
          <div className="text-sm text-text-secondary">
            {t(`organization.roles.${currentOrganization?.role}`)}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50">
          <div className="py-2">
            {/* Current Organization Indicator */}
            <div className="px-3 py-2 border-b border-border-subtle">
              <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {t('organization.currentOrganization')}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                  {currentOrganization?.logo_url ? (
                    <img 
                      src={currentOrganization.logo_url} 
                      alt={currentOrganization.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs">
                      {currentOrganization?.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {currentOrganization?.name}
                </span>
              </div>
            </div>

            {/* Other Organizations */}
            <div className="py-1">
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  {t('organization.otherOrganizations')}
                </div>
              </div>
              {userOrganizations
                .filter(org => org.id !== organizationId)
                .map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitchOrganization(org.id)}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-bg-near-black transition-colors text-left"
                  >
                    <div className="w-6 h-6 bg-bg-near-black rounded-full flex items-center justify-center flex-shrink-0">
                      {org.logo_url ? (
                        <img 
                          src={org.logo_url} 
                          alt={org.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-text-secondary font-semibold text-xs">
                          {org.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {org.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {t(`organization.roles.${org.role}`)}
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border-subtle py-2">
              {canInvite && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onInviteUser?.()
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-bg-near-black transition-colors text-left"
                >
                  <UserPlus className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">
                    {t('organization.inviteUser')}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsOpen(false)
                  onManageOrganization?.()
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-bg-near-black transition-colors text-left"
              >
                <Building2 className="w-4 h-4 text-text-secondary" />
                <span className="text-sm text-text-primary">
                  {t('organization.manageOrganization')}
                </span>
              </button>
            </div>

            {/* Organization Count */}
            <div className="px-3 py-2 border-t border-border-subtle">
              <div className="text-xs text-text-secondary">
                {userOrganizations.length} {t('organization.organizations')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
