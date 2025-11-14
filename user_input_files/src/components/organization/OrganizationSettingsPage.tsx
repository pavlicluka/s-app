import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../common/Modal'
import Badge from '../Badge'

interface OrganizationSettingsPageProps {
  setCurrentPage: (page: string) => void
}

interface Organization {
  id: string
  name: string
  description: string | null
  billing_email: string | null
  plan: string
  status: string
  created_at: string
  logo_url: string | null
}

interface Subscription {
  id: string
  plan_name: string
  status: string
  current_period_start: string
  current_period_end: string
  amount: number
  currency: string
}

interface OrganizationMember {
  id: string
  role: string
  full_name: string | null
  email: string
  created_at: string
  updated_at: string
}

export default function OrganizationSettingsPage({ setCurrentPage }: OrganizationSettingsPageProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId, userProfile } = useOrganization()
  
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Partial<Organization>>({})

  const isOwner = userProfile?.role === 'owner'
  const isAdmin = ['owner', 'admin'].includes(userProfile?.role || '')

  useEffect(() => {
    if (organizationId) {
      loadOrganizationData()
    }
  }, [organizationId])

  async function loadOrganizationData() {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    try {
      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (orgError) throw orgError

      // Load subscription data (mock for now, integrate with actual billing service)
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .single()

      // Load organization members - fixed to use profiles table
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at, updated_at')
        .eq('organization_id', organizationId)

      if (membersError) throw membersError

      setOrganization(orgData)
      setSubscription(subData || null)
      setMembers((membersData as any) || [])
    } catch (err: any) {
      console.error('Error loading organization data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveOrganization() {
    if (!organizationId || !editingOrganization) return

    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrganization.name,
          description: editingOrganization.description,
          billing_email: editingOrganization.billing_email,
          logo_url: editingOrganization.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)

      if (error) throw error

      await loadOrganizationData()
      setShowEditModal(false)
      setEditingOrganization({})
    } catch (err: any) {
      console.error('Error saving organization:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = () => {
    if (!organization) return
    
    setEditingOrganization({
      name: organization.name,
      description: organization.description,
      billing_email: organization.billing_email,
      logo_url: organization.logo_url
    })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (error && !organization) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{t('common.error')}: {error}</div>
        <button
          onClick={loadOrganizationData}
          className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary">{t('organization.noOrganization')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('organization.settings')}
          </h1>
          <p className="text-body-lg text-text-secondary mt-1">
            {t('organization.settingsDescription')}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={openEditModal}
            className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white"
          >
            {t('common.edit')}
          </button>
        )}
      </div>

      {/* Organization Details */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h2 className="text-h3 text-text-primary mb-6">{t('organization.details')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.name')}
            </label>
            <div className="text-body-lg text-text-primary">{organization.name}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.status')}
            </label>
            <Badge type="status" value={organization.status} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.createdAt')}
            </label>
            <div className="text-body-lg text-text-primary">
              {new Date(organization.created_at).toLocaleDateString('sl-SI')}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.billingEmail')}
            </label>
            <div className="text-body-lg text-text-primary">{organization.billing_email || '-'}</div>
          </div>
          
          {organization.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.description')}
              </label>
              <div className="text-body-lg text-text-primary">{organization.description}</div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription & Billing */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-text-primary">{t('organization.subscription')}</h2>
          
          {isOwner && (
            <button
              onClick={() => setShowBillingModal(true)}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white"
            >
              {t('organization.manageBilling')}
            </button>
          )}
        </div>
        
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.plan')}
              </label>
              <div className="text-body-lg text-text-primary">
                {subscription.plan_name} - {subscription.currency} {subscription.amount}/month
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.status')}
              </label>
              <Badge type="status" value={subscription.status} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('organization.currentPeriod')}
              </label>
              <div className="text-body-lg text-text-primary">
                {new Date(subscription.current_period_start).toLocaleDateString('sl-SI')} - {' '}
                {new Date(subscription.current_period_end).toLocaleDateString('sl-SI')}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-text-secondary">
            {t('organization.noSubscription')}
          </div>
        )}
      </div>

      {/* Organization Members */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h2 className="text-h3 text-text-primary mb-6">{t('organization.members')}</h2>
        
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-bg-near-black rounded">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {(member.full_name || member.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-body-lg text-text-primary">
                    {member.full_name || member.email}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {member.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge type="role" value={member.role} />
              </div>
            </div>
          ))}
        </div>
        
        {members.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            {t('organization.noMembers')}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-h4 text-red-400 mb-4">{t('organization.dangerZone')}</h3>
          <p className="text-body-lg text-text-secondary mb-4">
            {t('organization.dangerZoneDescription')}
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-white">
            {t('organization.deleteOrganization')}
          </button>
        </div>
      )}

      {/* Edit Organization Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('organization.editOrganization')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.name')} *
            </label>
            <input
              type="text"
              value={editingOrganization.name || ''}
              onChange={(e) => setEditingOrganization({ ...editingOrganization, name: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.description')}
            </label>
            <textarea
              value={editingOrganization.description || ''}
              onChange={(e) => setEditingOrganization({ ...editingOrganization, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.billingEmail')}
            </label>
            <input
              type="email"
              value={editingOrganization.billing_email || ''}
              onChange={(e) => setEditingOrganization({ ...editingOrganization, billing_email: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('organization.logoUrl')}
            </label>
            <input
              type="url"
              value={editingOrganization.logo_url || ''}
              onChange={(e) => setEditingOrganization({ ...editingOrganization, logo_url: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={saving}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSaveOrganization}
              disabled={saving || !editingOrganization.name}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white disabled:opacity-50"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Billing Management Modal */}
      <Modal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        title={t('organization.manageBilling')}
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-text-secondary mb-4">
              {t('organization.billingManagementDescription')}
            </p>
            <div className="bg-bg-near-black p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                {subscription?.plan_name || t('organization.noPlan')}
              </h4>
              <p className="text-text-secondary">
                {subscription?.amount && subscription?.currency && (
                  `${subscription.currency} ${subscription.amount}/month`
                )}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBillingModal(false)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {t('common.close')}
            </button>
            <button
              onClick={() => {
                // TODO: Integrate with billing service
                alert('Billing management coming soon!')
              }}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white"
            >
              {t('organization.manageSubscription')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
