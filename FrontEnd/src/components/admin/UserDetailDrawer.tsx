import { useEffect, useState } from 'react'
import { X, MapPin, Camera, Image as ImageIcon, Route, Loader2, AlertCircle } from 'lucide-react'
import { getUserFootprint, type UserFootprint } from '@/api/adminApi'
import { PROVINCES } from '@/utils/mapData'

const STATUS_LABEL: Record<string, string> = {
  visited: '旅游', lived: '居住', business: '出差',
}

export function UserDetailDrawer({ userId, username, onClose }: {
  userId: number
  username: string
  onClose: () => void
}) {
  const [data, setData] = useState<UserFootprint | null>(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'cities' | 'trips'>('cities')

  useEffect(() => {
    setData(null); setError(false)
    getUserFootprint(userId).then(setData).catch(() => setError(true))
  }, [userId])

  const u = data?.user

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg h-full bg-[#faf9f6] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-4 bg-white border-b border-[#e5e2d8] flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a]">{username}</h3>
            {u && (
              <div className="mt-1 flex items-center gap-3 text-xs text-[#aaa898]">
                <span className="inline-flex items-center gap-1"><MapPin size={12} />{u.cityCount ?? 0} 城</span>
                <span className="inline-flex items-center gap-1"><Camera size={12} />{u.checkinCount ?? 0} 卡</span>
                <span className="inline-flex items-center gap-1"><ImageIcon size={12} />{u.photoCount ?? 0} 图</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-1 px-4 pt-3 bg-white border-b border-[#e5e2d8]">
          <TabBtn active={tab === 'cities'} onClick={() => setTab('cities')}>
            <MapPin size={14} />城市 {data ? `(${data.cities.length})` : ''}
          </TabBtn>
          <TabBtn active={tab === 'trips'} onClick={() => setTab('trips')}>
            <Route size={14} />行程 {data ? `(${data.trips.length})` : ''}
          </TabBtn>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-40 text-sm text-red-500 gap-2">
              <AlertCircle size={24} />足迹加载失败
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={28} className="animate-spin text-[#f0a500]" />
            </div>
          ) : tab === 'cities' ? (
            data.cities.length === 0 ? (
              <Empty text="还没有城市记录" />
            ) : (
              <div className="space-y-2">
                {data.cities.map(c => (
                  <div key={c.id} className="bg-white border border-[#e5e2d8] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {c.cityName}
                        <span className="ml-1.5 text-xs text-[#aaa898]">
                          {PROVINCES[c.provinceCode] ?? c.provinceCode}
                        </span>
                      </span>
                      <span className="text-xs text-[#aaa898]">{c.visitedAt?.length ?? 0} 次到访</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {c.statuses.map(s => (
                        <span key={s} className="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 text-amber-700 border border-amber-100">
                          {STATUS_LABEL[s] ?? s}
                        </span>
                      ))}
                      {c.checkins.length > 0 && (
                        <span className="text-[10px] text-[#aaa898]">· {c.checkins.length} 个打卡点</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            data.trips.length === 0 ? (
              <Empty text="还没有行程" />
            ) : (
              <div className="space-y-2">
                {data.trips.map(t => (
                  <div key={t.id} className="bg-white border border-[#e5e2d8] rounded-xl p-3">
                    <div className="text-sm font-medium text-[#1a1a1a]">{t.name}</div>
                    <div className="mt-1 text-xs text-[#aaa898]">
                      {t.startDate ?? '?'} ~ {t.endDate ?? '?'} · {t.cityCodes?.length ?? 0} 城
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
        active ? 'border-amber-500 text-[#1a1a1a] font-medium' : 'border-transparent text-[#aaa898] hover:text-[#666660]'
      }`}
    >
      {children}
    </button>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="flex items-center justify-center h-40 text-sm text-[#aaa898]">{text}</div>
}
