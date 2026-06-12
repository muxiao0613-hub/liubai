import { Map, Clock, Images, BarChart2, Backpack } from 'lucide-react'
import { cn } from '@/utils/cn'

export type AppView = 'map' | 'timeline' | 'gallery' | 'stats' | 'trips'

const NAV_ITEMS: { view: AppView; icon: React.ReactNode; label: string }[] = [
  { view: 'map',      icon: <Map size={20} />,      label: '地图' },
  { view: 'timeline', icon: <Clock size={20} />,     label: '时间轴' },
  { view: 'gallery',  icon: <Images size={20} />,    label: '相册' },
  { view: 'stats',    icon: <BarChart2 size={20} />, label: '统计' },
  { view: 'trips',    icon: <Backpack size={20} />,  label: '行程' },
]

interface NavSidebarProps {
  current: AppView
  onChange: (v: AppView) => void
}

export function NavSidebar({ current, onChange }: NavSidebarProps) {
  return (
    <nav className="w-14 bg-white border-r border-[#e5e2d8] flex flex-col items-center py-3 gap-1 shrink-0">
      {NAV_ITEMS.map(({ view, icon, label }) => (
        <button
          key={view}
          onClick={() => onChange(view)}
          title={label}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            current === view
              ? 'bg-[#f0a500] text-white shadow-sm'
              : 'text-[#aaa898] hover:bg-[#f2f0eb] hover:text-[#1a1a1a]',
          )}
        >
          {icon}
        </button>
      ))}
    </nav>
  )
}
