import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  OrganizationSettingsPage,
  UserInvitationUI, 
  OrganizationSwitcher 
} from './organization'

interface OrganizationManagementPageProps {
  setCurrentPage: (page: string) => void
}

export default function OrganizationManagementPage({ setCurrentPage }: OrganizationManagementPageProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'settings' | 'invitations'>('settings')

  const handleInviteUser = () => {
    setActiveTab('invitations')
  }

  const handleManageOrganization = () => {
    setActiveTab('settings')
  }

  return (
    <div className="space-y-6">
      {/* Header with Organization Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Organization Switcher */}
          <OrganizationSwitcher
            onInviteUser={handleInviteUser}
            onManageOrganization={handleManageOrganization}
            className="mb-0"
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-bg-near-black rounded-lg p-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('organization.settings')}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('organization.inviteUsers')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'settings' && (
          <OrganizationSettingsPage setCurrentPage={setCurrentPage} />
        )}
        
        {activeTab === 'invitations' && (
          <UserInvitationUI setCurrentPage={setCurrentPage} />
        )}
      </div>
    </div>
  )
}
