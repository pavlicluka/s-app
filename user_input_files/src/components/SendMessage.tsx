import React, { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

export default function SendMessage() {
  const [formData, setFormData] = useState({
    naročnik: '',
    telefon: '',
    email: '',
    zadeva: '',
    sporočilo: ''
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
    const emailSubject = `Sporočilo: ${formData.zadeva}`
    const emailBody = `
Sporočilo preko kontaktnega obrazca

Naročnik: ${formData.naročnik}
Telefon: ${formData.telefon}
E-naslov: ${formData.email}

Zadeva: ${formData.zadeva}

Sporočilo:
${formData.sporočilo}

---
Poslano preko Standario kontaktnega obrazca
    `.trim()

    // Odpri email odjemalca
    const mailtoLink = `mailto:info@nis2.si?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoLink

    setTimeout(() => {
      setIsSubmitting(false)
      // Reset obrazca
      setFormData({
        naročnik: '',
        telefon: '',
        email: '',
        zadeva: '',
        sporočilo: ''
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Pošljite sporočilo</h1>
              <p className="text-text-secondary mt-1">
                Pošljite nam sporočilo in odgovorili bomimo v najkrajšem možnem času.
              </p>
            </div>
          </div>
        </div>

        {/* Obrazec */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Osnovni podatki */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="naročnik" className="block text-sm font-medium text-text-secondary mb-2">
                  Naročnik *
                </label>
                <input
                  type="text"
                  id="naročnik"
                  name="naročnik"
                  required
                  value={formData.naročnik}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                  placeholder="Vnesite vaše ime in priimek ali naziv podjetja"
                />
              </div>

              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-text-secondary mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                  placeholder="Vnesite vašo telefonsko številko"
                />
              </div>
            </div>

            {/* Email in zadeva */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  E-naslov *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                  placeholder="Vnesite vaš e-naslov"
                />
              </div>

              <div>
                <label htmlFor="zadeva" className="block text-sm font-medium text-text-secondary mb-2">
                  Zadeva *
                </label>
                <input
                  type="text"
                  id="zadeva"
                  name="zadeva"
                  required
                  value={formData.zadeva}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                  placeholder="Kratek opis teme vašega sporočila"
                />
              </div>
            </div>

            {/* Sporočilo */}
            <div>
              <label htmlFor="sporočilo" className="block text-sm font-medium text-text-secondary mb-2">
                Sporočilo *
              </label>
              <textarea
                id="sporočilo"
                name="sporočilo"
                required
                rows={8}
                value={formData.sporočilo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200 resize-vertical"
                placeholder="Vnesite vaše sporočilo..."
              />
            </div>

            {/* Submit gumb */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full md:w-auto px-8 py-3 rounded-sm font-medium text-white
                  flex items-center justify-center gap-2 transition-all duration-200
                  ${isSubmitting
                    ? 'bg-bg-disabled cursor-not-allowed'
                    : 'bg-accent-primary hover:bg-accent-primary/90 focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Pošiljanje...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Pošlji sporočilo
                  </>
                )}
              </button>
            </div>

            {/* Informacije */}
            <div className="bg-bg-secondary border border-border-subtle rounded-sm p-4 mt-6">
              <p className="text-sm text-text-secondary">
                <strong>Opomba:</strong> Po kliku na "Pošlji sporočilo" se bo odprl vaš privzeti email odjemalec 
                s predizpolnjenimi podatki. Če se to ne zgodi, nam pišite na{' '}
                <a href="mailto:info@nis2.si" className="text-accent-primary hover:underline">
                  info@nis2.si
                </a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
