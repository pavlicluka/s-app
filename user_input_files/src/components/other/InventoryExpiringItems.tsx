import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AlertTriangle, Package, Key, Calendar, ArrowRight } from 'lucide-react'

interface ExpiringItem {
  id: string
  naziv: string
  tip: 'Programska oprema' | 'Licenca'
  datum_poteka: string
  dnevi_do_poteka: number
  additional_info?: string
  original_record: any
}

export default function InventoryExpiringItems() {
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpiringItems()
  }, [])

  const fetchExpiringItems = async () => {
    try {
      const now = new Date()
      const items: ExpiringItem[] = []

      // Pridobi licence z expiry_date
      const { data: licenses, error: licensesError } = await supabase
        .from('inventory_licenses')
        .select('*')
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })

      if (!licensesError && licenses) {
        licenses.forEach((license) => {
          const expiryDate = new Date(license.expiry_date)
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          // Dodaj samo zapise, ki potečejo v prihodnosti (ali so že potekli v zadnjih 7 dneh)
          if (daysUntilExpiry >= -7) {
            items.push({
              id: license.id,
              naziv: license.software_name || 'Neimenovana licenca',
              tip: 'Licenca',
              datum_poteka: license.expiry_date,
              dnevi_do_poteka: daysUntilExpiry,
              additional_info: license.license_key ? `Ključ: ${license.license_key.slice(-4)}` : undefined,
              original_record: license
            })
          }
        })
      }

      // Pridobi programsko opremo z renewal_date in support_expiry
      const { data: software, error: softwareError } = await supabase
        .from('inventory_software')
        .select('*')

      if (!softwareError && software) {
        software.forEach((sw) => {
          // Preveri renewal_date
          if (sw.renewal_date) {
            const renewalDate = new Date(sw.renewal_date)
            const daysUntilRenewal = Math.floor((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysUntilRenewal >= -7) {
              items.push({
                id: `${sw.id}_renewal`,
                naziv: sw.software_name || 'Neimenovana programska oprema',
                tip: 'Programska oprema',
                datum_poteka: sw.renewal_date,
                dnevi_do_poteka: daysUntilRenewal,
                additional_info: `Podaljšanje | ${sw.vendor || 'Brez prodajalca'}`,
                original_record: sw
              })
            }
          }

          // Preveri support_expiry
          if (sw.support_expiry) {
            const supportExpiryDate = new Date(sw.support_expiry)
            const daysUntilSupportExpiry = Math.floor((supportExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysUntilSupportExpiry >= -7) {
              items.push({
                id: `${sw.id}_support`,
                naziv: sw.software_name || 'Neimenovana programska oprema',
                tip: 'Programska oprema',
                datum_poteka: sw.support_expiry,
                dnevi_do_poteka: daysUntilSupportExpiry,
                additional_info: `Podpora | ${sw.vendor || 'Brez prodajalca'}`,
                original_record: sw
              })
            }
          }
        })
      }

      // Razvrsti po dnevih do poteka (najprej najbližji) in vzemi samo prvih 5
      const sortedItems = items
        .sort((a, b) => a.dnevi_do_poteka - b.dnevi_do_poteka)
        .slice(0, 5)

      setExpiringItems(sortedItems)
    } catch (error) {
      console.error('Napaka pri pridobivanju zapisov:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return {
        text: 'Poteklo',
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: AlertTriangle
      }
    } else if (daysUntilExpiry <= 7) {
      return {
        text: 'Nujno',
        className: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: AlertTriangle
      }
    } else if (daysUntilExpiry <= 14) {
      return {
        text: 'Kritično',
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        icon: AlertTriangle
      }
    } else if (daysUntilExpiry <= 30) {
      return {
        text: 'Opozorilo',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        icon: Calendar
      }
    } else {
      return {
        text: 'Prihajajoče',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        icon: Calendar
      }
    }
  }

  const getRowClassName = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return 'bg-red-500/5 border-l-4 border-red-500'
    } else if (daysUntilExpiry <= 7) {
      return 'bg-red-500/5 border-l-4 border-red-500'
    } else if (daysUntilExpiry <= 14) {
      return 'bg-orange-500/5 border-l-4 border-orange-500'
    } else if (daysUntilExpiry <= 30) {
      return 'bg-yellow-500/5 border-l-4 border-yellow-500'
    }
    return ''
  }

  const formatDaysUntilExpiry = (days: number) => {
    if (days < 0) {
      return `Poteklo pred ${Math.abs(days)} dnevi`
    } else if (days === 0) {
      return 'Poteče danes'
    } else if (days === 1) {
      return '1 dan'
    } else if (days === 2) {
      return '2 dneva'
    } else if (days === 3 || days === 4) {
      return `${days} dnevi`
    } else {
      return `${days} dni`
    }
  }

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-sm border border-border-subtle p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-pure-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Veljavnost programske opreme in licenc</h2>
            <p className="text-body-sm text-text-secondary">Seznam preteklih ali kmalu preteklih licenc</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {expiringItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Naziv</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Tip</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Datum poteka</th>
                <th className="text-right px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dnevi do poteka</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">Dodatne informacije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {expiringItems.map((item) => {
                const urgency = getUrgencyBadge(item.dnevi_do_poteka)
                const Icon = urgency.icon
                const TypeIcon = item.tip === 'Licenca' ? Key : Package

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-bg-surface-hover transition-colors duration-150 ${getRowClassName(item.dnevi_do_poteka)}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-caption font-medium border ${urgency.className} flex items-center gap-1.5 w-fit`}>
                        <Icon className="w-3.5 h-3.5" />
                        {urgency.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-body text-text-primary font-medium">{item.naziv}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-text-tertiary" />
                        <span className="text-body text-text-secondary">{item.tip}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body text-text-primary">
                        {new Date(item.datum_poteka).toLocaleDateString('sl-SI', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <span className={`text-body font-medium ${
                          item.dnevi_do_poteka < 0 
                            ? 'text-red-400' 
                            : item.dnevi_do_poteka <= 7 
                              ? 'text-red-400' 
                              : item.dnevi_do_poteka <= 14
                                ? 'text-orange-400'
                                : item.dnevi_do_poteka <= 30
                                  ? 'text-yellow-400'
                                  : 'text-text-secondary'
                        }`}>
                          {formatDaysUntilExpiry(item.dnevi_do_poteka)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body-sm text-text-tertiary">{item.additional_info || '-'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-heading-md font-semibold text-text-primary mb-1">Ni podatkov o poteklih licencah</h3>
              <p className="text-body-sm text-text-secondary">Trenutno ni programske opreme oziroma licenc, ki so ali bodo kmalu potekle.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
