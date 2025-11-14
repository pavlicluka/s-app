import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Clock, Bell, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ReminderAlert {
  breach_id: string
  urgency_status: 'normal' | 'warning' | 'urgent' | 'overdue'
  time_remaining_hours: number
  breach_date: string
  reminder_count: number
  last_reminder_sent?: string
  severity: string
  notification_count: number
}

interface ReminderSystemProps {
  className?: string
}

export function GDPRReminderSystem({ className = '' }: ReminderSystemProps) {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState<ReminderAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)

  const fetchReminderAlerts = async () => {
    try {
      setLoading(true)
      
      // Get incidents with urgency status
      const { data: incidents, error } = await supabase
        .from('gdpr_data_breach_log')
        .select(`
          breach_id,
          urgency_status,
          breach_date,
          severity,
          reminder_count,
          notification_count,
          last_reminder_sent,
          created_at,
          updated_at
        `)
        .or('urgency_status.eq.warning,urgency_status.eq.urgent,urgency_status.eq.overdue')
        .neq('status', 'closed')
        .order('breach_date', { ascending: false })

      if (error) throw error

      if (!incidents || incidents.length === 0) {
        setAlerts([])
        return
      }

      // Calculate time remaining for each incident
      const alertsWithTime = incidents.map(incident => {
        const breachDate = new Date(incident.breach_date)
        const now = new Date()
        const deadline = new Date(breachDate.getTime() + (72 * 60 * 60 * 1000))
        const timeRemainingHours = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))

        return {
          ...incident,
          time_remaining_hours: timeRemainingHours
        } as ReminderAlert
      }).filter(alert => alert.time_remaining_hours > -24) // Remove incidents that are very overdue

      setAlerts(alertsWithTime)
    } catch (error) {
      console.error('Error fetching reminder alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'urgent': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default: return 'text-green-400 bg-green-500/10 border-green-500/30'
    }
  }

  const getUrgencyIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="w-5 h-5" />
      case 'urgent': return <Clock className="w-5 h-5" />
      case 'warning': return <Bell className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  const getUrgencyMessage = (alert: ReminderAlert) => {
    if (alert.time_remaining_hours <= 0) {
      return t('gdpr.reminder.deadlineExceeded', {
        hours: Math.abs(alert.time_remaining_hours),
        incidentId: alert.breach_id
      })
    } else if (alert.time_remaining_hours <= 24) {
      return t('gdpr.reminder.urgentWarning', {
        hours: alert.time_remaining_hours,
        incidentId: alert.breach_id
      })
    } else if (alert.time_remaining_hours <= 48) {
      return t('gdpr.reminder.generalWarning', {
        hours: alert.time_remaining_hours,
        incidentId: alert.breach_id
      })
    }
    return null
  }

  const triggerManualReminder = async (incidentId: string) => {
    try {
      // Call the reminder system manually for a specific incident
      const { data, error } = await supabase.functions.invoke('gdpr-72hour-reminder', {
        body: { breach_ids: [incidentId] }
      })

      if (error) throw error
      
      // Refresh alerts after manual reminder
      await fetchReminderAlerts()
    } catch (error) {
      console.error('Error triggering manual reminder:', error)
    }
  }

  useEffect(() => {
    fetchReminderAlerts()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchReminderAlerts, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-bg-surface rounded"></div>
          <div className="w-32 h-4 bg-bg-surface rounded"></div>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {/* Alert Summary Bar */}
      <div 
        className="flex items-center justify-between p-3 rounded-lg border bg-bg-surface cursor-pointer hover:bg-bg-surface-hover transition-colors"
        onClick={() => setShowAlerts(!showAlerts)}
      >
        <div className="flex items-center space-x-3">
          <div className={getUrgencyColor(alerts[0].urgency_status)}>
            {getUrgencyIcon(alerts[0].urgency_status)}
          </div>
          <div>
            <span className="text-sm font-medium text-text-primary">
              {t('gdpr.reminder.activeAlerts', { count: alerts.length })}
            </span>
            <span className="text-xs text-text-secondary ml-2">
              {alerts[0].urgency_status === 'overdue' 
                ? t('gdpr.reminder.deadlineOverdue')
                : t('gdpr.reminder.deadlineApproaching')
              }
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Detailed Alerts List */}
      {showAlerts && (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => {
            const message = getUrgencyMessage(alert)
            if (!message) return null

            return (
              <div 
                key={alert.breach_id}
                className={`p-4 rounded-lg border ${getUrgencyColor(alert.urgency_status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getUrgencyIcon(alert.urgency_status)}
                      <span className="font-medium">{alert.breach_id}</span>
                      <span className="text-xs px-2 py-1 bg-bg-near-black rounded">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm">{message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span>
                        {t('gdpr.reminder.breachDate')}: {new Date(alert.breach_date).toLocaleDateString('sl-SI')}
                      </span>
                      {alert.last_reminder_sent && (
                        <span>
                          {t('gdpr.reminder.lastReminder')}: {new Date(alert.last_reminder_sent).toLocaleString('sl-SI')}
                        </span>
                      )}
                      <span>
                        {t('gdpr.reminder.reminderCount')}: {alert.reminder_count}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerManualReminder(alert.breach_id)}
                    className="text-xs px-3 py-1 bg-accent-primary text-white rounded hover:bg-accent-primary/80 transition-colors"
                  >
                    {t('gdpr.reminder.sendReminder')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GDPRReminderSystem