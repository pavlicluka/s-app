import { User, Settings, Lock, FileText, LogOut, UserCog } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { logAuditAction, AuditActionTypes } from '../lib/auditLog'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './common/LanguageSwitcher'

interface HeaderProps {
  onNavigate?: (page: string) => void
}

export default function Header({ onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentDate = new Date().toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    // Close dropdown on Escape key
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    try {
      await logAuditAction({
        action_type: AuditActionTypes.LOGOUT,
        action_description: 'Uporabnik se je odjavil iz sistema'
      })
      await signOut()
    } catch (error) {
      console.error('Napaka pri odjavi:', error)
    }
  }

  const handleMenuClick = (page: string) => {
    setIsDropdownOpen(false)
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <header className="fixed top-0 md:left-[280px] left-0 right-0 h-[64px] bg-bg-near-black/95 backdrop-blur-[10px] border-b border-border-subtle z-50">
      <div className="h-full flex items-center justify-between px-4 md:px-8">
        {/* Left side: Date */}
        <div className="flex items-center gap-6">
          {/* Date */}
          <div className="text-body-sm text-text-secondary capitalize">
            {currentDate}
          </div>
        </div>

        {/* Right side: Language Switcher + Profile */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-[40px] flex items-center gap-2 md:gap-3 px-3 md:px-4 bg-bg-surface border border-border-subtle rounded-full 
                         hover:bg-bg-surface-hover hover:border-border-moderate transition-all duration-250 min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center border-2 border-accent-primary">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-body-sm font-medium text-text-primary hidden md:inline">{t('header.myProfile')}</span>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-[240px] bg-bg-surface border border-border-subtle rounded-lg shadow-lg z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    {/* Edit Profile */}
                    <button
                      onClick={() => handleMenuClick('profile-edit')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <Settings className="w-4 h-4 text-text-secondary" />
                      <span>{t('header.editProfile')}</span>
                    </button>

                    {/* Change Password */}
                    <button
                      onClick={() => handleMenuClick('change-password')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <Lock className="w-4 h-4 text-text-secondary" />
                      <span>{t('header.changePassword')}</span>
                    </button>

                    {/* Audit Trail */}
                    <button
                      onClick={() => handleMenuClick('audit-trail')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <FileText className="w-4 h-4 text-text-secondary" />
                      <span>{t('header.auditTrail')}</span>
                    </button>

                    {/* Super Admin */}
                    <button
                      onClick={() => handleMenuClick('super-admin')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <UserCog className="w-4 h-4 text-text-secondary" />
                      <span>{t('header.superAdmin')}</span>
                    </button>

                    {/* Divider */}
                    <div className="my-2 border-t border-border-subtle" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
