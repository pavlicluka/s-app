import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, validateSupabaseConfig } from '../lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import { logAuditAction, AuditActionTypes } from '../lib/auditLog'

// Validate Supabase configuration on module load
try {
  validateSupabaseConfig()
} catch (error: any) {
  console.warn('⚠️ Supabase config validation warning (non-critical for now):', error.message)
}

// Retry utility for failed auth operations
async function retryAuthOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on auth errors (invalid tokens, etc.) - only network errors
      const isAuthError = error?.message?.includes('Refresh Token') || 
                         error?.message?.includes('refresh_token_not_found') ||
                         error?.status === 400 ||
                         error?.status === 401
      
      // Only retry on network errors, not auth errors
      if (
        !isAuthError &&
        (error.name === 'AuthRetryableFetchError' || 
         error.message?.includes('Failed to fetch') ||
         error.name === 'NetworkError') &&
        attempt < maxRetries - 1
      ) {
        console.warn(`🔄 Auth operation failed (attempt ${attempt + 1}/${maxRetries}), retrying...`, error.message)
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
      } else {
        throw error
      }
    }
  }
  
  throw lastError
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  // Organization context methods
  switchOrganization: (organizationId: string) => Promise<void>
  getAvailableOrganizations: () => Promise<Array<{id: string, name: string, role: string}>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track if component is still mounted
    let isMounted = true

    // Load user on mount
    async function loadUser() {
      console.log('🔄 AuthContext: loadUser - začenjam nalaganje uporabnika')
      if (!isMounted) {
        console.log('🔴 AuthContext: loadUser - component already unmounted, aborting')
        return
      }
      
      setLoading(true)
      try {
        // First check if there's an active session with retry logic
        const { data: { session }, error: sessionError } = await retryAuthOperation(
          () => supabase.auth.getSession(),
          3,
          1000
        )
        
        if (!isMounted) return

        if (sessionError) {
          // Handle invalid/expired refresh token gracefully
          if (sessionError.message?.includes('Refresh Token') || 
              sessionError.message?.includes('refresh_token_not_found') ||
              sessionError.status === 400) {
            console.log('ℹ️ AuthContext: loadUser - invalid/expired refresh token, clearing session')
            // Clear the invalid session from storage
            await supabase.auth.signOut()
            if (isMounted) setUser(null)
            return
          }
          
          console.warn('⚠️ AuthContext: loadUser - napaka pri pridobivanju seje (pričakovano ob prvi obisku):', sessionError.message)
          if (isMounted) setUser(null)
          return
        }

        if (!session) {
          console.log('ℹ️ AuthContext: loadUser - ni aktivne seje (uporabnik ni prijavljen)')
          if (isMounted) setUser(null)
          return
        }

        if (!isMounted) return

        // If we have a session, get the user with retry logic
        const { data: { user }, error } = await retryAuthOperation(
          () => supabase.auth.getUser(),
          3,
          1000
        )
        
        if (!isMounted) return

        if (error) {
          console.error('❌ AuthContext: loadUser - napaka pri pridobivanju uporabnika:', error.message)
          if (isMounted) setUser(null)
          return
        }

        console.log('📦 AuthContext: loadUser - dobljen uporabnik:', user?.id || 'null')
        if (isMounted) setUser(user || null)
      } catch (err: any) {
        if (!isMounted) return
        
        // Handle refresh token errors that bubble up
        if (err?.message?.includes('Refresh Token') || 
            err?.message?.includes('refresh_token_not_found') ||
            err?.status === 400) {
          console.log('ℹ️ AuthContext: loadUser - caught refresh token error, clearing session')
          // Clear the invalid session
          await supabase.auth.signOut().catch(() => {
            // If signOut fails, manually clear storage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('supabase.auth.token')
            }
          })
          if (isMounted) setUser(null)
        } else {
          console.error('❌ AuthContext: loadUser - nepričakovana napaka:', err)
          if (isMounted) setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          console.log('✅ AuthContext: loadUser - nalaganje končano')
        }
      }
    }
    
    loadUser()

    // Set up auth listener - KEEP SIMPLE, no async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return
        console.log('🔔 AuthContext: onAuthStateChange - event:', event, 'user:', session?.user?.id || 'null')
        setUser(session?.user || null)
      }
    )

    // Cleanup function - ensure all state updates are prevented after unmount
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    console.log('🔐 AuthContext: Poskušam prijavo z email:', email)
    try {
      const { data, error } = await retryAuthOperation(
        () => supabase.auth.signInWithPassword({ email, password }),
        3,
        1000
      )
      
      if (error) {
        console.error('❌ AuthContext: Prijava neuspešna:', error.message)
        // Handle network errors more gracefully
        if (error.name === 'AuthRetryableFetchError' || error.message?.includes('NetworkError')) {
          throw new Error('Napaka pri povezavi. Preverite internetno povezavo in poskusite znova.')
        }
        throw error
      }
      
      console.log('✅ AuthContext: Prijava uspešna, user:', data.user?.id)
      // Explicitly set user state after successful login
      if (data.user) {
        console.log('🔄 AuthContext: Nastavljam user state:', data.user.id)
        setUser(data.user)
      }
      
      // Log audit action
      try {
        await logAuditAction({
          action_type: AuditActionTypes.LOGIN,
          action_description: 'Uporabnik se je prijavil v sistem'
        })
      } catch (auditErr) {
        console.warn('⚠️ AuthContext: Audit log neuspešen (ne prekinemo prijave):', auditErr)
      }
    } catch (err: any) {
      console.error('❌ AuthContext: Podrobna napaka pri prijavi:', err)
      // Provide user-friendly error message for network errors
      if (err.name === 'AuthRetryableFetchError' || err.message?.includes('NetworkError')) {
        throw new Error('Napaka pri povezavi. Preverite internetno povezavo in Supabase konfiguracijo.')
      }
      throw err
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      console.log('📝 AuthContext: Registracija novega uporabnika:', email)
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) {
        console.error('❌ AuthContext: Registracija neuspešna:', error.message)
        throw error
      }
      
      console.log('✅ AuthContext: Registracija uspešna, user:', data.user?.id)
      
      // Create profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: 'user'
          })
          
          if (profileError) {
            console.error('❌ AuthContext: Ustvarjanje profila neuspešno:', profileError.message)
            throw profileError
          }
          
          console.log('✅ AuthContext: Profil uspešno ustvarjen za:', data.user.id)
          setUser(data.user)
        } catch (profileErr: any) {
          console.error('❌ AuthContext: Napaka pri ustvarjanju profila:', profileErr)
          throw profileErr
        }
      }
    } catch (err: any) {
      console.error('❌ AuthContext: Podrobna napaka pri registraciji:', err)
      throw err
    }
  }

  async function signOut() {
    try {
      console.log('🔐 AuthContext: Odjavljivam uporabnika')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ AuthContext: Odjava neuspešna:', error.message)
        throw error
      }
      
      console.log('✅ AuthContext: Odjava uspešna')
      setUser(null)
    } catch (err: any) {
      console.error('❌ AuthContext: Podrobna napaka pri odjavi:', err)
      throw err
    }
  }

  async function switchOrganization(organizationId: string) {
    if (!user) {
      const err = new Error('User not authenticated')
      console.error('❌ AuthContext: Preklop organizacije neuspešen:', err.message)
      throw err
    }

    try {
      console.log('🔄 AuthContext: Preklapljam organizacijo na:', organizationId)
      
      // Update user's organization_id in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: organizationId })
        .eq('id', user.id)

      if (error) {
        console.error('❌ AuthContext: Posodobitev profila neuspešna:', error.message)
        throw error
      }

      console.log('✅ AuthContext: Profil posodobljen na organizacijo:', organizationId)

      // Log the organization switch
      try {
        await logAuditAction({
          action_type: AuditActionTypes.ORGANIZATION_SWITCH,
          action_description: `Uporabnik je preklopil na organizacijo ${organizationId}`
        })
      } catch (auditErr) {
        console.warn('⚠️ AuthContext: Audit log za preklop organizacije neuspešen:', auditErr)
      }

      // Trigger a page reload to refresh all data with new organization context
      console.log('🔄 AuthContext: Ponovno nalagam stran...')
      window.location.reload()
    } catch (error: any) {
      console.error('❌ AuthContext: Podrobna napaka pri prelopu organizacije:', error)
      throw new Error(`Failed to switch organization: ${error.message}`)
    }
  }

  async function getAvailableOrganizations() {
    if (!user) {
      console.warn('⚠️ AuthContext: Počakujem dostopnih organizacij, a uporabnik ni prijavljen')
      return []
    }

    try {
      console.log('🔍 AuthContext: Pridobivam dostopne organizacije za:', user.id)
      
      // Get user's current profile to get organization
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ AuthContext: Napaka pri pridobivanju profila:', profileError.message)
        return []
      }
      
      if (!profileData?.organization_id) {
        console.warn('⚠️ AuthContext: Uporabnik nima dodeljenega organization_id')
        return []
      }

      // Get organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, is_active')
        .eq('id', profileData.organization_id)
        .eq('is_active', true)
        .single()

      if (orgError) {
        console.error('❌ AuthContext: Napaka pri pridobivanju podatkov organizacije:', orgError.message)
        return []
      }

      if (!orgData) {
        console.warn('⚠️ AuthContext: Organizacija ni bila najdena')
        return []
      }
      
      console.log('✅ AuthContext: Organizacija uspešno pridobljena:', orgData.name)
      
      return [{
        id: orgData.id,
        name: orgData.name,
        role: profileData.role || 'user',
        slug: orgData.slug
      }]
    } catch (error: any) {
      console.error('❌ AuthContext: Nepričakovana napaka pri pridobivanju organizacij:', error)
      return []
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      switchOrganization, 
      getAvailableOrganizations 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Note: Keep only components and hooks in this file.
// Export constants and non-component functions in separate file if needed
// to comply with React Fast Refresh requirements