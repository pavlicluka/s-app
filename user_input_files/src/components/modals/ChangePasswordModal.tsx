import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Lock, X, Eye, EyeOff } from 'lucide-react'
import { logAuditAction, AuditActionTypes } from '../../lib/auditLog'

interface ChangePasswordModalProps {
  onClose: () => void
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  function validateForm(): boolean {
    const newErrors: typeof errors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Trenutno geslo je obvezno'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Novo geslo je obvezno'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Geslo mora vsebovati vsaj 8 znakov'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potrditev gesla je obvezna'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Gesli se ne ujemata'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setMessage(null)

    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('Uporabnik ni prijavljen')
      }

      // Test current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword
      })

      if (signInError) {
        setErrors({ currentPassword: 'Trenutno geslo je napačno' })
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) throw updateError

      // Log audit action
      await logAuditAction({
        action_type: AuditActionTypes.PASSWORD_CHANGE,
        action_description: 'Uporabnik je spremenil svoje geslo'
      })

      setMessage({ type: 'success', text: 'Geslo je bilo uspešno spremenjeno' })
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error('Napaka pri spreminjanju gesla:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Napaka pri spreminjanju gesla'
      })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-bg-surface border border-border-subtle rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <Lock className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-heading-md font-semibold text-text-primary">Spremeni geslo</h2>
              <p className="text-body-sm text-text-secondary">Posodobite svoje geslo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-status-success/10 border-status-success/30 text-status-success'
              : 'bg-status-error/10 border-status-error/30 text-status-error'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-body-sm font-medium text-text-primary mb-2">
              Trenutno geslo
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-10 bg-bg-near-black border rounded-lg text-text-primary
                         focus:outline-none transition-colors ${
                           errors.currentPassword 
                             ? 'border-status-error focus:border-status-error' 
                             : 'border-border-subtle focus:border-accent-primary'
                         }`}
                placeholder="Vnesite trenutno geslo"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-body-xs text-status-error mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-body-sm font-medium text-text-primary mb-2">
              Novo geslo
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-10 bg-bg-near-black border rounded-lg text-text-primary
                         focus:outline-none transition-colors ${
                           errors.newPassword 
                             ? 'border-status-error focus:border-status-error' 
                             : 'border-border-subtle focus:border-accent-primary'
                         }`}
                placeholder="Vnesite novo geslo (min. 8 znakov)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-body-xs text-status-error mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-body-sm font-medium text-text-primary mb-2">
              Potrdi novo geslo
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-10 bg-bg-near-black border rounded-lg text-text-primary
                         focus:outline-none transition-colors ${
                           errors.confirmPassword 
                             ? 'border-status-error focus:border-status-error' 
                             : 'border-border-subtle focus:border-accent-primary'
                         }`}
                placeholder="Ponovno vnesite novo geslo"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-body-xs text-status-error mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border-subtle rounded-lg text-text-primary font-medium
                       hover:bg-bg-surface-hover transition-colors"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-accent-primary text-white rounded-lg font-medium
                       hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Shranjujem...</span>
                </>
              ) : (
                'Spremeni geslo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
