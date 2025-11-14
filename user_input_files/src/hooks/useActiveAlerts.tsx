import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Interfaces
interface Prijava {
  id: string
  stevilo_prijave: string
  kratek_opis: string
  podrocje: string
  status: string
  datum_potrditev?: string
  datum_resitve?: string
  created_at: string
  updated_at: string
}

interface GDPRZahtevek {
  id: string
  request_id: string
  subject_name: string
  subject_email: string
  request_date: string
  request_type: string
  status: string
  response_deadline: string
  legal_basis_description: string
  data_categories: string[]
  data_description: string
  created_at: string
  updated_at: string
}

export function useActiveAlerts() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<any[]>([])
  const [prijave, setPrijave] = useState<Prijava[]>([])
  const [gdprZahtevki, setGdprZahtevki] = useState<GDPRZahtevek[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Demo data za stari NIS 2 incidenti
  const demoStariIncidenti = [
    {
      id: '1',
      incident_id: 'INC-2024-001',
      type: 'Ransomware napad',
      detected_at: '2024-11-01T10:30:00Z',
      description: 'Ransomware je prizadel datotečni strežnik',
      estimated_damage: 'Visoko',
      status: 'investigating',
      organization_id: 'demo-org',
      created_at: '2024-11-01T10:30:00Z',
      updated_at: '2024-11-01T10:30:00Z'
    },
    {
      id: '2',
      incident_id: 'INC-2024-002',
      type: 'Phishing e-pošta',
      detected_at: '2024-11-02T14:20:00Z',
      description: 'Zaposleni je prejel sumljivo e-poštno sporočilo',
      estimated_damage: 'Srednje',
      status: 'active',
      organization_id: 'demo-org',
      created_at: '2024-11-02T14:20:00Z',
      updated_at: '2024-11-02T14:20:00Z'
    }
  ]

  // Demo data za ZZPri prijave
  const demoPrijave = [
    {
      id: '1',
      stevilo_prijave: 'ZZPri-2024-001',
      kratek_opis: 'Sum korupcije v javnem naročanju',
      podrocje: 'korupcija',
      status: 'prejeta',
      datum_potrditev: '2024-11-20T10:00:00Z',
      datum_resitve: '2024-12-01T10:00:00Z',
      created_at: '2024-11-01T10:30:00Z',
      updated_at: '2024-11-01T10:30:00Z'
    },
    {
      id: '2',
      stevilo_prijave: 'ZZPri-2024-002',
      kratek_opis: 'Nepravilnosti pri javni upravi',
      podrocje: 'nepravilnosti',
      status: 'prejeta',
      datum_potrditev: '2024-11-25T10:00:00Z',
      datum_resitve: '2024-12-05T10:00:00Z',
      created_at: '2024-11-02T14:20:00Z',
      updated_at: '2024-11-02T14:20:00Z'
    }
  ]

  // Demo data za GDPR zahtevke
  const demoGdprZahtevki = [
    {
      id: '1',
      request_id: 'GDPR-2024-001',
      subject_name: 'Janez Novak',
      subject_email: 'janez.novak@example.com',
      request_date: '2024-10-20T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'received',
      response_deadline: '2024-10-25T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['contact_information', 'purchase_history'],
      data_description: 'Kontaktni podatki in zgodovina nakupov',
      created_at: '2024-10-20T10:00:00Z',
      updated_at: '2024-10-20T10:00:00Z'
    },
    {
      id: '2',
      request_id: 'GDPR-2024-002',
      subject_name: 'Ana Kovač',
      subject_email: 'ana.kovac@example.com',
      request_date: '2024-10-15T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'processing',
      response_deadline: '2024-10-20T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['personal_profile'],
      data_description: 'Osebni profil in nastavitve',
      created_at: '2024-10-15T10:00:00Z',
      updated_at: '2024-10-15T10:00:00Z'
    },
    {
      id: '3',
      request_id: 'GDPR-2024-003',
      subject_name: 'Marko Pretnar',
      subject_email: 'marko.pretnar@example.com',
      request_date: '2024-10-10T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'received',
      response_deadline: '2024-10-15T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['contact_information'],
      data_description: 'Kontaktni podatki',
      created_at: '2024-10-10T10:00:00Z',
      updated_at: '2024-10-10T10:00:00Z'
    }
  ]

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setUserProfile({ organization_id: null })
      }
    }

    fetchUserProfile()
  }, [user])

  // Load data function - preverja podatke iz Supabase ali uporabi demo podatke
  async function loadAlertsData() {
    if (!userProfile?.organization_id) {
      // Uporabi demo podatke
      setIncidents(demoStariIncidenti)
      setPrijave(demoPrijave)
      setGdprZahtevki(demoGdprZahtevki)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load vsi podatki paralelno
      const [incidentsData, prijaveData, gdprData] = await Promise.all([
        supabase.from('incidents').select('*').eq('organization_id', userProfile.organization_id).order('detected_at', { ascending: false }),
        supabase.from('prijave').select('*').eq('organization_id', userProfile.organization_id).order('created_at', { ascending: false }),
        supabase.from('gdpr_right_forgotten').select('*').eq('organization_id', userProfile.organization_id).order('request_date', { ascending: false })
      ])

      setIncidents(incidentsData.data || [])
      setPrijave(prijaveData.data || [])
      setGdprZahtevki(gdprData.data || [])
    } catch (error) {
      console.error('Error loading alerts data:', error)
      // Če je napaka, uporabi demo podatke
      setIncidents(demoStariIncidenti)
      setPrijave(demoPrijave)
      setGdprZahtevki(demoGdprZahtevki)
    } finally {
      setLoading(false)
    }
  }

  // Setup real-time subscriptions and load data when user profile changes
  useEffect(() => {
    if (!userProfile?.organization_id) {
      setLoading(false)
      return
    }

    // Initial data load
    loadAlertsData()

    // Setup real-time subscriptions for automatic updates
    const incidentsSubscription = supabase
      .channel(`incidents:organization_id=eq.${userProfile.organization_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
          filter: `organization_id=eq.${userProfile.organization_id}`
        },
        () => {
          console.log('Incidents changed - refreshing alerts')
          loadAlertsData()
        }
      )
      .subscribe()

    const prijaveSubscription = supabase
      .channel(`prijave:organization_id=eq.${userProfile.organization_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prijave',
          filter: `organization_id=eq.${userProfile.organization_id}`
        },
        () => {
          console.log('Prijave changed - refreshing alerts')
          loadAlertsData()
        }
      )
      .subscribe()

    const gdprSubscription = supabase
      .channel(`gdpr_right_forgotten:organization_id=eq.${userProfile.organization_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gdpr_right_forgotten',
          filter: `organization_id=eq.${userProfile.organization_id}`
        },
        () => {
          console.log('GDPR zahtevki changed - refreshing alerts')
          loadAlertsData()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(incidentsSubscription)
      supabase.removeChannel(prijaveSubscription)
      supabase.removeChannel(gdprSubscription)
    }
  }, [userProfile])

  // Utility functions
  function getDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function getDaysSinceDetection(detectedAt: string): number {
    const detectedDate = new Date(detectedAt)
    const now = new Date()
    const diffTime = now.getTime() - detectedDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // Computed values - enaka logika kot v AlertsPage.tsx
  const stariIncidenti = incidents.filter(incident => {
    const daysSinceDetection = getDaysSinceDetection(incident.detected_at)
    const isOldIncident = daysSinceDetection > 1
    const isNotResolved = incident.status !== 'resolved'
    return isOldIncident && isNotResolved
  })

  const kratkiRokiPrijave = prijave.filter(prijava => {
    let hasShortDeadline = false

    // Preveri rok potrditve
    if (prijava.datum_potrditev) {
      const daysToConfirmation = getDaysUntilDeadline(prijava.datum_potrditev)
      if (daysToConfirmation >= 0 && daysToConfirmation < 3) {
        hasShortDeadline = true
      }
    }

    // Preveri rok rešitve
    if (prijava.datum_resitve) {
      const daysToResolution = getDaysUntilDeadline(prijava.datum_resitve)
      if (daysToResolution >= 0 && daysToResolution < 3) {
        hasShortDeadline = true
      }
    }

    // Preveri, da ni rešena
    const isNotResolved = prijava.status !== 'rešena'
    return hasShortDeadline && isNotResolved
  })

  const potekliGdprZahtevki = gdprZahtevki.filter(zahtevek => {
    // Preveri, da ni completed/executed
    if (zahtevek.status === 'completed' || zahtevek.status === 'executed') {
      return false
    }

    // Preveri, da je rok potekel
    if (zahtevek.response_deadline) {
      const daysToDeadline = getDaysUntilDeadline(zahtevek.response_deadline)
      return daysToDeadline < 0 // Pozitivno, če je rok potekel
    }

    return false
  })

  // Skupno število aktivnih opozoril
  const totalActiveAlerts = stariIncidenti.length + kratkiRokiPrijave.length + potekliGdprZahtevki.length

  // Bool vrednost - ali obstajajo aktivna opozorila
  const hasActiveAlerts = totalActiveAlerts > 0

  // Sporočila
  const noAlertsMessage = "Trenutno ni aktivnih opozoril"
  const activeAlertsMessage = "POZOR! Obstajajo opozorila - oglejte si jih!"

  return {
    // Data
    incidents,
    prijave,
    gdprZahtevki,
    loading,
    
    // Filtered data
    stariIncidenti,
    kratkiRokiPrijave,
    potekliGdprZahtevki,
    
    // Results
    hasActiveAlerts,
    totalActiveAlerts,
    noAlertsMessage,
    activeAlertsMessage,
    
    // Functions
    refreshData: loadAlertsData
  }
}