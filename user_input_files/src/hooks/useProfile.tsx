import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string
  first_name?: string
  last_name?: string
  display_name?: string
  job_title?: string
  department?: string
  role?: string
  employee_id?: string
  manager_id?: string
  phone?: string
  mobile?: string
  work_location?: string
  timezone?: string
  is_active: boolean
  last_login?: string
  password_changed_at?: string
  two_factor_enabled: boolean
  language?: string
  email_notifications?: boolean
  sms_notifications?: boolean
  dashboard_theme?: string
  security_clearance?: string
  training_completion_required?: boolean
  last_security_training?: string
  avatar_url?: string
  profile_image_url?: string
  certifications?: string
  skills?: string
  areas_of_responsibility?: string
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated'
  welcome_completed: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  last_seen?: string
  notes?: string
  organization_id?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'suspended' | 'cancelled' | 'trialing'
  max_users: number
  max_records: number
  billing_email?: string
  billing_address?: any
  vat_number?: string
  settings?: any
  branding?: any
  trial_ends_at?: string
  subscription_started_at?: string
  subscription_ends_at?: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions?: any
  status: 'active' | 'invited' | 'suspended' | 'pending'
  invited_by?: string
  invitation_accepted_at?: string
  created_at: string
  updated_at: string
}

interface ProfileContextType {
  profile: Profile | null
  currentOrganization: Organization | null
  currentOrgId: string | null
  currentMember: OrganizationMember | null
  loading: boolean
  loadingOrg: boolean
  error: string | null
  organizationError: string | null
  refreshProfile: () => Promise<void>
  refreshOrganization: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isOwner: () => boolean
  isAdmin: () => boolean
  isMember: () => boolean
  isViewer: () => boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [currentMember, setCurrentMember] = useState<OrganizationMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOrg, setLoadingOrg] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationError, setOrganizationError] = useState<string | null>(null)

  // Get current organization ID from profile or member data
  const currentOrgId = profile?.organization_id || null

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch user profile with organization context
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile exists, create a basic one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              status: 'active',
              is_active: true,
              language: 'sl',
              dashboard_theme: 'dark'
            })
            .select()
            .single()

          if (createError) throw createError
          setProfile(newProfile)
        } else {
          throw profileError
        }
      } else {
        setProfile(data)
      }

      // Fetch organization membership if user has organization_id
      if (data?.organization_id) {
        await refreshOrganization()
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const refreshOrganization = async () => {
    if (!currentOrgId || !user) {
      setCurrentOrganization(null)
      setCurrentMember(null)
      setLoadingOrg(false)
      return
    }

    setLoadingOrg(true)
    setOrganizationError(null)

    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrgId)
        .single()

      if (orgError) {
        throw orgError
      }

      setCurrentOrganization(orgData)

      // Use profile role instead of organization_members table
      if (profile) {
        setCurrentMember({
          id: profile.id,
          organization_id: currentOrgId,
          user_id: user.id,
          role: profile.role as 'owner' | 'admin' | 'member' | 'viewer' || 'member',
          permissions: {},
          status: 'active',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        })
      } else {
        setCurrentMember(null)
      }
    } catch (error: any) {
      console.error('Error fetching organization:', error)
      setOrganizationError(error.message || 'Failed to fetch organization')
    } finally {
      setLoadingOrg(false)
    }
  }

  // Load profile on mount and when user changes
  useEffect(() => {
    refreshProfile()
  }, [user])

  // Update organization when profile changes
  useEffect(() => {
    if (currentOrgId && profile) {
      refreshOrganization()
    }
  }, [currentOrgId, profile])

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!currentMember) return false
    
    const permissions = currentMember.permissions || {}
    return Boolean(permissions[permission])
  }

  const isOwner = (): boolean => {
    return currentMember?.role === 'owner'
  }

  const isAdmin = (): boolean => {
    return currentMember?.role === 'owner' || currentMember?.role === 'admin'
  }

  const isMember = (): boolean => {
    return ['owner', 'admin', 'member'].includes(currentMember?.role || '')
  }

  const isViewer = (): boolean => {
    return ['owner', 'admin', 'member', 'viewer'].includes(currentMember?.role || '')
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        currentOrganization,
        currentOrgId,
        currentMember,
        loading,
        loadingOrg,
        error,
        organizationError,
        refreshProfile,
        refreshOrganization,
        hasPermission,
        isOwner,
        isAdmin,
        isMember,
        isViewer
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

// Note: Keep only hook exports and context provider in this file
// to comply with React Fast Refresh requirements