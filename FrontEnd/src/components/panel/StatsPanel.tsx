import { Map, MapPin, Camera, Star, Clock } from 'lucide-react'
import type { Stats } from '@/types'

interface StatsPanelProps {
  stats: Stats
}

function StatItem({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf9f6] border border-[#e5e2d8]">
      <div className="text-[#f0a500]">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#aaa898]">{label}</div>
        <div className="text-[#1a1a1a] font-mono font-medium text-lg leading-tight">{value}</div>
        {sub && <div className="text-xs text-[#aaa898] truncate">{sub}</div>}
      </div>
    </div>
  )
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const blankPercent = 100 - stats.coveragePercent

  return (
    <div className="p-4 space-y-3">
      <div className="text-center mb-5">
        <div className="text-4xl font-mono font-bold text-[#1a1a1a] mb-1">{blankPercent}%</div>
        <div className="text-xs text-[#aaa898]">还是留白</div>
        <div className="mt-3 h-1.5 bg-[#ede9e0] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#f0a500] to-[#ff6b35] rounded-full transition-all duration-700"
            style={{ width: `${stats.coveragePercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[#c5c2b8]">
          <span>已填色 {stats.coveragePercent}%</span>
          <span>留白 {blankPercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatItem icon={<MapPin size={18} />} label="走过的城市" value={`${stats.totalCities} / 340`} />
        <StatItem icon={<Map size={18} />} label="走过的省份" value={`${stats.totalProvinces} / 34`} />
        <StatItem icon={<Star size={18} />} label="打卡地点" value={stats.totalCheckins} />
        <StatItem icon={<Camera size={18} />} label="旅行照片" value={stats.totalPhotos} />
      </div>

      {stats.latestVisit && (
        <StatItem
          icon={<Clock size={18} />}
          label="最近填色"
          value={stats.latestVisit.cityName}
          sub={stats.latestVisit.provinceName}
        />
      )}
      {stats.mostVisited && stats.mostVisited.visitedAt.length > 1 && (
        <StatItem
          icon={<Star size={18} />}
          label="去得最多"
          value={stats.mostVisited.cityName}
          sub={`${stats.mostVisited.visitedAt.length} 次`}
        />
      )}

      {stats.totalCities === 0 && (
        <div className="text-center py-8 text-[#c5c2b8]">
          <div className="w-10 h-10 mx-auto mb-3 rounded border-2 border-dashed border-[#d5d0c8] flex items-center justify-center opacity-60">
            <div className="w-4 h-4 border border-[#c5c2b8]" />
          </div>
          <p className="text-sm text-[#aaa898]">地图还是一片留白</p>
          <p className="text-xs mt-1">点击地图，填上你走过的地方</p>
        </div>
      )}
    </div>
  )
}
