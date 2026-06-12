import { Download, Settings, Users, LogOut } from 'lucide-react'
import type { Stats } from '@/types'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

interface TopBarProps {
  stats: Stats
  onExport: () => void
  onSettings: () => void
  onAdmin: () => void
}

export function TopBar({ stats, onExport, onSettings, onAdmin }: TopBarProps) {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e5e2d8] shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm overflow-hidden border border-[#f0a500]/60 flex">
            <div className="w-1/2 bg-[#f0a500]" />
            <div className="w-1/2 bg-transparent" />
          </div>
          <span className="text-[#1a1a1a] font-medium text-base tracking-widest">留白</span>
        </div>
        <div className="h-4 w-px bg-[#e5e2d8]" />
        {stats.totalCities > 0 ? (
          <span className="text-[#999990] text-sm">
            走过{' '}
            <span className="text-[#f0a500] font-mono font-medium">{stats.totalCities}</span>{' '}
            座城市 ·{' '}
            <span className="text-[#f0a500] font-mono font-medium">{stats.totalProvinces}</span>{' '}
            个省份的留白已填色
          </span>
        ) : (
          <span className="text-[#c5c2b8] text-sm">地图还是一片留白</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button variant="secondary" size="sm" onClick={onAdmin}>
            <Users size={14} className="mr-1" />
            管理面板
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onExport}>
          <Download size={14} />
          导出海报
        </Button>
        <Button variant="ghost" size="sm" onClick={onSettings}>
          <Settings size={14} />
        </Button>
        <div className="h-4 w-px bg-[#e5e2d8]" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#999990]">{user?.username}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600">
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </header>
  )
}
