import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Logo from './common/Logo'

export default function Login() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || t('auth.loginError'))
    } finally {
      setLoading(false)
    }
  }

  const { i18n } = useTranslation()

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-near-black">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" />
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-bg-surface-elevated border border-border-subtle rounded-md
                       px-4 py-2 pr-8 text-body-sm text-text-primary
                       focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                       transition-all duration-200 cursor-pointer"
            >
              <option value="sl">🇸🇮 Slovenščina</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Globe className="h-4 w-4 text-text-secondary" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-bg-surface-elevated p-10 rounded-lg border border-border-moderate">
          <form onSubmit={handleSubmit} className="space-y-6">


            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-text-primary mb-2">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md
                         text-body text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                         transition-all duration-200"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-text-primary mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md
                         text-body text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                         transition-all duration-200"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-risk-high/15 border border-risk-high/30 rounded-md">
                <p className="text-body-sm text-risk-high">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-accent-primary text-white font-semibold rounded-sm
                       hover:brightness-110 hover:shadow-glow-accent-sm
                       active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
            >
              {loading ? t('auth.signingIn') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
