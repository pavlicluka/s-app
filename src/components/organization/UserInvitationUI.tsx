import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../common/Modal'

interface UserInvitationUIProps {
  setCurrentPage: (page: string) => void
}

interface InvitationMember {
  id: string
  email: string
  role: string
  status: string
  message: string
  department: string | null
  job_title: string | null
  created_at: string
  invited_by_profile: {
    full_name: string | null
    email: string
  } | null
}

interface PendingInvitation {
  id: string
  email: string
  role: string
  status: string
  message: string | null
  created_at: string
  expires_at: string
  invited_by_profile: {
    full_name: string | null
    email: string
  } | null
}

const ROLES = [
  { value: 'member', label: 'Member', description: 'Can access organization data and tools' },
  { value: 'admin', label: 'Admin', description: 'Can manage organization settings and users' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to organization data' }
]

const COMMON_DEPARTMENTS = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Legal',
  'Operations',
  'Marketing',
  'Sales',
  'Research & Development',
  'Compliance',
  'Other'
]

export default function UserInvitationUI({ setCurrentPage }: UserInvitationUIProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId, userProfile } = useOrganization()
  
  // Form state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Data state
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [recentInvitations, setRecentInvitations] = useState<InvitationMember[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  const isOwner = userProfile?.role === 'owner'
  const isAdmin = ['owner', 'admin'].includes(userProfile?.role || '')

  // Check permissions
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary">
          {t('organization.noPermission')}
        </div>
      </div>
    )
  }

  const loadInvitations = async () => {
    if (!organizationId) return

    try {
      // Load pending invitations
      const { data: pendingData } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          email,
          role,
          status,
          message,
          created_at,
          expires_at,
          invited_by_profile:profiles!organization_invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      // Load recent invitation history
      const { data: historyData } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          email,
          role,
          status,
          message,
          department,
          job_title,
          created_at,
          invited_by_profile:profiles!organization_invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .in('status', ['accepted', 'declined', 'expired'])
        .order('created_at', { ascending: false })
        .limit(10)

      setPendingInvitations(pendingData as unknown as PendingInvitation[] || [])
      setRecentInvitations(historyData as unknown as InvitationMember[] || [])
    } catch (err: any) {
      console.error('Error loading invitations:', err)
      setError(err.message)
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organizationId || !user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No valid session found')
      }

      // Get Supabase URL from environment with fallback
      const supabaseUrl = (window as any).__ENV__?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/send-organization-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization_id: organizationId,
          email: email.trim(),
          role,
          message: message.trim(),
          department: department.trim() || null,
          job_title: jobTitle.trim() || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send invitation')
      }

      setSuccess(t('organization.invitationSent'))
      
      // Reset form
      setEmail('')
      setRole('member')
      setMessage('')
      setDepartment('')
      setJobTitle('')
      
      // Reload invitations
      await loadInvitations()
      
    } catch (err: any) {
      console.error('Error sending invitation:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    if (!organizationId || !user) return

    try {
      // Implement resend logic
      alert('Resend invitation feature coming soon!')
    } catch (err: any) {
      console.error('Error resending invitation:', err)
      setError(err.message)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!organizationId || !user) return

    try {
      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)

      if (error) throw error

      await loadInvitations()
      setSuccess(t('organization.invitationCancelled'))
    } catch (err: any) {
      console.error('Error cancelling invitation:', err)
      setError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('organization.inviteUsers')}
          </h1>
          <p className="text-body-lg text-text-secondary mt-1">
            {t('organization.inviteUsersDescription')}
          </p>
        </div>
        
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white"
        >
          {t('organization.inviteUser')}
        </button>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h2 className="text-h3 text-text-primary mb-6">{t('organization.pendingInvitations')}</h2>
          
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 bg-bg-near-black rounded">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {invitation.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-body-lg text-text-primary">{invitation.email}</div>
                    <div className="text-sm text-text-secondary">
                      {t('organization.role')}: {invitation.role} • {' '}
                      {t('organization.invitedBy')}: {invitation.invited_by_profile.full_name || invitation.invited_by_profile.email} • {' '}
                      {t('organization.expiresIn')}: {Math.ceil((new Date(invitation.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResendInvitation(invitation.id)}
                    className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                  >
                    {t('organization.resend')}
                  </button>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    {t('organization.cancel')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invitations */}
      {recentInvitations.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h2 className="text-h3 text-text-primary mb-6">{t('organization.recentInvitations')}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('common.email')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('organization.role')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('organization.department')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('common.status')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('common.date')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    {t('organization.invitedBy')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInvitations.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-border-subtle hover:bg-bg-near-black">
                    <td className="py-3 px-4 text-text-primary">{invitation.email}</td>
                    <td className="py-3 px-4 text-text-primary">{invitation.role}</td>
                    <td className="py-3 px-4 text-text-primary">{invitation.department || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invitation.status === 'accepted' ? 'bg-green-900/50 text-green-400' :
                        invitation.status === 'declined' ? 'bg-red-900/50 text-red-400' :
                        'bg-gray-900/50 text-gray-400'
                      }`}>
                        {invitation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(invitation.created_at).toLocaleDateString('sl-SI')}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {invitation.invited_by_profile.full_name || invitation.invited_by_profile.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Invite Form */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h2 className="text-h3 text-text-primary mb-6">{t('organization.quickInvite')}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded text-green-400">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSendInvitation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('common.email')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.role')} *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                required
              >
                {ROLES.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.department')}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="">{t('organization.selectDepartment')}</option>
                {COMMON_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.jobTitle')}
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="e.g., Software Developer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.message')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              placeholder={t('organization.messagePlaceholder')}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !email || !role}
              className="bg-accent-primary hover:bg-accent-primary/80 px-6 py-2 rounded transition-colors text-white disabled:opacity-50"
            >
              {loading ? t('common.sending') : t('organization.sendInvitation')}
            </button>
          </div>
        </form>
      </div>

      {/* Role Descriptions */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h2 className="text-h3 text-text-primary mb-6">{t('organization.roleDescriptions')}</h2>
        
        <div className="space-y-4">
          {ROLES.map((roleOption) => (
            <div key={roleOption.value} className="flex items-start space-x-4 p-4 bg-bg-near-black rounded">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {roleOption.label[0]}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {roleOption.label}
                </h3>
                <p className="text-text-secondary">
                  {roleOption.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={t('organization.inviteUser')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('common.email')} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.role')} *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            >
              {ROLES.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-text-secondary mt-1">
              {ROLES.find(r => r.value === role)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.message')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              placeholder={t('organization.messagePlaceholder')}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSendInvitation}
              disabled={loading || !email || !role}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white disabled:opacity-50"
            >
              {loading ? t('common.sending') : t('organization.sendInvitation')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
