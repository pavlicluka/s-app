// Enhanced Super Admin page with Organizations and Users management
import { 
  UserCog, 
  Users, 
  Shield, 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Filter,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Bug,
  Copy,
  Trash as TrashIcon,
  FileText
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import DataTable from './DataTable'
import Modal from './common/Modal'
import FunctionLogsViewer from './FunctionLogsViewer'

interface DebugResponse {
  timestamp: string
  functionName: 'admin-users' | 'admin-organizations'
  request: any
  response: any
  status: 'success' | 'error'
  duration: number
}

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  subscription_tier: string
  is_active: boolean
  created_at: string
  logo_url?: string
  settings?: any
  user_count?: number
}

interface User extends Profile {
  organization_id?: string
  module_permissions?: {
    nis2?: boolean
    iso27001?: boolean
    gdpr?: boolean
    zzpri?: boolean
    ai_act?: boolean
    misp?: boolean
    soc?: boolean
    incidents?: boolean
    inventory?: boolean
    policies?: boolean
    education?: boolean
    support?: boolean
  }
}

type TabType = 'users' | 'organizations'

export default function SuperAdminPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  
  // Check if debug panel is enabled via environment variable
  const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true'
  
  // Common state
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('users')
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [usersError, setUsersError] = useState<string | null>(null)
  
  // Organizations state  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([])
  const [orgsError, setOrgsError] = useState<string | null>(null)
  
  // Retry tracking
  const [usersRetrying, setUsersRetrying] = useState(false)
  const [orgsRetrying, setOrgsRetrying] = useState(false)
  
  // Debug state
  const [debugResponses, setDebugResponses] = useState<DebugResponse[]>([])
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [expandedDebugItems, setExpandedDebugItems] = useState<string[]>([])
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [organizationFilter, setOrganizationFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  
  // Modals
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditOrgModal, setShowEditOrgModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Partial<Organization> | null>(null)
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null)
  
  // Logs viewer
  const [showLogsViewer, setShowLogsViewer] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState('admin-users')
  
  // Form state
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    slug: '',
    description: '',
    subscription_tier: 'free'
  })
  
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    organization_id: ''
  })

  // Debug helper function - only capture if debug is enabled
  const captureDebugResponse = (
    functionName: 'admin-users' | 'admin-organizations',
    request: any,
    response: any,
    status: 'success' | 'error',
    duration: number
  ) => {
    if (!isDebugEnabled) return
    
    const debugItem: DebugResponse = {
      timestamp: new Date().toISOString(),
      functionName,
      request,
      response,
      status,
      duration
    }
    setDebugResponses(prev => [debugItem, ...prev.slice(0, 49)]) // Keep last 50 items
  }

  // Memoize the role loading to avoid warnings
  const memoizedLoadCurrentUserRole = useCallback(() => {
    if (!user) return
    
    let isMounted = true
    
    try {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (isMounted) {
            setCurrentUserRole(data?.role || 'user')
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error('Error loading user role:', error)
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false)
          }
        })
    } catch (error) {
      if (isMounted) {
        console.error('Error loading user role:', error)
        setLoading(false)
      }
    }
    
    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    const cleanup = memoizedLoadCurrentUserRole()
    return cleanup
  }, [memoizedLoadCurrentUserRole])

  // Load data after user role is confirmed and when filters/tabs change
  useEffect(() => {
    if (!currentUserRole || (currentUserRole !== 'super_admin' && currentUserRole !== 'admin')) {
      return
    }
    
    // Load organizations if not already loaded
    if (organizations.length === 0) {
      loadOrganizations(0)
    }
    
    // Load users when tab is active or filters change
    if (activeTab === 'users') {
      loadUsers(0)
    }
  }, [currentUserRole, activeTab, searchQuery, organizationFilter, roleFilter, organizations.length])

  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No active session - please sign in again')
    }
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  // Retry with exponential backoff and better error handling
  async function invokeAdminFunction(functionName: string, body: any, retryCount = 0, signal?: AbortSignal): Promise<any> {
    const MAX_RETRIES = 3
    const INITIAL_DELAY = 500
    
    try {
      const headers = await getAuthHeaders()
      
      // Add timeout for fetch - only create timeout if not provided via signal
      const controller = new AbortController()
      const timeoutId = !signal ? setTimeout(() => controller.abort(), 30000) : undefined // 30 second timeout
      const finalSignal = signal || controller.signal
      
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body,
          headers,
          signal: finalSignal as any
        })
        
        if (timeoutId) clearTimeout(timeoutId)
        
        // If there was an error invoking the function
        if (error) {
          throw error
        }
        
        // If the function returned an error response
        if (data?.error || data?.success === false) {
          throw new Error(data?.error || data?.message || `Function returned error: ${JSON.stringify(data)}`)
        }
        
        return data
      } catch (fetchError) {
        if (timeoutId) clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error: any) {
      // Check if signal was aborted (component unmounted)
      if (signal?.aborted) {
        console.log(`🔴 invokeAdminFunction: Operation aborted (component likely unmounted)`)
        throw new Error('Operation aborted')
      }
      
      const isNetworkError = 
        error?.name === 'FunctionsFetchError' ||
        error?.message?.includes('NetworkError') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('network') ||
        error?.name === 'AbortError'
      
      // Retry on network errors
      if (isNetworkError && retryCount < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, retryCount) // Exponential backoff
        console.log(`Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return invokeAdminFunction(functionName, body, retryCount + 1, signal)
      }
      
      // Don't retry on auth errors
      throw error
    }
  }

  async function loadUsers(retryCount = 0) {
    setUsersLoading(true)
    setUsersError(null)
    const startTime = performance.now()
    const requestData = {
      action: 'list',
      search: searchQuery,
      organization_id: organizationFilter || undefined,
      role: roleFilter || undefined
    }
    
    try {
      const data = await invokeAdminFunction('admin-users', requestData, 0)
      
      const duration = performance.now() - startTime
      captureDebugResponse('admin-users', requestData, { data, error: null }, 'success', duration)
      
      setUsers(data?.data || [])
      setUsersError(null)
    } catch (error: any) {
      console.error('Error loading users:', error)
      
      const duration = performance.now() - startTime
      captureDebugResponse('admin-users', requestData, { error: error?.message }, 'error', duration)
      
      // Determine error type and message
      let errorMessage = ''
      let canRetry = false
      
      if (error?.message?.includes('No active session')) {
        errorMessage = 'Seja je potekla. Prosimo, prijavite se ponovno.'
        canRetry = false
      } else if (error?.name === 'FunctionsFetchError' || error?.message?.includes('NetworkError')) {
        errorMessage = 'Napaka pri povezavi s strežnikom. Preverite internetno povezavo.'
        canRetry = true
      } else if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
        errorMessage = 'Zahtevek je časovno potekel. Prosimo poskusite ponovno.'
        canRetry = true
      } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        errorMessage = 'Napaka pri omrežni povezavi. Prosimo poskusite ponovno.'
        canRetry = true
      } else {
        errorMessage = error?.message || 'Napaka pri nalaganju uporabnikov. Prosimo poskusite ponovno.'
        canRetry = true
      }
      
      setUsersError(errorMessage)
      
      // Manual retry button for users to control
      setUsersRetrying(false)
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadOrganizations(retryCount = 0) {
    setOrgsLoading(true)
    setOrgsError(null)
    const startTime = performance.now()
    const requestData = {
      action: 'list',
      search: searchQuery
    }
    
    try {
      const data = await invokeAdminFunction('admin-organizations', requestData, 0)
      
      const duration = performance.now() - startTime
      captureDebugResponse('admin-organizations', requestData, { data, error: null }, 'success', duration)
      
      setOrganizations(data?.data || [])
      setOrgsError(null)
    } catch (error: any) {
      console.error('Error loading organizations:', error)
      
      const duration = performance.now() - startTime
      captureDebugResponse('admin-organizations', requestData, { error: error?.message }, 'error', duration)
      
      // Determine error type and message
      let errorMessage = ''
      let canRetry = false
      
      if (error?.message?.includes('No active session')) {
        errorMessage = 'Seja je potekla. Prosimo, prijavite se ponovno.'
        canRetry = false
      } else if (error?.name === 'FunctionsFetchError' || error?.message?.includes('NetworkError')) {
        errorMessage = 'Napaka pri povezavi s strežnikom. Preverite internetno povezavo.'
        canRetry = true
      } else if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
        errorMessage = 'Zahtevek je časovno potekel. Prosimo poskusite ponovno.'
        canRetry = true
      } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        errorMessage = 'Napaka pri omrežni povezavi. Prosimo poskusite ponovno.'
        canRetry = true
      } else {
        errorMessage = error?.message || 'Napaka pri nalaganju organizacij. Prosimo poskusite ponovno.'
        canRetry = true
      }
      
      setOrgsError(errorMessage)
      
      // Manual retry button for users to control
      setOrgsRetrying(false)
    } finally {
      setOrgsLoading(false)
    }
  }

  async function createOrganization() {
    try {
      const data = await invokeAdminFunction('admin-organizations', { action: 'create', ...orgFormData })
      
      setShowCreateOrgModal(false)
      setOrgFormData({ name: '', slug: '', description: '', subscription_tier: 'free' })
      loadOrganizations()
    } catch (error: any) {
      console.error('Error creating organization:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri ustvarjanju organizacije: ' + errorMsg)
    }
  }

  async function updateOrganization() {
    if (!editingOrg?.id) return
    
    try {
      const data = await invokeAdminFunction('admin-organizations', { action: 'update', id: editingOrg.id, ...editingOrg })
      
      setShowEditOrgModal(false)
      setEditingOrg(null)
      loadOrganizations()
    } catch (error: any) {
      console.error('Error updating organization:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri posodabljanju organizacije: ' + errorMsg)
    }
  }

  async function deleteOrganization(orgId: string) {
    if (!confirm('Ali ste prepričani, da želite izbrisati to organizacijo?')) return
    
    try {
      const data = await invokeAdminFunction('admin-organizations', { action: 'delete', id: orgId })
      
      loadOrganizations()
    } catch (error: any) {
      console.error('Error deleting organization:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri brisanju organizacije: ' + errorMsg)
    }
  }

  async function createUser() {
    try {
      const data = await invokeAdminFunction('admin-users', { action: 'create', ...userFormData })
      
      setShowCreateUserModal(false)
      setUserFormData({ email: '', password: '', full_name: '', role: 'user', organization_id: '' })
      loadUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri ustvarjanju uporabnika: ' + errorMsg)
    }
  }

  async function updateUser() {
    if (!editingUser?.id) return
    
    try {
      const data = await invokeAdminFunction('admin-users', { action: 'update', id: editingUser.id, ...editingUser })
      
      setShowEditUserModal(false)
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri posodabljanju uporabnika: ' + errorMsg)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Ali ste prepričani, da želite izbrisati tega uporabnika?')) return
    
    try {
      const data = await invokeAdminFunction('admin-users', { action: 'delete', id: userId })
      
      loadUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri brisanju uporabnika: ' + errorMsg)
    }
  }

  async function bulkDeleteUsers() {
    if (selectedUsers.length === 0 || !confirm(`Ali ste prepričani, da želite izbrisati ${selectedUsers.length} uporabnikov?`)) return
    
    try {
      const data = await invokeAdminFunction('admin-users', {
        action: 'bulk',
        operation: 'delete',
        userIds: selectedUsers
      })
      
      setSelectedUsers([])
      loadUsers()
    } catch (error: any) {
      console.error('Error bulk deleting users:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri množičnem brisanju: ' + errorMsg)
    }
  }

  async function bulkUpdateOrganization(orgId: string) {
    if (selectedUsers.length === 0 || !orgId) return
    
    try {
      const data = await invokeAdminFunction('admin-users', {
        action: 'bulk',
        operation: 'update_organization',
        userIds: selectedUsers,
        data: { organization_id: orgId }
      })
      
      setSelectedUsers([])
      loadUsers()
    } catch (error: any) {
      console.error('Error bulk updating organization:', error)
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Neznana napaka')
      alert('Napaka pri množični spremembi organizacije: ' + errorMsg)
    }
  }

  // Check if current user is super admin
  if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-risk-high mx-auto mb-4" />
          <h2 className="text-heading-lg font-semibold text-text-primary mb-2">
            Dostop zavrnjen
          </h2>
          <p className="text-body text-text-secondary">
            Za dostop do te strani potrebujete administratorske pravice.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  const currentData = activeTab === 'users' ? users : organizations
  const currentLoading = activeTab === 'users' ? usersLoading : orgsLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-body text-text-secondary">
            Upravljanje uporabnikov, organizacij in sistemskih konfiguration
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLogsViewer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            title="View Supabase function logs"
          >
            <FileText className="w-5 h-5" />
            View Logs
          </button>
          <UserCog className="w-12 h-12 text-accent-primary" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-emphasis'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Uporabniki ({users.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'organizations'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-emphasis'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizacije ({organizations.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? 'Išči uporabnike...' : 'Išči organizacije...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none"
              />
            </div>

            {/* Filters for Users tab */}
            {activeTab === 'users' && (
              <>
                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Vse organizacije</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Vse vloge</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Bulk Actions */}
            {activeTab === 'users' && selectedUsers.length > 0 && (
              <div className="flex gap-2 mr-4">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkUpdateOrganization(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="px-3 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Premakni v organizacijo...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                
                <button
                  onClick={bulkDeleteUsers}
                  className="px-4 py-2 bg-risk-high hover:bg-risk-high/80 text-white rounded-lg transition-colors"
                >
                  Izbriši ({selectedUsers.length})
                </button>
              </div>
            )}

            <button
              onClick={() => activeTab === 'users' ? setShowCreateUserModal(true) : setShowCreateOrgModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'users' ? 'Dodaj uporabnika' : 'Dodaj organizacijo'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {activeTab === 'users' && usersError && (
          <div className="bg-risk-high/10 border border-risk-high/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-risk-high mb-1">Napaka pri nalaganju uporabnikov</h3>
              <p className="text-sm text-text-secondary mb-3">{usersError}</p>
              {usersRetrying && (
                <p className="text-sm text-accent-primary mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Samodejni ponovni poskus...
                </p>
              )}
              <button
                onClick={() => loadUsers(0)}
                disabled={usersLoading || usersRetrying}
                className="flex items-center gap-2 px-4 py-2 bg-risk-high hover:bg-risk-high/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                Poskusi znova
              </button>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && orgsError && (
          <div className="bg-risk-high/10 border border-risk-high/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-risk-high mb-1">Napaka pri nalaganju organizacij</h3>
              <p className="text-sm text-text-secondary mb-3">{orgsError}</p>
              {orgsRetrying && (
                <p className="text-sm text-accent-primary mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Samodejni ponovni poskus...
                </p>
              )}
              <button
                onClick={() => loadOrganizations(0)}
                disabled={orgsLoading || orgsRetrying}
                className="flex items-center gap-2 px-4 py-2 bg-risk-high hover:bg-risk-high/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${orgsLoading ? 'animate-spin' : ''}`} />
                Poskusi znova
              </button>
            </div>
          </div>
        )}

        {/* Data Display */}
        {activeTab === 'users' ? (
          <UsersTable 
            users={users}
            loading={usersLoading}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onEdit={(user) => {
              setEditingUser(user)
              setShowEditUserModal(true)
            }}
            onDelete={deleteUser}
            organizations={organizations}
          />
        ) : (
          <OrganizationsTable 
            organizations={organizations}
            loading={orgsLoading}
            selectedOrganizations={selectedOrganizations}
            setSelectedOrganizations={setSelectedOrganizations}
            onEdit={(org) => {
              setEditingOrg(org)
              setShowEditOrgModal(true)
            }}
            onDelete={deleteOrganization}
          />
        )}
      </div>

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateOrgModal}
        onClose={() => setShowCreateOrgModal(false)}
        title="Ustvari novo organizacijo"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ime organizacije *
            </label>
            <input
              type="text"
              value={orgFormData.name}
              onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={orgFormData.slug}
              onChange={(e) => setOrgFormData({ ...orgFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Opis
            </label>
            <textarea
              value={orgFormData.description}
              onChange={(e) => setOrgFormData({ ...orgFormData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Subscription Tier
            </label>
            <select
              value={orgFormData.subscription_tier}
              onChange={(e) => setOrgFormData({ ...orgFormData, subscription_tier: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateOrgModal(false)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Prekliči
            </button>
            <button
              onClick={createOrganization}
              disabled={!orgFormData.name || !orgFormData.slug}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white disabled:opacity-50"
            >
              Ustvari
            </button>
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        title="Ustvari novega uporabnika"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Geslo *
            </label>
            <input
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Polno ime
            </label>
            <input
              type="text"
              value={userFormData.full_name}
              onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Vloga
            </label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Organizacija *
            </label>
            <select
              value={userFormData.organization_id}
              onChange={(e) => setUserFormData({ ...userFormData, organization_id: e.target.value })}
              className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              required
            >
              <option value="">Izberi organizacijo</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateUserModal(false)}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Prekliči
            </button>
            <button
              onClick={createUser}
              disabled={!userFormData.email || !userFormData.password || !userFormData.organization_id}
              className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white disabled:opacity-50"
            >
              Ustvari
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false)
          setEditingUser(null)
        }}
        title="Uredi uporabnika"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Polno ime
              </label>
              <input
                type="text"
                value={editingUser.full_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Vloga
              </label>
              <select
                value={editingUser.role || 'user'}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Organizacija
              </label>
              <select
                value={editingUser.organization_id || ''}
                onChange={(e) => setEditingUser({ ...editingUser, organization_id: e.target.value })}
                className="w-full px-3 py-2 bg-bg-near-black border border-border-subtle rounded text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="">Izberi organizacijo</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            {/* Module Permissions */}
            <div className="pt-4 border-t border-border-subtle">
              <label className="block text-sm font-medium text-text-primary mb-3">
                Dovoljenja za module
              </label>
              <div className="space-y-2">
                {[
                  { key: 'nis2', label: 'NIS 2 / ZInfV-1' },
                  { key: 'iso27001', label: 'ISO 27001' },
                  { key: 'gdpr', label: 'GDPR / ZVOP-2' },
                  { key: 'zzpri', label: 'ZZPri' },
                  { key: 'ai_act', label: 'AI Act' },
                  { key: 'misp', label: 'MISP' },
                  { key: 'soc', label: 'SOC' },
                  { key: 'incidents', label: 'Incidenti' },
                  { key: 'inventory', label: 'Inventar' },
                  { key: 'policies', label: 'Politike in postopki' },
                  { key: 'education', label: 'Izobraževanje' },
                  { key: 'support', label: 'Podpora' }
                ].map((module) => (
                  <label key={module.key} className="flex items-center gap-3 p-2 hover:bg-bg-near-black rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.module_permissions?.[module.key as keyof typeof editingUser.module_permissions] ?? true}
                      onChange={(e) => {
                        const currentPermissions = editingUser.module_permissions || {}
                        setEditingUser({
                          ...editingUser,
                          module_permissions: {
                            ...currentPermissions,
                            [module.key]: e.target.checked
                          }
                        })
                      }}
                      className="rounded border-border-subtle focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setEditingUser(null)
                }}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Prekliči
              </button>
              <button
                onClick={updateUser}
                className="bg-accent-primary hover:bg-accent-primary/80 px-4 py-2 rounded transition-colors text-white"
              >
                Shrani
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Debug Panel Toggle - only visible if debug is enabled */}
      {isDebugEnabled && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center gap-2 px-3 py-2 bg-text-tertiary/20 hover:bg-text-tertiary/30 rounded-lg transition-colors text-xs font-medium text-text-secondary"
            title="Toggle debug panel"
          >
            <Bug className="w-4 h-4" />
            Debug ({debugResponses.length})
          </button>
        </div>
      )}

      {/* Debug Panel - only visible if debug is enabled and panel is open */}
      {isDebugEnabled && showDebugPanel && (
        <div className="fixed bottom-16 right-4 w-96 bg-bg-surface border border-border-subtle rounded-lg shadow-lg z-40 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-near-black rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-accent-primary" />
              <h3 className="font-semibold text-text-primary">API Debug Log</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDebugResponses([])}
                className="p-1 hover:bg-bg-surface rounded transition-colors text-text-tertiary hover:text-text-secondary"
                title="Clear debug log"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="p-1 hover:bg-bg-surface rounded transition-colors text-text-tertiary hover:text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 divide-y divide-border-subtle">
            {debugResponses.length === 0 ? (
              <div className="p-4 text-center text-text-tertiary text-sm">
                No API calls yet
              </div>
            ) : (
              debugResponses.map((item, idx) => {
                const itemId = `debug-${idx}-${item.timestamp}`
                const isExpanded = expandedDebugItems.includes(itemId)

                return (
                  <div key={itemId} className="p-3 hover:bg-bg-near-black transition-colors">
                    <button
                      onClick={() => {
                        setExpandedDebugItems(prev =>
                          prev.includes(itemId)
                            ? prev.filter(id => id !== itemId)
                            : [...prev, itemId]
                        )
                      }}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              item.status === 'success'
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-risk-high/15 text-risk-high'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-text-secondary font-mono">
                              {item.functionName}
                            </span>
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {new Date(item.timestamp).toLocaleTimeString()} ({Math.round(item.duration)}ms)
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
                        {/* Request */}
                        <div>
                          <div className="text-xs font-medium text-text-secondary mb-1 flex items-center justify-between">
                            <span>Request</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(item.request, null, 2))
                              }}
                              className="p-0.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-secondary"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="bg-bg-near-black rounded p-2 text-xs font-mono text-text-tertiary overflow-x-auto max-h-32 overflow-y-auto">
                            <pre>{JSON.stringify(item.request, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Response */}
                        <div>
                          <div className="text-xs font-medium text-text-secondary mb-1 flex items-center justify-between">
                            <span>Response</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(item.response, null, 2))
                              }}
                              className="p-0.5 hover:bg-bg-surface rounded text-text-tertiary hover:text-text-secondary"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="bg-bg-near-black rounded p-2 text-xs font-mono text-text-tertiary overflow-x-auto max-h-48 overflow-y-auto">
                            <pre>{JSON.stringify(item.response, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="text-xs text-text-tertiary pt-2 border-t border-border-subtle">
                          <div>Duration: <span className="font-mono">{Math.round(item.duration)}ms</span></div>
                          <div>Timestamp: <span className="font-mono">{new Date(item.timestamp).toISOString()}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Function Logs Viewer */}
      <FunctionLogsViewer
        functionName={selectedFunction}
        isOpen={showLogsViewer}
        onClose={() => setShowLogsViewer(false)}
      />
    </div>
  )
}

// Users Table Component
function UsersTable({ 
  users, 
  loading, 
  selectedUsers, 
  setSelectedUsers, 
  onEdit, 
  onDelete,
  organizations
}: {
  users: User[]
  loading: boolean
  selectedUsers: string[]
  setSelectedUsers: (ids: string[]) => void
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  organizations: Organization[]
}) {
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(
      selectedUsers.includes(userId)
        ? selectedUsers.filter(id => id !== userId)
        : [...selectedUsers, userId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  const countActiveModules = (permissions?: User['module_permissions']) => {
    if (!permissions) return 12 // Default: all modules enabled
    return Object.values(permissions).filter(v => v === true).length
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
      <table className="w-full">
        <thead className="bg-bg-near-black">
          <tr>
            <th className="w-12 px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={toggleSelectAll}
                className="rounded"
              />
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Ime</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Email</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Vloga</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Organizacija</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Moduli</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Ustvarjeno</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Dejanja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {users.map((user) => {
            const activeModules = countActiveModules(user.module_permissions)
            return (
              <tr key={user.id} className="hover:bg-bg-near-black">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 text-text-primary">{user.full_name || '-'}</td>
                <td className="px-6 py-4 text-text-primary">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-caption font-medium uppercase ${
                    user.role === 'super_admin' ? 'bg-risk-high/15 text-risk-high' :
                    user.role === 'admin' ? 'bg-risk-medium/15 text-risk-medium' :
                    'bg-bg-surface-hover text-text-secondary'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-secondary">{organizations.find(org => org.id === user.organization_id)?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-caption font-medium ${
                    activeModules === 12 ? 'bg-green-500/15 text-green-400' :
                    activeModules === 0 ? 'bg-risk-high/15 text-risk-high' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {activeModules}/12
                  </span>
                </td>
                <td className="px-6 py-4 text-text-secondary">
                  {new Date(user.created_at).toLocaleDateString('sl-SI')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1 text-text-secondary hover:text-accent-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-1 text-text-secondary hover:text-risk-high"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          Ni najdenih uporabnikov
        </div>
      )}
    </div>
  )
}

// Organizations Table Component  
function OrganizationsTable({ 
  organizations, 
  loading, 
  selectedOrganizations, 
  setSelectedOrganizations, 
  onEdit, 
  onDelete 
}: {
  organizations: Organization[]
  loading: boolean
  selectedOrganizations: string[]
  setSelectedOrganizations: (ids: string[]) => void
  onEdit: (org: Organization) => void
  onDelete: (orgId: string) => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
      <table className="w-full">
        <thead className="bg-bg-near-black">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Ime</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Slug</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Tier</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Stanje</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Uporabniki</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Ustvarjeno</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Dejanja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {organizations.map((org) => (
            <tr key={org.id} className="hover:bg-bg-near-black">
              <td className="px-6 py-4 text-text-primary">{org.name}</td>
              <td className="px-6 py-4 text-text-secondary">{org.slug}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-caption font-medium uppercase ${
                  org.subscription_tier === 'enterprise' ? 'bg-accent-primary/15 text-accent-primary' :
                  org.subscription_tier === 'premium' ? 'bg-blue-500/15 text-blue-400' :
                  org.subscription_tier === 'basic' ? 'bg-green-500/15 text-green-400' :
                  'bg-bg-surface-hover text-text-secondary'
                }`}>
                  {org.subscription_tier}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-caption font-medium ${
                  org.is_active ? 'bg-green-500/15 text-green-400' : 'bg-risk-medium/15 text-risk-medium'
                }`}>
                  {org.is_active ? 'Aktivna' : 'Neaktivna'}
                </span>
              </td>
              <td className="px-6 py-4 text-text-secondary">
                {org.user_count || 0}
              </td>
              <td className="px-6 py-4 text-text-secondary">
                {new Date(org.created_at).toLocaleDateString('sl-SI')}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(org)}
                    className="p-1 text-text-secondary hover:text-accent-primary"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(org.id)}
                    className="p-1 text-text-secondary hover:text-risk-high"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {organizations.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          Ni najdenih organizacij
        </div>
      )}
    </div>
  )
}