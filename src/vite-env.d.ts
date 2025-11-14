/// <reference types="vite/client" />

// Extend Window interface to include environment variables injected in HTML
interface Window {
  __ENV__?: {
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANON_KEY?: string
  }
}
