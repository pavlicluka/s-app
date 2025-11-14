import React from 'react'
import { Monitor, BookOpen, Settings, FileText, ArrowRight } from 'lucide-react'

interface ServicesOrderOverviewProps {
  onNavigate: (page: string) => void
}

export default function ServicesOrderOverview({ onNavigate }: ServicesOrderOverviewProps) {
  const serviceOptions = [
    {
      id: 'it-security-tests-order',
      title: 'Naročilo IT-testov',
      description: 'Naročite različne varnostne teste in preverjanja vaših IT sistemov.',
      icon: Monitor,
      color: 'bg-blue-500'
    },
    {
      id: 'education-order',
      title: 'Naročilo izobraževanja',
      description: 'Naročite usposabljanja in izobraževanja za vaše zaposlene.',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      id: 'it-services-order',
      title: 'Naročilo IT-storitev',
      description: 'Naročite različne IT storitve in tehnično podporo.',
      icon: Settings,
      color: 'bg-purple-500'
    },
    {
      id: 'services-quote-order',
      title: 'Naročilo ponudbe',
      description: 'Naročite prilagojeno ponudbo za vaše specifične potrebe.',
      icon: FileText,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Naročilo storitev</h1>
            <p className="text-text-tertiary">Izberite vrsto storitve, ki jo želite naročiti</p>
          </div>
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Settings className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceOptions.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.id}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6 hover:bg-bg-surface-hover transition-all duration-200 cursor-pointer group"
              onClick={() => onNavigate(service.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-accent-primary transition-colors duration-200" />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors duration-200">
                {service.title}
              </h3>

              <p className="text-text-secondary mb-4 text-sm">
                {service.description}
              </p>

              <div className="mt-4 pt-4 border-t border-border-subtle">
                <button className="w-full text-left text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors duration-200">
                  Kliknite za naročilo →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Kako deluje naročilo storitev?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <span className="text-accent-primary font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Izpolnite obrazec</p>
              <p className="text-text-tertiary">Navedite vaše zahteve in potrebe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <span className="text-accent-primary font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Prejmite odgovor</p>
              <p className="text-text-tertiary">Kontaktirali vas bomo v 24 urah</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <span className="text-accent-primary font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Izvedba storitve</p>
              <p className="text-text-tertiary">Po dogovoru izvedemo storitev</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}