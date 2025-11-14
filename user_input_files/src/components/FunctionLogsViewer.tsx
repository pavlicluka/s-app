import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Copy, Download, RefreshCw, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FunctionLog {
  id: string
  created_at: string
  function_name: string
  execution_time_ms?: number
  status_code?: number
  error_message?: string
  logs?: string
  [key: string]: any
}

interface FunctionLogsViewerProps {
  functionName: string
  isOpen: boolean
  onClose: () => void
}

export default function FunctionLogsViewer({
  functionName,
  isOpen,
  onClose
}: FunctionLogsViewerProps) {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<FunctionLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<string[]>([])
  const [hoursBack, setHoursBack] = useState(24)
  const [limit, setLimit] = useState(100)

  async function fetchLogs() {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No active session')
      }

      const { data, error: invokeError } = await supabase.functions.invoke('get-function-logs', {
        body: {
          functionName,
          hoursBack,
          limit
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (invokeError) {
        throw invokeError
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setLogs(data?.data || [])
      toast.success(`Loaded ${data?.count || 0} logs`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load logs'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Error fetching logs:', err)
    } finally {
      setLoading(false)
    }
  }

  async function downloadLogsAsJSON() {
    try {
      const logsJSON = JSON.stringify(logs, null, 2)
      const blob = new Blob([logsJSON], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${functionName}-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Logs downloaded as JSON')
    } catch (err) {
      toast.error('Failed to download logs')
      console.error('Download error:', err)
    }
  }

  async function copyAllLogsToClipboard() {
    try {
      const logsJSON = JSON.stringify(logs, null, 2)
      await navigator.clipboard.writeText(logsJSON)
      toast.success('Logs copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy logs')
      console.error('Copy error:', err)
    }
  }

  async function copyLogToClipboard(log: FunctionLog) {
    try {
      const logJSON = JSON.stringify(log, null, 2)
      await navigator.clipboard.writeText(logJSON)
      toast.success('Log entry copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy log')
    }
  }

  function toggleLogExpanded(logId: string) {
    setExpandedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  function formatLogContent(content: any): string {
    if (typeof content === 'string') return content
    try {
      return JSON.stringify(content, null, 2)
    } catch {
      return String(content)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-h-[90vh] bg-bg-surface rounded-t-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border-subtle p-4 flex items-center justify-between bg-bg-near-black">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Function Logs Viewer</h2>
            <p className="text-sm text-text-secondary mt-1">Function: <code className="font-mono bg-bg-surface px-2 py-1 rounded">{functionName}</code></p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-surface rounded transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="border-b border-border-subtle p-4 space-y-3 bg-bg-near-black">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Hours back:
              </label>
              <select
                value={hoursBack}
                onChange={(e) => setHoursBack(Number(e.target.value))}
                className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={72}>Last 72 hours</option>
                <option value={168}>Last 7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Limit:
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={limit}
                onChange={(e) => setLimit(Math.min(Number(e.target.value), 500))}
                className="px-3 py-2 bg-bg-surface border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none w-20"
              />
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:opacity-50 text-white rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Load Logs
            </button>

            {logs.length > 0 && (
              <>
                <button
                  onClick={copyAllLogsToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                  title="Copy all logs as JSON"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>

                <button
                  onClick={downloadLogsAsJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors"
                  title="Download logs as JSON file"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-risk-high/10 border-b border-risk-high/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-primary font-medium">Error loading logs</p>
              <p className="text-sm text-text-secondary mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Logs Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {logs.length === 0 && !loading && (
            <div className="text-center py-12 text-text-secondary">
              {logs.length === 0 && !error ? 'Click "Load Logs" to fetch function logs' : 'No logs found'}
            </div>
          )}

          {logs.map((log, idx) => {
            const logId = `log-${idx}-${log.id}`
            const isExpanded = expandedLogs.includes(logId)
            const hasError = log.error_message || log.status_code?.toString().startsWith('4') || log.status_code?.toString().startsWith('5')

            return (
              <div
                key={logId}
                className={`rounded border ${
                  hasError
                    ? 'border-risk-high/30 bg-risk-high/5'
                    : 'border-border-subtle bg-bg-near-black'
                } overflow-hidden transition-colors hover:bg-bg-surface`}
              >
                <button
                  onClick={() => toggleLogExpanded(logId)}
                  className="w-full flex items-start justify-between p-3 text-left gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          hasError
                            ? 'bg-risk-high/20 text-risk-high'
                            : 'bg-green-500/15 text-green-400'
                        }`}>
                          {log.status_code || 'OK'}
                        </span>
                        <span className="text-xs text-text-tertiary font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                        {log.execution_time_ms && (
                          <span className="text-xs text-text-tertiary">
                            {log.execution_time_ms}ms
                          </span>
                        )}
                      </div>
                      {hasError && log.error_message && (
                        <p className="text-xs text-risk-high truncate">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyLogToClipboard(log)
                    }}
                    className="p-1 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-secondary flex-shrink-0"
                    title="Copy this log entry"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border-subtle p-3 bg-bg-surface max-h-96 overflow-y-auto">
                    <pre className="text-xs font-mono text-text-tertiary whitespace-pre-wrap break-words">
                      {formatLogContent({
                        id: log.id,
                        created_at: log.created_at,
                        function_name: log.function_name,
                        status_code: log.status_code,
                        execution_time_ms: log.execution_time_ms,
                        error_message: log.error_message,
                        logs: log.logs,
                        ...Object.entries(log).reduce((acc, [key, value]) => {
                          if (!['id', 'created_at', 'function_name', 'status_code', 'execution_time_ms', 'error_message', 'logs'].includes(key)) {
                            acc[key] = value
                          }
                          return acc
                        }, {} as Record<string, any>)
                      })}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {logs.length > 0 && (
          <div className="border-t border-border-subtle p-4 bg-bg-near-black text-center text-sm text-text-secondary">
            Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
