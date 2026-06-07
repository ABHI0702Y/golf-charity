'use client'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f0d] disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[#4ade80] text-[#0a0f0d] hover:bg-[#22c55e] focus:ring-[#4ade80]',
      secondary: 'bg-[#d4a017] text-[#0a0f0d] hover:bg-[#b8860b] focus:ring-[#d4a017]',
      outline: 'border border-[#1e2d24] text-[#f0f4f1] hover:bg-[#111816] focus:ring-[#4ade80]',
      ghost: 'text-[#6b7c6e] hover:text-[#f0f4f1] hover:bg-[#111816] focus:ring-[#4ade80]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
