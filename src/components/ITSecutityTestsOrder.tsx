import React, { useState } from 'react'
import { Shield, FileText, Upload, Send } from 'lucide-react'

export default function ITSecutityTestsOrder() {
  const [formData, setFormData] = useState({
    naročnik: '',
    telefon: '',
    email: '',
    tip_testa: '',
    namen_testa: '',
    cilj_testa: '',
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
    const emailSubject = 'Naročilo IT-varnostnih testov'
    const emailBody = `
Naročilo IT-varnostnih testov

Naročnik: ${formData.naročnik}
Telefon: ${formData.telefon}
E-naslov: ${formData.email}

Tip IT-varnostnega testa: ${formData.tip_testa}
Namen testa: ${formData.namen_testa}
Cilj testa: ${formData.cilj_testa}

Opis: ${formData.opis}
Opombe: ${formData.opombe}

Osebe, ki bodo seznanjene o testu: ${formData.osebe_senzani}
Predviden termin testa: ${formData.predviden_termin}
Kontaktna oseba: ${formData.kontaktna_oseba}
Naročilnica št.: ${formData.narocilnica_st}
Želite ponudbo?: ${formData.zelite_ponudbo}

Priloga: ${formData.priloga ? formData.priloga.name : 'Ni priložene datoteke'}

Pošiljam z aplikacije NIS2 Control Dashboard.
    `.trim()

    // Ustvari mailto link
    const mailtoLink = `mailto:info@nis2.si?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Odpri email klienta
    window.location.href = mailtoLink

    setIsSubmitting(false)
  }

  const testTypes = [
    'Phishing',
    'Sistemski pregled', 
    'Pen test',
    'Socialni inženiring',
    'Drugo'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Naročilo IT-varnostnih testov</h1>
            <p className="text-text-tertiary">Formular za naročilo IT varnostnih storitev</p>
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
                  Tip IT-varnostnega testa *
                </label>
                <select
                  name="tip_testa"
                  value={formData.tip_testa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                >
                  <option value="">Izberite tip testa</option>
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Namen in cilji */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Namen in cilji testa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Namen testa *
                </label>
                <textarea
                  name="namen_testa"
                  value={formData.namen_testa}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Cilj testa *
                </label>
                <textarea
                  name="cilj_testa"
                  value={formData.cilj_testa}
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
                  Navedite osebe, ki bodo seznanjene o testu *
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
                  Predviden termin testa *
                </label>
                <input
                  type="date"
                  name="predviden_termin"
                  value={formData.predviden_termin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Kontaktna oseba *
                </label>
                <input
                  type="text"
                  name="kontaktna_oseba"
                  value={formData.kontaktna_oseba}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
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

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Želite ponudbo? *
                </label>
                <select
                  name="zelite_ponudbo"
                  value={formData.zelite_ponudbo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                >
                  <option value="">Izberite</option>
                  <option value="DA">DA</option>
                  <option value="NE">NE</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Priloga (npr. naročilnica, podatki)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  {formData.priloga && (
                    <span className="text-text-secondary text-sm">
                      {formData.priloga.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Pošiljam...' : 'Pošlji'}
            </button>
          </div>
        </form>
      </div>

      {/* Information */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-accent-primary mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-text-primary mb-2">Navodila</h4>
            <p className="text-text-secondary text-sm">
              Ko kliknete "Pošlji", se bo odprl vaš privzeti e-poštni odjemalec z vnaprej izpolnjenim e-poštnim naslovom 
              <strong> info@nis2.si </strong> in naslovom zadeve <strong> "Naročilo IT-varnostnih testov"</strong>. 
              Vsa polja, ki ste jih izpolnili, bodo samodejno vključena v telo e-pošte. Priložene datoteke bodo morale 
              biti priložene ročno v e-poštnem odjemalcu.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
