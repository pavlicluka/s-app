import React, { useState } from 'react'
import { Monitor, FileText, Upload, Send } from 'lucide-react'

export default function ITServicesOrder() {
  const [formData, setFormData] = useState({
    naročnik: '',
    telefon: '',
    email: '',
    področje_its: '',
    namen_storitve: '',
    cilj_storitve: '',
    opis: '',
    opombe: '',
    osebe_senzani: '',
    predviden_termin: '',
    kontaktna_oseba: '',
    narocilnica_st: '',
    zelite_ponudbo: '',
    priloga: null as File | null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      priloga: file
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Pripravi email vsebino
    const emailSubject = 'Naročilo IT-storitev'
    const emailBody = `
Naročilo IT-storitev

Naročnik: ${formData.naročnik}
Telefon: ${formData.telefon}
E-naslov: ${formData.email}

Področje IT-storitve: ${formData.področje_its}

Namen storitve:
${formData.namen_storitve}

Cilj storitve:
${formData.cilj_storitve}

Opis:
${formData.opis}

Opombe:
${formData.opombe}

Osebe, ki bodo seznanjene o storitvi: ${formData.osebe_senzani}
Predviden termin: ${formData.predviden_termin}
Kontaktna oseba: ${formData.kontaktna_oseba}
Naročilnica št.: ${formData.narocilnica_st}
Želite ponudbo?: ${formData.zelite_ponudbo}

Priloga: ${formData.priloga ? formData.priloga.name : 'Ni priložene datoteke'}

Pošiljam z aplikacije Standario.
    `.trim()

    // Ustvari mailto link
    const mailtoLink = `mailto:info@standario.si?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Odpri email klienta
    window.location.href = mailtoLink

    setIsSubmitting(false)
  }

  const serviceAreas = [
    'IT svetovanje',
    'IT tehnična pomoč',
    'Drugo'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Naročilo IT-storitev</h1>
            <p className="text-text-tertiary">Formular za naročilo IT storitev</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Osnovni podatki */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Osnovni podatki
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Naročnik *
                </label>
                <input
                  type="text"
                  name="naročnik"
                  value={formData.naročnik}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  E-naslov *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Področje IT-storitve *
                </label>
                <select
                  name="področje_its"
                  value={formData.področje_its}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                >
                  <option value="">Izberite področje</option>
                  {serviceAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Namen in cilji */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Namen in cilji storitve</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Namen storitve *
                </label>
                <textarea
                  name="namen_storitve"
                  value={formData.namen_storitve}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Cilj storitve *
                </label>
                <textarea
                  name="cilj_storitve"
                  value={formData.cilj_storitve}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Opis
                </label>
                <textarea
                  name="opis"
                  value={formData.opis}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Opombe
                </label>
                <textarea
                  name="opombe"
                  value={formData.opombe}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Dodatne informacije */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Dodatne informacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Navedite osebe, ki bodo seznanjene o storitvi *
                </label>
                <textarea
                  name="osebe_senzani"
                  value={formData.osebe_senzani}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Predviden termin
                </label>
                <input
                  type="date"
                  name="predviden_termin"
                  value={formData.predviden_termin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Kontaktna oseba
                </label>
                <input
                  type="text"
                  name="kontaktna_oseba"
                  value={formData.kontaktna_oseba}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Naročilnica št.
                </label>
                <input
                  type="text"
                  name="narocilnica_st"
                  value={formData.narocilnica_st}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Priloge */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Priloge
            </h3>
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Dodaj prilogo (datoteka do 10MB)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              />
              {formData.priloga && (
                <p className="text-body-sm text-accent-primary mt-1">
                  Izbrana datoteka: {formData.priloga.name}
                </p>
              )}
            </div>
          </div>

          {/* Ponudba */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Dodatne zahteve</h3>
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Želite prejeti ponudbo?
              </label>
              <select
                name="zelite_ponudbo"
                value={formData.zelite_ponudbo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">Izberite...</option>
                <option value="Da, želim">Da, želim</option>
                <option value="Ne, ni potrebno">Ne, ni potrebno</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Pošiljam...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Pošlji naročilo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
