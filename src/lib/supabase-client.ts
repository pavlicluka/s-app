import { createClient } from '@supabase/supabase-js'

// Get environment variables from multiple sources with fallbacks
function getEnvVar(key: string): string | undefined {
  // Priority 1: Window environment (injected in index.html)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const val = (window as any).__ENV__[key]
    if (val && !val.startsWith('%')) return val
  }
  
  // Priority 2: Vite import.meta.env
  if (import.meta.env[key]) {
    return import.meta.env[key]
  }
  
  // Priority 3: Process env (Node/build time)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  }
  
  return undefined
}

// Get environment variables
let supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL')
let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')

// Fallback to hardcoded project values
if (!supabaseUrl || supabaseUrl.includes('%VITE_SUPABASE')) {
  supabaseUrl = 'https://ckxlbiiirfdogobccmjs.supabase.co'
  console.warn('⚠️ Using fallback Supabase URL')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('%VITE_SUPABASE')) {
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGxiaWlpcmZkb2dvYmNjbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjI5NjIsImV4cCI6MjA3NzQzODk2Mn0.Y8T0bCsL5t_9u71z-yHYxrdyl4rqPN3fUMBg9k-p_TA'
  console.warn('⚠️ Using fallback Supabase anon key')
}

// Log status
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configuration ready')
}

// Create Supabase client with standard configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
  global: {
    headers: {
      'x-client-info': 'standario/1.0.0',
    },
  },
})

export function validateSupabaseConfig() {
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL environment variable is not set')
  }
  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is not set')
  }
  return true
}
