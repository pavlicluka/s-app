import React, { useState } from 'react'
import { FileText, Send } from 'lucide-react'

export default function ServicesQuoteOrder() {
  const [formData, setFormData] = useState({
    naročnik: '',
    telefon: '',
    email: '',
    zadeva: '',
    'sporočilo naročila': ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Pripravi email vsebino
    const emailSubject = `Naročilo ponudbe: ${formData.zadeva}`
    const emailBody = `
Naročilo ponudbe

Naročnik: ${formData.naročnik}
Telefon: ${formData.telefon}
E-naslov: ${formData.email}

Zadeva: ${formData.zadeva}

Sporočilo naročila:
${formData['sporočilo naročila']}

Pošiljam z aplikacije Standario.
    `.trim()

    // Ustvari mailto link
    const mailtoLink = `mailto:info@standario.si?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Odpri email klienta
    window.location.href = mailtoLink

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Naročilo ponudbe</h1>
            <p className="text-text-tertiary">Formular za naročilo ponudbe</p>
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
                  Zadeva *
                </label>
                <input
                  type="text"
                  name="zadeva"
                  value={formData.zadeva}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sporočilo naročila */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Sporočilo naročila</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-2">
                  Sporočilo naročila *
                </label>
                <textarea
                  name="sporočilo naročila"
                  value={formData['sporočilo naročila']}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                  placeholder="Podrobno opišite vaše zahteve, tehnične specifikacije, časovne okvire ali druge pomembne informacije..."
                />
              </div>
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
                  Pošlji naročilo ponudbe
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-bg-near-black rounded-lg border border-border-subtle">
          <p className="text-sm text-text-tertiary">
            <strong>Opomba:</strong> Po kliku na "Pošlji naročilo ponudbe" se bo odprl vaš privzeti email odjemalec z vnaprej izpolnjeno vsebino. 
            Pošljite email za dokončanje pošiljanja.
          </p>
        </div>
      </div>
    </div>
  )
}