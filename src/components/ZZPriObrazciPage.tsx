import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Save, 
  Send, 
  User, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Upload,
  X
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Zaupnik {
  id: string
  ime: string
  priimek: string
  email: string
  telefon?: string
  delovno_mesto?: string
  oddelek?: string
  izbran_zaupnik: boolean
  dostopen_pri?: string
}

interface PrijavaFormData {
  kratek_opis: string
  podroben_opis: string
  podrocje: string
  narava_prijave: string
  anonimna: boolean
  prijavitelj_ime: string
  prijavitelj_priimek: string
  prijavitelj_email: string
  prijavitelj_telefon: string
  prijavitelj_delovno_mesto: string
  odgovorna_oseba: string
  zaupnik_id: string
}

const initialFormData: PrijavaFormData = {
  kratek_opis: '',
  podroben_opis: '',
  podrocje: '',
  narava_prijave: '',
  anonimna: false,
  prijavitelj_ime: '',
  prijavitelj_priimek: '',
  prijavitelj_email: '',
  prijavitelj_telefon: '',
  prijavitelj_delovno_mesto: '',
  odgovorna_oseba: '',
  zaupnik_id: ''
}

export default function ZZPriObrazciPage() {
  const [formData, setFormData] = useState<PrijavaFormData>(initialFormData)
  const [zaupniki, setZaupniki] = useState<Zaupnik[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loadingZaupniki, setLoadingZaupniki] = useState(true)

  useEffect(() => {
    loadZaupniki()
  }, [])

  const loadZaupniki = async () => {
    try {
      setLoadingZaupniki(true)
      const { data, error } = await supabase
        .from('zzzpri_zaupniki')
        .select('*')
        .eq('izbran_zaupnik', true)
        .order('ime')

      if (error) throw error
      setZaupniki(data || [])
    } catch (err) {
      console.error('Error loading zaupniki:', err)
      setError('Napaka pri nalaganju zaupnikov')
    } finally {
      setLoadingZaupniki(false)
    }
  }

  const handleInputChange = (field: keyof PrijavaFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (!formData.kratek_opis.trim()) {
      setError('Kratek opis je obvezen')
      setLoading(false)
      return
    }

    if (!formData.podrocje) {
      setError('Izbira področja je obvezna')
      setLoading(false)
      return
    }

    if (!formData.narava_prijave) {
      setError('Izbira narave prijave je obvezna')
      setLoading(false)
      return
    }

    if (!formData.anonimna) {
      if (!formData.prijavitelj_ime.trim() || !formData.prijavitelj_priimek.trim() || !formData.prijavitelj_email.trim()) {
        setError('Podatki prijavitelja so obvezni za neaononimno prijavo')
        setLoading(false)
        return
      }
    }

    try {
      // Prepare data for database
      const prijavaData = {
        kratek_opis: formData.kratek_opis,
        podroben_opis: formData.podroben_opis || null,
        podrocje: formData.podrocje,
        narava_prijave: formData.narava_prijave,
        anonimna: formData.anonimna,
        odgovorna_oseba: formData.odgovorna_oseba || null,
        zaupnik_id: formData.zaupnik_id || null,
        status: isDraft ? 'osnutek' : 'prejeta',
        podatki_prijavitelja_encrypted: formData.anonimna 
          ? { anonimen: true } 
          : {
              ime: formData.prijavitelj_ime,
              priimek: formData.prijavitelj_priimek,
              email: formData.prijavitelj_email,
              telefon: formData.prijavitelj_telefon,
              delovno_mesto: formData.prijavitelj_delovno_mesto
            }
      }

      const { error } = await supabase
        .from('zzzpri_prijave')
        .insert([prijavaData])

      if (error) throw error

      setSuccess(true)
      setFormData(initialFormData)

      // Auto hide success after 5 seconds
      setTimeout(() => setSuccess(false), 5000)

    } catch (err) {
      console.error('Error submitting prijava:', err)
      setError('Napaka pri pošiljanju prijave')
    } finally {
      setLoading(false)
    }
  }

  if (loadingZaupniki) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Nova prijava ZZPri
          </h1>
          <p className="text-body text-text-secondary">
            Obrazec za vložitev prijave po Zakonu o zaščiti prijaviteljev
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Prijava je bila uspešno poslana!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h2 className="text-heading-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-primary" />
            Osnovni podatki prijave
          </h2>
          
          <div className="space-y-6">
            {/* Short description */}
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-2">
                Kratek opis <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.kratek_opis}
                onChange={(e) => handleInputChange('kratek_opis', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                placeholder="Kratko opišite vsebino prijave..."
              />
            </div>

            {/* Detailed description */}
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-2">
                Podroben opis
              </label>
              <textarea
                rows={4}
                value={formData.podroben_opis}
                onChange={(e) => handleInputChange('podroben_opis', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                placeholder="Podrobno opišite dogodek, okoliščine, dokaze..."
              />
            </div>

            {/* Area and Nature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">
                  Področje <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.podrocje}
                  onChange={(e) => handleInputChange('podrocje', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                >
                  <option value="">Izberi področje...</option>
                  <option value="korupcija">Korupcija</option>
                  <option value="goljufija">Goljufija</option>
                  <option value="prekoračitev pooblastil">Prekoračitev pooblastil</option>
                  <option value="diskriminacija">Diskriminacija</option>
                  <option value="mobing">Mobing</option>
                  <option value="drugo">Drugo</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">
                  Narava prijave <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.narava_prijave}
                  onChange={(e) => handleInputChange('narava_prijave', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                >
                  <option value="">Izberi naravo...</option>
                  <option value="interna">Interna</option>
                  <option value="kaznivo dejanje">Kaznivo dejanje</option>
                  <option value="drugi prekrški">Drugi prekrški</option>
                </select>
              </div>
            </div>

            {/* Anonymous checkbox */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonimna}
                  onChange={(e) => handleInputChange('anonimna', e.target.checked)}
                  className="w-5 h-5 text-accent-primary border-border-subtle rounded focus:ring-accent-primary/50 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-body font-medium text-text-primary">Anonimna prijava</span>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-1">
                    Označite, če želite, da ostanejo vaši podatki anonimni. Prijava bo še vedno obravnavana, vendar vaša identiteta ne bo razkrita.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Reporter Information - only if not anonymous */}
        {!formData.anonimna && (
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h2 className="text-heading-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-primary" />
              Podatki prijavitelja
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Ime <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={!formData.anonimna}
                    value={formData.prijavitelj_ime}
                    onChange={(e) => handleInputChange('prijavitelj_ime', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Priimek <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={!formData.anonimna}
                    value={formData.prijavitelj_priimek}
                    onChange={(e) => handleInputChange('prijavitelj_priimek', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">
                  E-pošta <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required={!formData.anonimna}
                  value={formData.prijavitelj_email}
                  onChange={(e) => handleInputChange('prijavitelj_email', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.prijavitelj_telefon}
                    onChange={(e) => handleInputChange('prijavitelj_telefon', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Delovno mesto
                  </label>
                  <input
                    type="text"
                    value={formData.prijavitelj_delovno_mesto}
                    onChange={(e) => handleInputChange('prijavitelj_delovno_mesto', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Information */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h2 className="text-heading-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-primary" />
            Podatki o obravnavi
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-2">
                Odgovorna oseba
              </label>
              <input
                type="text"
                value={formData.odgovorna_oseba}
                onChange={(e) => handleInputChange('odgovorna_oseba', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                placeholder="Ime osebe, ki bo odgovorna za obravnavo..."
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-2">
                Zaupnik
              </label>
              <select
                value={formData.zaupnik_id}
                onChange={(e) => handleInputChange('zaupnik_id', e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
              >
                <option value="">Izberi zaupnika...</option>
                {zaupniki.map((zaupnik) => (
                  <option key={zaupnik.id} value={zaupnik.id}>
                    {zaupnik.ime} {zaupnik.priimek} - {zaupnik.delovno_mesto}
                  </option>
                ))}
              </select>
              {zaupniki.length === 0 && (
                <p className="text-body-sm text-orange-400 mt-1">
                  Ni na voljo zaupnikov. Dodajte zaupnike v zavihku "Upravljanje zaupnikov".
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-surface-hover border border-border-subtle rounded-lg text-text-secondary hover:bg-bg-surface-active transition-colors duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Shranjujem...' : 'Shrani kot osnutek'}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Pošiljam...' : 'Pošlji prijavo'}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-heading-md font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          Pomembne informacije
        </h3>
        <ul className="space-y-2 text-body-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            Po pošiljanju prijave boste prejeli potrdilo na vašo e-pošto (če ni anonimna)
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            Prijava bo obravnavana v zakonskem roku 7 dni za potrditev in 3 mesece za rešitev
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            Vaši podatki so zaščiteni v skladu z ZZPri in GDPR zakonodajo
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            Za dodatna vprašanja se obrnite na izbrane zaupnike
          </li>
        </ul>
      </div>
    </div>
  )
}