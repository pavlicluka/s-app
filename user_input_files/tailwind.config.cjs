/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Dark Mode First - Background colors
        'bg-pure-black': '#000000',
        'bg-near-black': '#0a0a0a',
        'bg-surface': '#141414',
        'bg-surface-hover': '#1e1e1e',
        'bg-surface-elevated': '#282828',
        
        // Text colors
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-tertiary': '#71717a',
        'text-accent': '#3b82f6',
        
        // Accent colors (Cyber Blue)
        'accent-primary': '#3b82f6',
        'accent-primary-hover': '#60a5fa',
        
        // Risk colors
        'risk-high': '#ef4444',
        'risk-medium': '#f59e0b',
        'risk-low': '#22c55e',
        
        // Status colors
        'status-success': '#10b981',
        'status-warning': '#f59e0b',
        'status-error': '#ef4444',
        
        // Border colors
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
        'border-moderate': 'rgba(255, 255, 255, 0.15)',
        'border-strong': 'rgba(255, 255, 255, 0.2)',
        'border-accent': '#3b82f6',
      },
      fontFamily: {
        'ui-primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'ui-secondary': ['Manrope', 'Inter', 'sans-serif'],
        'data': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display-xl': '48px',
        'display-lg': '36px',
        'heading-lg': '24px',
        'heading-md': '20px',
        'body-lg': '18px',
        'body': '16px',
        'body-sm': '14px',
        'caption': '12px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'glow-accent-sm': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-accent-md': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
        'glow-risk-high': '0 0 16px rgba(239, 68, 68, 0.4)',
        'glow-risk-medium': '0 0 16px rgba(245, 158, 11, 0.4)',
        'glow-risk-low': '0 0 16px rgba(34, 197, 94, 0.4)',
        'elevation-subtle': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
