// Settings page with 2FA
import { Settings as SettingsIcon, Shield, User, Bell } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-body text-text-secondary">
            {t('settings.subtitle')}
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-4 mb-6">
          <User className="w-6 h-6 text-accent-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">{t('settings.profile')}</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-body-sm text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md text-body text-text-tertiary"
            />
          </div>
        </div>
      </div>

      {/* Security Section with 2FA */}
      <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-4 mb-6">
          <Shield className="w-6 h-6 text-accent-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Varnost</h2>
        </div>
        
        <div className="space-y-6">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 bg-bg-near-black rounded-md border border-border-subtle">
            <div>
              <div className="text-body font-medium text-text-primary mb-1">
                Dvofaktorska avtentikacija (2FA)
              </div>
              <div className="text-body-sm text-text-secondary">
                Dodajte dodatno plast varnosti vašemu računu
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-accent-primary' : 'bg-bg-surface-hover'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-accent-primary/15 border border-accent-primary/30 rounded-md">
              <p className="text-body-sm text-accent-primary">
                2FA je omogočena. Pri naslednji prijavi boste morali vnesti kodo iz avtentikacijske aplikacije.
              </p>
            </div>
          )}

          <button className="w-full h-12 bg-bg-surface-hover text-text-primary border border-border-subtle rounded-sm hover:bg-bg-surface-elevated transition-all">
            Spremeni geslo
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-4 mb-6">
          <Bell className="w-6 h-6 text-accent-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Obvestila</h2>
        </div>
        
        <div className="space-y-4">
          {['Email obvestila za nove incidente', 'Push obvestila za kritična tveganja', 'Tedenska povzetka'].map((label) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border-subtle bg-bg-near-black" />
              <span className="text-body text-text-primary">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
