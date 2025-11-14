import { useOrganization } from '../hooks/useOrganization'
import { AlertTriangle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function OrganizationErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error, loading } = useOrganization()
  const { signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-near-black">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface-elevated p-8 rounded-lg border border-border-moderate">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-center text-xl font-semibold text-text-primary mb-2">
              Napaka pri dostopa
            </h2>
            <p className="text-center text-body text-text-secondary mb-6">
              {error}
            </p>

            {/* Additional Info */}
            <div className="bg-bg-near-black border border-border-subtle rounded-md p-4 mb-6">
              <p className="text-body-sm text-text-tertiary">
                <strong>Kaj se je zgodilo:</strong>
              </p>
              <ul className="text-body-sm text-text-tertiary mt-2 list-disc list-inside space-y-1">
                <li>Vaša privzeta organizacija je bila izbrisana</li>
                <li>Vaša organizacija je bila deaktivirana</li>
                <li>Nimaš dostopa do nobene aktivne organizacije</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-accent-primary text-white font-semibold rounded-sm
                         hover:brightness-110 hover:shadow-glow-accent-sm
                         active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150 flex items-center justify-center gap-2"
              >
                Osveži stran
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut()
                    window.location.href = '/login'
                  } catch (err) {
                    console.error('Error signing out:', err)
                  }
                }}
                className="w-full h-12 bg-bg-surface border border-border-subtle text-text-primary font-semibold rounded-sm
                         hover:bg-bg-surface-hover transition-all duration-150 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Odjavite se
              </button>
            </div>

            {/* Support Info */}
            <p className="text-center text-body-xs text-text-tertiary mt-6">
              Kontaktirajte administratorja za pomoč pri reševanju težave.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
