import { useProfile } from '../../hooks/useProfile'
import { Building2, Users, Shield, Settings } from 'lucide-react'

export default function OrganizationContextExample() {
  const { 
    profile, 
    currentOrganization, 
    currentOrgId, 
    currentMember,
    loading, 
    loadingOrg,
    error,
    organizationError,
    hasPermission,
    isOwner,
    isAdmin,
    isMember,
    isViewer
  } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="text-body-lg font-medium text-text-primary mb-4">Profil uporabnika</h3>
        {error && (
          <div className="mb-4 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-status-error text-body-sm">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-body-sm text-text-secondary">Ime</label>
            <p className="text-text-primary">{profile?.full_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-body-sm text-text-secondary">E-pošta</label>
            <p className="text-text-primary">{profile?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-body-sm text-text-secondary">Vloga</label>
            <p className="text-text-primary">{profile?.role || 'N/A'}</p>
          </div>
          <div>
            <label className="text-body-sm text-text-secondary">Status</label>
            <p className="text-text-primary">{profile?.status || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Organization Information */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="text-body-lg font-medium text-text-primary mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Trenutna organizacija
        </h3>
        
        {!currentOrgId ? (
          <div className="p-4 bg-status-warning/10 border border-status-warning/30 rounded-lg">
            <p className="text-status-warning text-body-sm">
              Uporabnik ni povezan z nobeno organizacijo
            </p>
          </div>
        ) : (
          <>
            {organizationError && (
              <div className="mb-4 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
                <p className="text-status-error text-body-sm">{organizationError}</p>
              </div>
            )}
            
            {loadingOrg ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                <span className="text-text-secondary">Nalaganje podatkov organizacije...</span>
              </div>
            ) : currentOrganization ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-body-sm text-text-secondary">Naziv organizacije</label>
                    <p className="text-text-primary">{currentOrganization.name}</p>
                  </div>
                  <div>
                    <label className="text-body-sm text-text-secondary">Naročniški paket</label>
                    <p className="text-text-primary capitalize">{currentOrganization.subscription_tier}</p>
                  </div>
                  <div>
                    <label className="text-body-sm text-text-secondary">Stanje naročnine</label>
                    <p className="text-text-primary capitalize">{currentOrganization.subscription_status}</p>
                  </div>
                  <div>
                    <label className="text-body-sm text-text-secondary">Status</label>
                    <p className="text-text-primary">
                      {currentOrganization.is_active ? 'Aktivna' : 'Neaktivna'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-secondary">Organizacija ni najdena</p>
            )}
          </>
        )}
      </div>

      {/* Member Information */}
      {currentMember && (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-body-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Članstvo v organizaciji
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-body-sm text-text-secondary">Vloga</label>
              <p className="text-text-primary capitalize flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {currentMember.role}
              </p>
            </div>
            <div>
              <label className="text-body-sm text-text-secondary">Status</label>
              <p className="text-text-primary capitalize">{currentMember.status}</p>
            </div>
            <div>
              <label className="text-body-sm text-text-secondary">Član od</label>
              <p className="text-text-primary">
                {currentMember.created_at ? new Date(currentMember.created_at).toLocaleDateString('sl-SI') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions */}
      {currentMember && (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-body-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dovoljenja
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Lastnik (Owner)</span>
              <span className={isOwner() ? 'text-status-success' : 'text-text-secondary'}>
                {isOwner() ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Administrator</span>
              <span className={isAdmin() ? 'text-status-success' : 'text-text-secondary'}>
                {isAdmin() ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Član</span>
              <span className={isMember() ? 'text-status-success' : 'text-text-secondary'}>
                {isMember() ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Opazovalec</span>
              <span className={isViewer() ? 'text-status-success' : 'text-text-secondary'}>
                {isViewer() ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
