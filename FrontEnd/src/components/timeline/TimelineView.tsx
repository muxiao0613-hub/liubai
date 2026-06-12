import { useMemo } from 'react'
import { MapPin, Camera, Star } from 'lucide-react'
import type { CityRecord } from '@/types'

interface TimelineViewProps {
  cities: CityRecord[]
  onCityClick: (cityCode: string) => void
}

interface TimelineEntry {
  date: string
  year: string
  month: string
  city: CityRecord
}

export function TimelineView({ cities, onCityClick }: TimelineViewProps) {
  const entries = useMemo(() => {
    const list: TimelineEntry[] = cities.flatMap(city =>
      city.visitedAt.map(date => ({
        date,
        year: date.slice(0, 4),
        month: date.slice(0, 7),
        city,
      }))
    )
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [cities])

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>()
    for (const e of entries) {
      const list = map.get(e.year) ?? []
      list.push(e)
      map.set(e.year, list)
    }
    return map
  }, [entries])

  if (cities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#c5c2b8]">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">还没有旅行记录</p>
          <p className="text-xs mt-1 opacity-60">在地图上标记城市后，这里会显示你的旅行时间轴</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {[...grouped.entries()].map(([year, yearEntries]) => (
        <div key={year} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-mono font-bold text-[#1a1a1a]">{year}</span>
            <span className="text-sm text-[#aaa898]">{yearEntries.length} 次到访</span>
            <div className="flex-1 h-px bg-[#e5e2d8]" />
          </div>

          <div className="relative pl-6">
            {/* 竖线 */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#e5e2d8]" />

            {yearEntries.map((entry, i) => (
              <div key={`${entry.city.id}-${entry.date}-${i}`} className="relative mb-4 last:mb-0">
                {/* 时间线圆点 */}
                <div className="absolute -left-4 top-3 w-2.5 h-2.5 rounded-full border-2 border-[#f0a500] bg-white" />

                <button
                  onClick={() => onCityClick(entry.city.cityCode)}
                  className="w-full text-left bg-white border border-[#e5e2d8] rounded-2xl p-4 hover:border-[#f0a500]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1a1a1a]">{entry.city.cityName}</span>
                        <span className="text-xs text-[#aaa898]">{entry.city.provinceName}</span>
                      </div>
                      <div className="text-xs text-[#c5c2b8] mt-0.5">{entry.date}</div>
                    </div>
                    <div className="flex gap-1">
                      {entry.city.statuses.map(s => (
                        <span key={s} className={`text-xs px-2 py-0.5 rounded-full border ${
                          s === 'lived'    ? 'text-[#e84040] bg-[#e84040]/10 border-[#e84040]/30' :
                          s === 'business' ? 'text-[#5090d0] bg-[#5090d0]/10 border-[#5090d0]/30' :
                                            'text-[#f0a500] bg-[#f0a500]/10 border-[#f0a500]/30'
                        }`}>
                          {{ visited:'旅游', lived:'居住', business:'出差' }[s]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 打卡信息 */}
                  {entry.city.checkins.length > 0 && (
                    <div className="flex items-center gap-3 mt-2">
                      {/* 照片缩略图 */}
                      <div className="flex gap-1">
                        {entry.city.checkins
                          .flatMap(c => c.photos)
                          .slice(0, 4)
                          .map(p => (
                            <img
                              key={p.id}
                              src={p.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-[#e5e2d8]"
                            />
                          ))}
                      </div>
                      <div className="text-xs text-[#aaa898] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star size={11} />
                          {entry.city.checkins.length} 处打卡
                        </span>
                        {entry.city.checkins.flatMap(c => c.photos).length > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera size={11} />
                            {entry.city.checkins.flatMap(c => c.photos).length} 张照片
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {entry.city.notes && (
                    <p className="text-xs text-[#888880] mt-2 line-clamp-2">{entry.city.notes}</p>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
