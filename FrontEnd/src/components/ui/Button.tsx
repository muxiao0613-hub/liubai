import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantMap = {
  primary:   'bg-[#f0a500] hover:bg-[#e09400] text-white font-medium',
  secondary: 'bg-white hover:bg-[#f5f3ee] text-[#1a1a1a] border border-[#e5e2d8]',
  ghost:     'hover:bg-[#f2f0eb] text-[#999990] hover:text-[#1a1a1a]',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-sm rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'transition-all duration-150 inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
