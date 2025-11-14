import { useState, useEffect, useCallback } from 'react'

// Types for Emsisoft API
export interface EmsisoftWorkstation {
  id: string
  name: string
  ipAddress: string
  os: string
  status: 'online' | 'offline' | 'maintenance'
  lastSeen: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  agentVersion: string
  lastScan: string
  location: string
  workspaceId?: string
  groupName?: string
  lastUser?: string
  loggedInUser?: string
}

export interface EmsisoftEvent {
  id: string
  workstationId: string
  workstationName: string
  timestamp: string
  type: 'threat' | 'scan' | 'update' | 'connection' | 'malware' | 'behavior'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  status: 'pending' | 'investigating' | 'resolved' | 'false-positive'
  category?: string
  threatName?: string
  filePath?: string
  action?: string
}

export interface EmsisoftScanTask {
  id: string
  workstationId: string
  workstationName: string
  type: 'full' | 'quick' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  threatsFound: number
  filesScanned: number
  scanProgress?: number
  errors?: string[]
}

export interface EmsisoftLicenseInfo {
  id: string
  product: string
  license: string
  seats: number
  used: number
  expires: string
  status: 'active' | 'expired' | 'suspended'
}

// API Configuration
const EMSISOFT_API_BASE = 'https://api.emsisoft.com'
const API_KEY = '9A87433105664647B3BB35C7187A2B0A' // Emsisoft API Key

// API client with error handling
class EmsisoftAPIClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = EMSISOFT_API_BASE) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Api-Key': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error?.message || 
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Emsisoft API Error:', error)
      throw error
    }
  }

  // Get all workstations in workspace
  async getWorkstations(workspaceId: string): Promise<EmsisoftWorkstation[]> {
    try {
      const response = await this.makeRequest(`/v1/workspaces/${workspaceId}/endpoints`)
      return this.transformWorkstations(response)
    } catch (error) {
      console.error('Failed to fetch workstations:', error)
      // Return empty array on error to prevent app crash
      return []
    }
  }

  // Get events/threats for a workspace
  async getEvents(workspaceId: string, limit: number = 100): Promise<EmsisoftEvent[]> {
    try {
      const response = await this.makeRequest(
        `/v1/workspaces/${workspaceId}/events?limit=${limit}&sort=desc&order=timestamp`
      )
      return this.transformEvents(response)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return []
    }
  }

  // Start a scan on a workstation
  async startScan(workstationId: string, scanType: 'full' | 'quick' | 'custom'): Promise<EmsisoftScanTask> {
    try {
      const payload = {
        type: scanType,
        parameters: scanType === 'custom' ? {
          scanPaths: ['C:\\', 'D:\\'],
          excludePaths: ['C:\\Windows\\Temp'],
          scanArchives: true,
          scanMemory: true
        } : undefined
      }

      const response = await this.makeRequest(
        `/v1/endpoints/${workstationId}/scan`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )
      return this.transformScanTask(response)
    } catch (error) {
      console.error('Failed to start scan:', error)
      throw error
    }
  }

  // Get scan status
  async getScanStatus(scanId: string): Promise<EmsisoftScanTask> {
    try {
      const response = await this.makeRequest(`/v1/scans/${scanId}`)
      return this.transformScanTask(response)
    } catch (error) {
      console.error('Failed to get scan status:', error)
      throw error
    }
  }

  // Get license information
  async getLicenseInfo(): Promise<EmsisoftLicenseInfo[]> {
    try {
      const response = await this.makeRequest('/v1/licenses')
      return this.transformLicenses(response)
    } catch (error) {
      console.error('Failed to fetch license info:', error)
      return []
    }
  }

  // Update workstation configuration
  async updateWorkstation(workstationId: string, config: any): Promise<void> {
    try {
      await this.makeRequest(
        `/v1/endpoints/${workstationId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(config)
        }
      )
    } catch (error) {
      console.error('Failed to update workstation:', error)
      throw error
    }
  }

  // Send remote command to workstation
  async sendRemoteCommand(workstationId: string, command: string): Promise<void> {
    try {
      await this.makeRequest(
        `/v1/endpoints/${workstationId}/command`,
        {
          method: 'POST',
          body: JSON.stringify({ command })
        }
      )
    } catch (error) {
      console.error('Failed to send remote command:', error)
      throw error
    }
  }

  // Transform API responses to our internal format
  private transformWorkstations(data: any[]): EmsisoftWorkstation[] {
    return data.map(item => ({
      id: item.guid || item.id,
      name: item.computerName || item.name,
      ipAddress: item.ipAddress || 'N/A',
      os: item.operatingSystem || 'Unknown',
      status: this.mapWorkstationStatus(item.onlineStatus),
      lastSeen: item.lastSeen || item.lastCommunication,
      threatLevel: this.mapThreatLevel(item.riskLevel),
      agentVersion: item.agentVersion || 'Unknown',
      lastScan: item.lastScan || 'Never',
      location: item.location || 'Unknown',
      workspaceId: item.workspaceId,
      groupName: item.groupName,
      lastUser: item.lastUser,
      loggedInUser: item.loggedInUser
    }))
  }

  private transformEvents(data: any[]): EmsisoftEvent[] {
    return data.map(item => ({
      id: item.guid || item.id,
      workstationId: item.endpointId || item.workstationId,
      workstationName: item.computerName || 'Unknown',
      timestamp: item.timestamp || item.dateTime,
      type: this.mapEventType(item.eventType),
      severity: this.mapEventSeverity(item.severity),
      title: item.title || this.getEventTitle(item),
      description: item.description || '',
      status: this.mapEventStatus(item.status),
      category: item.category,
      threatName: item.threatName,
      filePath: item.filePath,
      action: item.action
    }))
  }

  private transformScanTask(data: any): EmsisoftScanTask {
    return {
      id: data.guid || data.id,
      workstationId: data.endpointId || data.workstationId,
      workstationName: data.computerName || 'Unknown',
      type: data.scanType,
      status: this.mapScanStatus(data.status),
      startedAt: data.startedAt || data.dateTime,
      completedAt: data.completedAt,
      threatsFound: data.threatsFound || 0,
      filesScanned: data.filesScanned || 0,
      scanProgress: data.progress,
      errors: data.errors
    }
  }

  private transformLicenses(data: any[]): EmsisoftLicenseInfo[] {
    return data.map(item => ({
      id: item.id,
      product: item.product,
      license: item.license,
      seats: item.seats,
      used: item.used,
      expires: item.expires,
      status: item.status
    }))
  }

  // Helper methods for mapping
  private mapWorkstationStatus(status: string): 'online' | 'offline' | 'maintenance' {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
        return 'online'
      case 'maintenance':
        return 'maintenance'
      default:
        return 'offline'
    }
  }

  private mapThreatLevel(level: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'low'
      case 'medium':
        return 'medium'
      case 'high':
        return 'high'
      case 'critical':
        return 'critical'
      default:
        return 'low'
    }
  }

  private mapEventType(type: string): 'threat' | 'scan' | 'update' | 'connection' | 'malware' | 'behavior' {
    switch (type?.toLowerCase()) {
      case 'malware':
      case 'threat':
        return 'threat'
      case 'scan':
        return 'scan'
      case 'update':
        return 'update'
      case 'connection':
        return 'connection'
      case 'behavior':
        return 'behavior'
      default:
        return 'update'
    }
  }

  private mapEventSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'low'
      case 'medium':
        return 'medium'
      case 'high':
        return 'high'
      case 'critical':
        return 'critical'
      default:
        return 'low'
    }
  }

  private mapEventStatus(status: string): 'pending' | 'investigating' | 'resolved' | 'false-positive' {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'investigating':
        return 'investigating'
      case 'resolved':
      case 'closed':
        return 'resolved'
      case 'false-positive':
        return 'false-positive'
      default:
        return 'pending'
    }
  }

  private mapScanStatus(status: string): 'pending' | 'running' | 'completed' | 'failed' {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'running':
        return 'running'
      case 'completed':
        return 'completed'
      case 'failed':
        return 'failed'
      default:
        return 'pending'
    }
  }

  private getEventTitle(item: any): string {
    if (item.eventType) {
      switch (item.eventType.toLowerCase()) {
        case 'malware':
          return 'Zaznana grožnja'
        case 'scan':
          return 'Skeniranje'
        case 'update':
          return 'Posodobitev'
        case 'connection':
          return 'Omrežna povezava'
        default:
          return 'Varnostni dogodek'
      }
    }
    return 'Varnostni dogodek'
  }
}

// React hook for Emsisoft API
export function useEmsisoftAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [client] = useState(() => new EmsisoftAPIClient(API_KEY))

  // Clear error on new operations
  const clearError = useCallback(() => setError(null), [])

  // Fetch workstations
  const fetchWorkstations = useCallback(async (workspaceId: string): Promise<EmsisoftWorkstation[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const workstations = await client.getWorkstations(workspaceId)
      return workstations
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri pridobivanju delovnih postaj'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [client])

  // Fetch events
  const fetchEvents = useCallback(async (workspaceId: string, limit?: number): Promise<EmsisoftEvent[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const events = await client.getEvents(workspaceId, limit)
      return events
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri pridobivanju dogodkov'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [client])

  // Start scan
  const startScan = useCallback(async (workstationId: string, scanType: 'full' | 'quick' | 'custom'): Promise<EmsisoftScanTask | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const scanTask = await client.startScan(workstationId, scanType)
      return scanTask
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri zagonu skeniranja'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  // Get scan status
  const getScanStatus = useCallback(async (scanId: string): Promise<EmsisoftScanTask | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await client.getScanStatus(scanId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri pridobivanju statusa skeniranja'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  // Send remote command
  const sendRemoteCommand = useCallback(async (workstationId: string, command: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await client.sendRemoteCommand(workstationId, command)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri pošiljanju ukaza'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [client])

  // Update workstation
  const updateWorkstation = useCallback(async (workstationId: string, config: any): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await client.updateWorkstation(workstationId, config)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Napaka pri posodabljanju delovne postaje'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return {
    isLoading,
    error,
    clearError,
    fetchWorkstations,
    fetchEvents,
    startScan,
    getScanStatus,
    sendRemoteCommand,
    updateWorkstation
  }
}

// Hook for demo mode (uses mock data)
export function useEmsisoftDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock workstations data
  const demoWorkstations: EmsisoftWorkstation[] = [
    {
      id: '1',
      name: 'WIN10-DESKTOP-001',
      ipAddress: '192.168.1.101',
      os: 'Windows 10 Pro',
      status: 'online',
      lastSeen: '2025-11-09T20:25:00Z',
      threatLevel: 'low',
      agentVersion: '2025.1.0.1200',
      lastScan: '2025-11-09T18:30:00Z',
      location: 'Urad Ljubljana'
    },
    {
      id: '2',
      name: 'WIN10-LAPTOP-002',
      ipAddress: '192.168.1.102',
      os: 'Windows 10 Enterprise',
      status: 'online',
      lastSeen: '2025-11-09T20:24:00Z',
      threatLevel: 'medium',
      agentVersion: '2025.1.0.1200',
      lastScan: '2025-11-09T19:15:00Z',
      location: 'Mobilna enota'
    }
  ]

  const clearError = useCallback(() => setError(null), [])

  const fetchWorkstations = useCallback(async (workspaceId: string): Promise<EmsisoftWorkstation[]> => {
    setIsLoading(true)
    setError(null)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    return demoWorkstations
  }, [])

  const fetchEvents = useCallback(async (workspaceId: string, limit?: number): Promise<EmsisoftEvent[]> => {
    setIsLoading(true)
    setError(null)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setIsLoading(false)
    return []
  }, [])

  const startScan = useCallback(async (workstationId: string, scanType: 'full' | 'quick' | 'custom'): Promise<EmsisoftScanTask | null> => {
    setIsLoading(true)
    setError(null)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    
    return {
      id: Date.now().toString(),
      workstationId,
      workstationName: demoWorkstations.find(w => w.id === workstationId)?.name || 'Unknown',
      type: scanType,
      status: 'running',
      startedAt: new Date().toISOString(),
      threatsFound: 0,
      filesScanned: 0
    }
  }, [])

  const getScanStatus = useCallback(async (scanId: string): Promise<EmsisoftScanTask | null> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return null
  }, [])

  const sendRemoteCommand = useCallback(async (workstationId: string, command: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }, [])

  const updateWorkstation = useCallback(async (workstationId: string, config: any): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }, [])

  return {
    isLoading,
    error,
    clearError,
    fetchWorkstations,
    fetchEvents,
    startScan,
    getScanStatus,
    sendRemoteCommand,
    updateWorkstation
  }
}