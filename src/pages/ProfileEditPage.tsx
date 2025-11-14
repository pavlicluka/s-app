import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { User, Save, Mail, Phone, Building2, ArrowLeft } from 'lucide-react'
import { logAuditAction, AuditActionTypes } from '../lib/auditLog'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  avatar_url: string
}

interface ProfileEditPageProps {
  onNavigate?: (page: string) => void
}

export default function ProfileEditPage({ onNavigate }: ProfileEditPageProps) {
  const { user } = useAuth()
  const { profile, loading: profileLoading, refreshProfile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        company: profile.department || '', // Use department as company
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile, user])

  // Show loading spinner while profile is loading
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      // Update profile data in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          department: profileData.company, // Map company to department
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile data
      await refreshProfile()

      // Log audit action
      await logAuditAction({
        action_type: AuditActionTypes.PROFILE_EDIT,
        action_description: 'Uporabnik je posodobil svoj profil'
      })

      setMessage({ type: 'success', text: 'Profil je bil uspešno posodobljen' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Napaka pri shranjevanju profila:', error)
      setMessage({ type: 'error', text: 'Napaka pri shranjevanju profila' })
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: keyof ProfileData, value: string) {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Uredi profil</h1>
          <p className="text-body-sm text-text-secondary mt-1">Posodobite svoje osebne podatke</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-status-success/10 border-status-success/30 text-status-success'
            : 'bg-status-error/10 border-status-error/30 text-status-error'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-subtle">
          <div className="w-20 h-20 rounded-full bg-accent-primary flex items-center justify-center border-2 border-accent-primary">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-body-md font-medium text-text-primary mb-1">Profilna slika</h3>
            <p className="text-body-sm text-text-secondary">Priporočena velikost: 200x200px</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-body-sm font-medium text-text-primary mb-2">
              Ime
            </label>
            <input
              type="text"
              id="first_name"
              value={profileData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className="w-full px-4 py-3 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                       focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="Vnesite svoje ime"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-body-sm font-medium text-text-primary mb-2">
              Priimek
            </label>
            <input
              type="text"
              id="last_name"
              value={profileData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className="w-full px-4 py-3 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                       focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="Vnesite svoj priimek"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-text-primary mb-2">
              E-pošta
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={profileData.email}
                readOnly
                className="w-full px-4 py-3 pl-10 bg-bg-surface border border-border-subtle rounded-lg text-text-secondary
                         cursor-not-allowed"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-body-xs text-text-secondary mt-1">E-poštni naslov ni mogoče spremeniti</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-body-sm font-medium text-text-primary mb-2">
              Telefon
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                         focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="+386 XX XXX XXX"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-body-sm font-medium text-text-primary mb-2">
              Podjetje/Organizacija
            </label>
            <div className="relative">
              <input
                type="text"
                id="company"
                value={profileData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary
                         focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Vnesite ime podjetja"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg font-medium
                     hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Shranjujem...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Shrani spremembe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
