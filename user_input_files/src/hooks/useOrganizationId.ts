import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function useOrganizationId() {
  const { user } = useAuth()
  const [organizationId, setOrganizationId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizationId = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setOrganizationId(data?.organization_id || '')
      } catch (error) {
        console.error('Error fetching organization_id:', error)
        setOrganizationId('')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationId()
  }, [user])

  return { organizationId, loading }
}
