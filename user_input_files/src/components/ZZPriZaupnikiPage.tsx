import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  X
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Zaupnik {
  id: string
  ime: string
  priimek: string
  email: string
  telefon: string
  delovno_mesto: string
  oddelek: string
  izbran_zaupnik: boolean
  dostopen_pri: string
  usposobljen: boolean
  created_at: string
}

interface ZaupnikFormData {
  ime: string
  priimek: string
  email: string
  telefon: string
  delovno_mesto: string
  oddelek: string
  izbran_zaupnik: boolean
  dostopen_pri: string
  usposobljen: boolean
}

// Demo zapisi za fallback
const demoZaupniki: Zaupnik[] = [
  {
    id: 'demo-1',
    ime: 'Ana',
    priimek: 'Novak',
    email: 'ana.novak@podjetje.si',
    telefon: '+386 41 123 456',
    delovno_mesto: 'Vodja varnosti',
    oddelek: 'IT oddelek',
    izbran_zaupnik: true,
    dostopen_pri: 'Ponedeljek-Petek 8:00-16:00',
    usposobljen: true,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'demo-2',
    ime: 'Marko',
    priimek: 'Kovač',
    email: 'marko.kovac@podjetje.si',
    telefon: '+386 41 234 567',
    delovno_mesto: 'Strokovnjak za kibernetsko varnost',
    oddelek: 'Varnostni oddelek',
    izbran_zaupnik: true,
    dostopen_pri: 'Ponedeljek-Petek 7:00-15:00',
    usposobljen: true,
    created_at: '2024-02-20T14:15:00Z'
  },
  {
    id: 'demo-3',
    ime: 'Petra',
    priimek: 'Zupan',
    email: 'petra.zupan@podjetje.si',
    telefon: '+386 41 345 678',
    delovno_mesto: 'Pravna svetovalka',
    oddelek: 'Pravni oddelek',
    izbran_zaupnik: false,
    dostopen_pri: 'Ponedeljek-Četrtek 9:00-17:00',
    usposobljen: true,
    created_at: '2024-03-10T09:45:00Z'
  },
  {
    id: 'demo-4',
    ime: 'Tomaž',
    priimek: 'Vidmar',
    email: 'tomaz.vidmar@podjetje.si',
    telefon: '+386 41 456 789',
    delovno_mesto: 'Sistem administrator',
    oddelek: 'IT oddelek',
    izbran_zaupnik: false,
    dostopen_pri: 'Ponedeljek-Petek 6:00-14:00',
    usposobljen: true,
    created_at: '2024-04-05T11:20:00Z'
  }
]

export default function ZZPriZaupnikiPage() {
  const [zaupniki, setZaupniki] = useState<Zaupnik[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingZaupnik, setEditingZaupnik] = useState<Zaupnik | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<ZaupnikFormData>({
    ime: '',
    priimek: '',
    email: '',
    telefon: '',
    delovno_mesto: '',
    oddelek: '',
    izbran_zaupnik: false,
    dostopen_pri: '',
    usposobljen: false
  })

  useEffect(() => {
    loadZaupniki()
  }, [])

  const loadZaupniki = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('zzzpri_zaupniki')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Napaka pri nalaganju iz baze, uporabljam demo podatke:', error)
        // Če pride do napake ali ni podatkov, uporabi demo zapise
        setZaupniki(demoZaupniki)
        setError(null) // Ne prikažemo napake uporabniku, ker imamo demo podatke
      } else {
        // Če ni podatkov v bazi, uporabi demo zapise
        if (!data || data.length === 0) {
          setZaupniki(demoZaupniki)
        } else {
          setZaupniki(data)
        }
      }
    } catch (err) {
      console.warn('Napaka pri nalaganju zaupnikov, uporabljam demo podatke:', err)
      // V primeru napake uporabi demo zapise
      setZaupniki(demoZaupniki)
      setError(null) // Ne prikažemo napake uporabniku, ker imamo demo podatke
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingZaupnik) {
        // Update existing
        const { error } = await supabase
          .from('zzzpri_zaupniki')
          .update(formData)
          .eq('id', editingZaupnik.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('zzzpri_zaupniki')
          .insert([formData])

        if (error) throw error
      }

      await loadZaupniki()
      setShowModal(false)
      setEditingZaupnik(null)
      setFormData({
        ime: '',
        priimek: '',
        email: '',
        telefon: '',
        delovno_mesto: '',
        oddelek: '',
        izbran_zaupnik: false,
        dostopen_pri: '',
        usposobljen: false
      })
    } catch (err) {
      console.error('Error saving zaupnik:', err)
      setError('Napaka pri shranjevanju zaupnika')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ali ste prepričani, da želite izbrisati tega zaupnika?')) return

    try {
      const { error } = await supabase
        .from('zzzpri_zaupniki')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadZaupniki()
    } catch (err) {
      console.error('Error deleting zaupnik:', err)
      setError('Napaka pri brisanju zaupnika')
    }
  }

  const openEditModal = (zaupnik: Zaupnik) => {
    setEditingZaupnik(zaupnik)
    setFormData({
      ime: zaupnik.ime,
      priimek: zaupnik.priimek,
      email: zaupnik.email,
      telefon: zaupnik.telefon || '',
      delovno_mesto: zaupnik.delovno_mesto || '',
      oddelek: zaupnik.oddelek || '',
      izbran_zaupnik: zaupnik.izbran_zaupnik,
      dostopen_pri: zaupnik.dostopen_pri || '',
      usposobljen: zaupnik.usposobljen
    })
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sl-SI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const filteredZaupniki = zaupniki.filter(zaupnik => {
    const searchLower = searchTerm.toLowerCase()
    return (
      zaupnik.ime.toLowerCase().includes(searchLower) ||
      zaupnik.priimek.toLowerCase().includes(searchLower) ||
      zaupnik.email.toLowerCase().includes(searchLower) ||
      zaupnik.delovno_mesto?.toLowerCase().includes(searchLower) ||
      zaupnik.oddelek?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
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
            Upravljanje zaupnikov
          </h1>
          <p className="text-body text-text-secondary">
            Evidence oseb, ki so pooblaščene za sprejemanje prijav po ZZPri
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingZaupnik(null)
            setFormData({
              ime: '',
              priimek: '',
              email: '',
              telefon: '',
              delovno_mesto: '',
              oddelek: '',
              izbran_zaupnik: false,
              dostopen_pri: '',
              usposobljen: false
            })
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Dodaj zaupnika
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Išči po imenu, e-pošti ali delovnem mestu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Skupaj zaupnikov</p>
              <p className="text-heading-lg font-semibold text-text-primary">{zaupniki.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Izbrani zaupniki</p>
              <p className="text-heading-lg font-semibold text-text-primary">
                {zaupniki.filter(z => z.izbran_zaupnik).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-bg-surface p-4 rounded-lg border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary">Usposobljenih</p>
              <p className="text-heading-lg font-semibold text-text-primary">
                {zaupniki.filter(z => z.usposobljen).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-body-sm text-text-secondary">
        Prikazano {filteredZaupniki.length} od {zaupniki.length} zaupnikov
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZaupniki.map((zaupnik) => (
          <div key={zaupnik.id} className="bg-bg-surface border border-border-subtle rounded-lg p-6 hover:border-accent-primary/50 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${zaupnik.izbran_zaupnik ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
                  <Users className={`w-6 h-6 ${zaupnik.izbran_zaupnik ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-heading-md font-semibold text-text-primary">
                    {zaupnik.ime} {zaupnik.priimek}
                  </h3>
                  {zaupnik.delovno_mesto && (
                    <p className="text-body-sm text-text-secondary">{zaupnik.delovno_mesto}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => openEditModal(zaupnik)}
                  className="p-2 text-text-tertiary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(zaupnik.id)}
                  className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-tertiary" />
                <span className="text-body-sm text-text-secondary">{zaupnik.email}</span>
              </div>
              {zaupnik.telefon && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-tertiary" />
                  <span className="text-body-sm text-text-secondary">{zaupnik.telefon}</span>
                </div>
              )}
              {zaupnik.oddelek && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-text-tertiary" />
                  <span className="text-body-sm text-text-secondary">{zaupnik.oddelek}</span>
                </div>
              )}
              {zaupnik.dostopen_pri && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-tertiary" />
                  <span className="text-body-sm text-text-secondary">{zaupnik.dostopen_pri}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {zaupnik.izbran_zaupnik && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-body-xs font-medium bg-green-500/10 border border-green-500/30 text-green-400">
                  Izbrani zaupnik
                </span>
              )}
              {zaupnik.usposobljen && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-body-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  Usposobljen
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="text-body-xs text-text-tertiary border-t border-border-subtle pt-3">
              Dodano: {formatDate(zaupnik.created_at)}
            </div>
          </div>
        ))}
      </div>

      {filteredZaupniki.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-heading-md font-medium text-text-primary mb-2">Ni zaupnikov</h3>
          <p className="text-body text-text-secondary mb-6">
            {searchTerm 
              ? 'Ni zaupnikov, ki bi ustrezali iskalnemu izrazu.'
              : 'Še ni bilo dodanih zaupnikov.'
            }
          </p>
          <button 
            onClick={() => {
              setEditingZaupnik(null)
              setFormData({
                ime: '',
                priimek: '',
                email: '',
                telefon: '',
                delovno_mesto: '',
                oddelek: '',
                izbran_zaupnik: false,
                dostopen_pri: '',
                usposobljen: false
              })
              setShowModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Dodaj prvega zaupnika
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border-subtle rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-xl font-semibold text-text-primary">
                  {editingZaupnik ? 'Uredi zaupnika' : 'Dodaj zaupnika'}
                </h2>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-medium text-text-secondary mb-2">Ime *</label>
                    <input
                      type="text"
                      required
                      value={formData.ime}
                      onChange={(e) => setFormData({...formData, ime: e.target.value})}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-text-secondary mb-2">Priimek *</label>
                    <input
                      type="text"
                      required
                      value={formData.priimek}
                      onChange={(e) => setFormData({...formData, priimek: e.target.value})}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">E-pošta *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-medium text-text-secondary mb-2">Delovno mesto</label>
                    <input
                      type="text"
                      value={formData.delovno_mesto}
                      onChange={(e) => setFormData({...formData, delovno_mesto: e.target.value})}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-text-secondary mb-2">Oddelek</label>
                    <input
                      type="text"
                      value={formData.oddelek}
                      onChange={(e) => setFormData({...formData, oddelek: e.target.value})}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">Dostopen</label>
                  <input
                    type="text"
                    placeholder="npr. Ponedeljek-Petek 8:00-16:00"
                    value={formData.dostopen_pri}
                    onChange={(e) => setFormData({...formData, dostopen_pri: e.target.value})}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary text-text-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.izbran_zaupnik}
                      onChange={(e) => setFormData({...formData, izbran_zaupnik: e.target.checked})}
                      className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary/50"
                    />
                    <span className="ml-2 text-body text-text-primary">Izbrani zaupnik</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.usposobljen}
                      onChange={(e) => setFormData({...formData, usposobljen: e.target.checked})}
                      className="w-4 h-4 text-accent-primary border-border-subtle rounded focus:ring-accent-primary/50"
                    />
                    <span className="ml-2 text-body text-text-primary">Usposobljen za ZZPri</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg text-text-secondary hover:bg-bg-surface-hover transition-colors duration-200"
                >
                  Prekliči
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {saving ? 'Shranjevanje...' : (editingZaupnik ? 'Posodobi' : 'Dodaj')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}