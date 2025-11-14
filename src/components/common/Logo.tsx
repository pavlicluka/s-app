import { Shield } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-sm', container: 'gap-2' },
    md: { icon: 'w-6 h-6', text: 'text-lg', container: 'gap-3' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', container: 'gap-4' },
    xl: { icon: 'w-13 h-13', text: 'text-3xl', container: 'gap-5' },
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center ${currentSize.container}`}>
      <div className="rounded-lg bg-accent-primary flex items-center justify-center" style={{ padding: size === 'sm' ? '4px' : size === 'md' ? '5px' : size === 'lg' ? '8px' : '10px' }}>
        <Shield className={`${currentSize.icon} text-white`} />
      </div>
      <span className={`${currentSize.text} font-semibold text-text-primary`}>Standario</span>
    </div>
  )
}
