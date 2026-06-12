import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

// 全局事件总线
const listeners = new Set<(toast: ToastItem) => void>()

export function toast(message: string, type: ToastType = 'success') {
  const item: ToastItem = { id: Math.random().toString(36).slice(2), message, type }
  listeners.forEach(fn => fn(item))
}

const ICONS = {
  success: <CheckCircle size={15} className="text-emerald-500 shrink-0" />,
  error:   <XCircle    size={15} className="text-red-500 shrink-0" />,
  info:    <Info       size={15} className="text-[#f0a500] shrink-0" />,
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 进入动画
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onRemove, 300)
    }, 2800)
    return () => clearTimeout(timer)
  }, [onRemove])

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#e5e2d8] rounded-xl shadow-lg text-sm text-[#1a1a1a] max-w-xs transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {ICONS[item.type]}
      <span className="flex-1">{item.message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onRemove, 300) }} className="text-[#c5c2b8] hover:text-[#666660]">
        <X size={13} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (item: ToastItem) => setToasts(prev => [...prev, item])
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem item={t} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>
  )
}
