import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type Resolver = (ok: boolean) => void
const pending: { opts: ConfirmOptions; resolve: Resolver }[] = []
const listeners = new Set<() => void>()

export function confirm(opts: ConfirmOptions | string): Promise<boolean> {
  const options = typeof opts === 'string' ? { message: opts } : opts
  return new Promise(resolve => {
    pending.push({ opts: options, resolve })
    listeners.forEach(fn => fn())
  })
}

export function ConfirmContainer() {
  const [item, setItem] = useState<{ opts: ConfirmOptions; resolve: Resolver } | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const notify = () => {
      if (!item && pending.length > 0) setItem(pending.shift()!)
    }
    listeners.add(notify)
    notify()
    return () => { listeners.delete(notify) }
  }, [item])

  useEffect(() => {
    if (item) confirmBtnRef.current?.focus()
  }, [item])

  if (!item) return null

  const { opts, resolve } = item
  const close = (ok: boolean) => {
    resolve(ok)
    setItem(null)
    if (pending.length > 0) setTimeout(() => setItem(pending.shift()!), 0)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => close(false)} />
      <div className="relative bg-white border border-[#e5e2d8] rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className={opts.danger ? 'text-red-500 shrink-0 mt-0.5' : 'text-[#f0a500] shrink-0 mt-0.5'} />
          <div>
            {opts.title && <h3 className="font-medium text-[#1a1a1a] mb-1">{opts.title}</h3>}
            <p className="text-sm text-[#666660] leading-relaxed">{opts.message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => close(false)}>
            {opts.cancelText ?? '取消'}
          </Button>
          <Button
            ref={confirmBtnRef}
            variant={opts.danger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => close(true)}
          >
            {opts.confirmText ?? '确定'}
          </Button>
        </div>
      </div>
    </div>
  )
}
