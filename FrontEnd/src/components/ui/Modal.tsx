import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full bg-white border border-[#e5e2d8] rounded-2xl shadow-xl',
        'max-h-[90vh] flex flex-col',
        sizeMap[size],
        className,
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e2d8] shrink-0">
          <h2 className="text-base font-medium text-[#1a1a1a]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#aaa898] hover:text-[#1a1a1a] hover:bg-[#f2f0eb] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
