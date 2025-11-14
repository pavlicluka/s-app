import type { Plugin } from 'vite'

/**
 * Vite plugin to inject environment variables into index.html at build time
 * This ensures that secrets from Blink's vault are available in the deployed app
 */
export function envInjectPlugin(): Plugin {
  return {
    name: 'env-inject',
    transformIndexHtml(html) {
      // Get environment variables from multiple possible sources
      // Priority: VITE_ prefixed first, then non-prefixed
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
      
      console.log('🔧 Env Inject Plugin - Available env vars:', {
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        usingUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
        usingKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'MISSING'
      })
      
      // Replace placeholders with actual environment variable values
      return html
        .replace('%VITE_SUPABASE_URL%', supabaseUrl)
        .replace('%VITE_SUPABASE_ANON_KEY%', supabaseAnonKey)
    }
  }
}
