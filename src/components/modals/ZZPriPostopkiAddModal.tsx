import { useState } from 'react'
import { X, Calendar, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ZZPriPostopkiAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ZZPriPostopkiAddModal({ isOpen, onClose, onSuccess }: ZZPriPostopkiAddModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    postopek_id: '',
    naziv_postopka: '',
    tip_postopka: 'Notranja obravnava',
    faza_postopka: 'Predhodno preverjanje',
    opis_postopka: '',
    datum_vlozitve: '',
    datum_potrditve: '',
    rok_obravnave: '',
    datum_zakljucka: '',
    prijava_id: '',
    zaupnik_id: '',
    pobudnik: '',
    prijavitelj: '',
    prijavitelj_anonimen: false,
    kontaktni_podatki: '',
    podrocje_krsitve: '',
    podroben_opis: '',
    zbrana_dokazila: '',
    pricanja: '',
    ugotovitve: '',
    priporoceni_ukrepi: '',
    sprejeti_ukrepi: '',
    odgovorna_oseba: '',
    sodelujoce_osebe: '',
    status: 'v pripravi',
    prioriteta: 'srednja',
    zaupnost: 'zaupno',
    priloge: '',
    opombe: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.postopek_id || !formData.naziv_postopka) {
        setError('Prosim izpolnite vsa obvezna polja')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('zzzpri_postopki')
        .insert([formData])

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating postopek:', err)
      setError(err.message || 'Prišlo je do napake pri ustvarjanju postopka')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-surface rounded-lg border border-border-subtle max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bg-surface border-b border-border-subtle p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading-lg font-semibold text-text-primary">Nov postopek po ZZPri</h2>
              <p className="text-body-sm text-text-secondary mt-1">Dodajte nov postopek obravnave prijave</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-surface-hover rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-body-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Osnovni podatki</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  ID postopka <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="postopek_id"
                  value={formData.postopek_id}
                  onChange={handleChange}
                  placeholder="npr. POST-2025-001"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">
                  Naziv postopka <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="naziv_postopka"
                  value={formData.naziv_postopka}
                  onChange={handleChange}
                  placeholder="Kratek opis postopka"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Tip postopka</label>
                <select
                  name="tip_postopka"
                  value={formData.tip_postopka}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="Notranja obravnava">Notranja obravnava</option>
                  <option value="Zunanja obravnava">Zunanja obravnava</option>
                  <option value="Mešana obravnava">Mešana obravnava</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Faza postopka</label>
                <select
                  name="faza_postopka"
                  value={formData.faza_postopka}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="Predhodno preverjanje">Predhodno preverjanje</option>
                  <option value="Zbiranje dokazov">Zbiranje dokazov</option>
                  <option value="Preiskava">Preiskava</option>
                  <option value="Zaključna poročila">Zaključna poročila</option>
                  <option value="Zaključena preiskava">Zaključena preiskava</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="v pripravi">V pripravi</option>
                  <option value="v obravnavi">V obravnavi</option>
                  <option value="zaključen">Zaključen</option>
                  <option value="ustavljen">Ustavljen</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Prioriteta</label>
                <select
                  name="prioriteta"
                  value={formData.prioriteta}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="nizka">Nizka</option>
                  <option value="srednja">Srednja</option>
                  <option value="visoka">Visoka</option>
                  <option value="kritična">Kritična</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Opis postopka</label>
              <textarea
                name="opis_postopka"
                value={formData.opis_postopka}
                onChange={handleChange}
                rows={3}
                placeholder="Kratek povzetek postopka"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Datumi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Datum vložitve</label>
                <input
                  type="date"
                  name="datum_vlozitve"
                  value={formData.datum_vlozitve}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Datum potrditve</label>
                <input
                  type="date"
                  name="datum_potrditve"
                  value={formData.datum_potrditve}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Rok obravnave</label>
                <input
                  type="date"
                  name="rok_obravnave"
                  value={formData.rok_obravnave}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Datum zaključka</label>
                <input
                  type="date"
                  name="datum_zakljucka"
                  value={formData.datum_zakljucka}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Whistleblower Information */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Podatki o prijavitelju</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">ID prijave</label>
                <input
                  type="text"
                  name="prijava_id"
                  value={formData.prijava_id}
                  onChange={handleChange}
                  placeholder="npr. ZP-2025-001"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">ID zaupnika</label>
                <input
                  type="text"
                  name="zaupnik_id"
                  value={formData.zaupnik_id}
                  onChange={handleChange}
                  placeholder="ID zaupnika za ZZPri"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Pobudnik</label>
                <input
                  type="text"
                  name="pobudnik"
                  value={formData.pobudnik}
                  onChange={handleChange}
                  placeholder="Ime pobudnika postopka"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Prijavitelj</label>
                <input
                  type="text"
                  name="prijavitelj"
                  value={formData.prijavitelj}
                  onChange={handleChange}
                  placeholder="Ime prijavitelja (če ni anonimen)"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="prijavitelj_anonimen"
                  checked={formData.prijavitelj_anonimen}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border-subtle bg-bg-near-black text-accent-primary focus:ring-2 focus:ring-accent-primary"
                />
                <span className="text-body-sm text-text-primary">Prijavitelj je anonimen</span>
              </label>
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Kontaktni podatki</label>
              <textarea
                name="kontaktni_podatki"
                value={formData.kontaktni_podatki}
                onChange={handleChange}
                rows={2}
                placeholder="Email, telefon..."
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Violation Details */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Podatki o kršitvi</h3>
            
            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Področje kršitve</label>
              <select
                name="podrocje_krsitve"
                value={formData.podrocje_krsitve}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">Izberite področje</option>
                <option value="korupcija">Korupcija</option>
                <option value="prekoračitev pooblastil">Prekoračitev pooblastil</option>
                <option value="mobing">Mobing in nadlegovanje</option>
                <option value="diskriminacija">Diskriminacija</option>
                <option value="finančne nepravilnosti">Finančne nepravilnosti</option>
                <option value="javno naročanje">Javno naročanje</option>
                <option value="kršitev varstva podatkov">Kršitev varstva podatkov</option>
                <option value="drugo">Drugo</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Podroben opis kršitve</label>
              <textarea
                name="podroben_opis"
                value={formData.podroben_opis}
                onChange={handleChange}
                rows={4}
                placeholder="Opišite sum kršitve..."
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Zbrana dokazila</label>
              <textarea
                name="zbrana_dokazila"
                value={formData.zbrana_dokazila}
                onChange={handleChange}
                rows={3}
                placeholder="Seznam zbranih dokazil"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Pričanja</label>
              <textarea
                name="pricanja"
                value={formData.pricanja}
                onChange={handleChange}
                rows={3}
                placeholder="Zbrana pričanja"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Investigation Results */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Ugotovitve in ukrepi</h3>
            
            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Ugotovitve</label>
              <textarea
                name="ugotovitve"
                value={formData.ugotovitve}
                onChange={handleChange}
                rows={4}
                placeholder="Ugotovitve preiskave"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Priporočeni ukrepi</label>
              <textarea
                name="priporoceni_ukrepi"
                value={formData.priporoceni_ukrepi}
                onChange={handleChange}
                rows={3}
                placeholder="Priporočeni korektivni ukrepi"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Sprejeti ukrepi</label>
              <textarea
                name="sprejeti_ukrepi"
                value={formData.sprejeti_ukrepi}
                onChange={handleChange}
                rows={3}
                placeholder="Dejansko sprejeti ukrepi"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Responsibility */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Odgovornosti</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Odgovorna oseba</label>
                <input
                  type="text"
                  name="odgovorna_oseba"
                  value={formData.odgovorna_oseba}
                  onChange={handleChange}
                  placeholder="Ime odgovorne osebe"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Sodelujoče osebe</label>
                <input
                  type="text"
                  name="sodelujoce_osebe"
                  value={formData.sodelujoce_osebe}
                  onChange={handleChange}
                  placeholder="Seznam sodelujočih"
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-semibold text-text-primary">Dodatne informacije</h3>
            
            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Stopnja zaupnosti</label>
              <select
                name="zaupnost"
                value={formData.zaupnost}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="javno">Javno</option>
                <option value="zaupno">Zaupno</option>
                <option value="strogo zaupno">Strogo zaupno</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Priloge</label>
              <textarea
                name="priloge"
                value={formData.priloge}
                onChange={handleChange}
                rows={2}
                placeholder="Seznam prilog (URL-ji ali reference)"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Opombe</label>
              <textarea
                name="opombe"
                value={formData.opombe}
                onChange={handleChange}
                rows={3}
                placeholder="Dodatne opombe"
                className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-bg-surface-hover text-text-primary rounded-lg hover:bg-bg-near-black transition-colors duration-200"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Dodajanje...' : 'Dodaj postopek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
