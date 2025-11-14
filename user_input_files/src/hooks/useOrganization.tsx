import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface OrganizationContextType {
  organizationId: string | null
  userProfile: any
  loading: boolean
  error: string | null
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  
  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'

  // Wait for auth to be ready before trying to load organization data
  useEffect(() => {
    console.log('🔍 useOrganization: Checking auth status for user:', user?.id)
    setAuthReady(true) // Auth is ready when this effect runs
  }, [user?.id])

  useEffect(() => {
    console.log('🔍 useOrganization: Starting to fetch user profile for user:', user?.id, 'authReady:', authReady, 'isDemoMode:', isDemoMode)
    
    // In demo mode, provide default organization and skip auth checks
    if (isDemoMode) {
      console.log('🧪 useOrganization: Demo mode detected, providing default organization')
      const demoUserProfile = { 
        id: 'demo-user', 
        organization_id: 'demo-organization',
        full_name: 'Demo User',
        email: 'demo@example.com'
      }
      console.log('🧪 useOrganization: Setting demo userProfile:', demoUserProfile)
      setOrganizationId('demo-organization')
      setUserProfile(demoUserProfile)
      setLoading(false)
      return
    }
    
    if (!user || !authReady) {
      console.log('❌ useOrganization: No user or auth not ready, clearing state')
      setOrganizationId(null)
      setUserProfile(null)
      setLoading(false)
      return
    }

    const fetchUserProfile = async () => {
      try {
        console.log('🔍 useOrganization: Querying profiles with organizations...')
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('profiles')
          .select('*, organizations(*)')
          .eq('id', user.id)
          .single()

        console.log('🔍 useOrganization: Query result - data:', data, 'error:', error)

        if (error) {
          console.error('❌ useOrganization: Query error:', error)
          throw error
        }

        // If profile has organization_id, validate organization is active
        if (data?.organization_id) {
          // Check if the joined organizations object exists and is active
          const org = data.organizations || null
          if (!org || (org && org.is_active === false)) {
            console.warn('⚠️ useOrganization: User organization is missing or inactive. Attempting to find alternative organization...')

            // Try to find other active organizations the user belongs to (without nested join to avoid recursion)
            const { data: userOrgs, error: uoErr } = await supabase
              .from('user_organizations')
              .select('organization_id, role, is_primary')
              .eq('user_id', user.id)
              .order('is_primary', { ascending: false })

            if (uoErr) {
              console.error('❌ useOrganization: Error fetching user_organizations:', uoErr)
              throw uoErr
            }

            console.log('🔍 useOrganization: user_organizations result:', userOrgs)

            // Fetch the organizations separately to avoid infinite recursion in RLS policy
            if (userOrgs && userOrgs.length > 0) {
              const orgIds = userOrgs.map((rel: any) => rel.organization_id)
              const { data: orgs, error: orgsErr } = await supabase
                .from('organizations')
                .select('id, name, is_active, slug')
                .in('id', orgIds)

              if (!orgsErr && orgs) {
                const orgMap = new Map(orgs.map((o: any) => [o.id, o]))
                const activeRel = userOrgs.find((rel: any) => {
                  const org = orgMap.get(rel.organization_id)
                  return org && org.is_active
                })

                if (activeRel) {
                  const newOrgId = activeRel.organization_id
                  console.log('🔄 useOrganization: Auto-switching to active organization:', newOrgId)

                  // Update profile with new organization_id
                  const { error: updateErr } = await supabase
                    .from('profiles')
                    .update({ organization_id: newOrgId })
                    .eq('id', user.id)

                  if (updateErr) {
                    console.error('❌ useOrganization: Failed to update profile organization_id:', updateErr)
                    throw updateErr
                  }

                  // Re-fetch profile with organizations
                  const { data: refreshed, error: refreshedErr } = await supabase
                    .from('profiles')
                    .select('*, organizations(*)')
                    .eq('id', user.id)
                    .single()

                  if (refreshedErr) {
                    console.error('❌ useOrganization: Error fetching refreshed profile:', refreshedErr)
                    throw refreshedErr
                  }

                  setUserProfile(refreshed)
                  setOrganizationId(refreshed.organization_id)
                  setLoading(false)
                  return
                }
              }
            }

            // No active organizations found
            console.error('❌ useOrganization: No active organizations available for user')
            throw new Error('Your default organization has been deleted or is inactive. Please contact your administrator.')
          }
        }

        // If no organization_id at all, try to find first active from user_organizations
        if (!data?.organization_id) {
          console.warn('⚠️ useOrganization: No organization_id found for user. Searching user_organizations...')

          // Query without nested organization join to avoid recursion
          const { data: userOrgs, error: uoErr } = await supabase
            .from('user_organizations')
            .select('organization_id, role, is_primary')
            .eq('user_id', user.id)
            .order('is_primary', { ascending: false })

          if (uoErr) {
            console.error('❌ useOrganization: Error fetching user_organizations:', uoErr)
            throw uoErr
          }

          // Fetch organizations separately
          if (userOrgs && userOrgs.length > 0) {
            const orgIds = userOrgs.map((rel: any) => rel.organization_id)
            const { data: orgs, error: orgsErr } = await supabase
              .from('organizations')
              .select('id, name, is_active, slug')
              .in('id', orgIds)

            if (!orgsErr && orgs) {
              const orgMap = new Map(orgs.map((o: any) => [o.id, o]))
              const activeRel = userOrgs.find((rel: any) => {
                const org = orgMap.get(rel.organization_id)
                return org && org.is_active
              })

              if (activeRel) {
                const chosenOrgId = activeRel.organization_id
                console.log('🔄 useOrganization: Found active organization, updating profile to:', chosenOrgId)

                const { error: updateErr } = await supabase
                  .from('profiles')
                  .update({ organization_id: chosenOrgId })
                  .eq('id', user.id)

                if (updateErr) {
                  console.error('❌ useOrganization: Failed to update profile organization_id:', updateErr)
                  throw updateErr
                }

                const { data: refreshed, error: refreshedErr } = await supabase
                  .from('profiles')
                  .select('*, organizations(*)')
                  .eq('id', user.id)
                  .single()

                if (refreshedErr) {
                  console.error('❌ useOrganization: Error fetching refreshed profile:', refreshedErr)
                  throw refreshedErr
                }

                setUserProfile(refreshed)
                setOrganizationId(refreshed.organization_id)
                setLoading(false)
                return
              }
            }
          }

          console.error('❌ useOrganization: User has no organizations')
          throw new Error('User is not associated with any active organization')
        }

        console.log('✅ useOrganization: Successfully loaded user profile:', data)
        setUserProfile(data)
        setOrganizationId(data.organization_id)
      } catch (err: any) {
        console.error('❌ useOrganization: Error fetching user profile:', err)
        setError(err.message)
        setOrganizationId(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, authReady])

  const value = {
    organizationId,
    userProfile,
    loading,
    error
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
