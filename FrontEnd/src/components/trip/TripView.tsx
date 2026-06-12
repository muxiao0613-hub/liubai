import { useEffect, useState } from 'react'
import { Plus, Backpack, Pencil, Trash2, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TripModal } from './TripModal'
import { getTrips, deleteTrip } from '@/api/tripApi'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import type { CityRecord, Trip } from '@/types'

interface TripViewProps {
  cities: CityRecord[]
}

export function TripView({ cities }: TripViewProps) {
  const [trips, setTrips] = useState<Trip[] | undefined>(undefined)
  const [editTrip, setEditTrip] = useState<Trip | null | 'new'>(null)

  const loadTrips = async () => {
    try {
      const data = await getTrips()
      data.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
      setTrips(data)
    } catch (error) {
      console.error('加载行程失败:', error)
      setTrips([])
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  const cityMap = Object.fromEntries(cities.map(c => [c.cityCode, c]))

  const handleDelete = async (id: string) => {
    const ok = await confirm({ message: '确定删除这个行程吗？', danger: true, confirmText: '删除' })
    if (!ok) return
    await deleteTrip(id)
    await loadTrips()
    toast('已删除行程', 'info')
  }

  if (!trips) return null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-[#e5e2d8] flex items-center justify-between">
        <span className="text-sm text-[#aaa898]">共 {trips.length} 次行程</span>
        <Button size="sm" onClick={() => setEditTrip('new')}>
          <Plus size={13} />
          新建行程
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#c5c2b8]">
            <Backpack size={48} className="mb-3 opacity-30" />
            <p className="text-sm">还没有行程记录</p>
            <p className="text-xs mt-1 opacity-60">把多个城市打包成一次旅行</p>
            <Button size="sm" className="mt-4" onClick={() => setEditTrip('new')}>
              <Plus size={13} />
              新建第一个行程
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const tripCities = trip.cityCodes.map(c => cityMap[c]).filter(Boolean)
              const photos = tripCities.flatMap(c => c.checkins.flatMap(ck => ck.photos)).slice(0, 5)
              return (
                <div key={trip.id} className="bg-white border border-[#e5e2d8] rounded-2xl overflow-hidden">
                  {/* 封面照片条 */}
                  {photos.length > 0 && (
                    <div className="flex h-20 overflow-hidden">
                      {photos.map(p => (
                        <img key={p.id} src={p.thumbnail} alt="" className="flex-1 object-cover" />
                      ))}
                    </div>
                  )}
                  {!photos.length && (
                    <div className="h-16 bg-gradient-to-r from-[#faf9f6] to-[#f2f0eb] flex items-center justify-center">
                      <Backpack size={24} className="text-[#d5d0c8]" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">{trip.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#aaa898]">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {trip.startDate} → {trip.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {tripCities.length} 座城市
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditTrip(trip)} className="p-1.5 rounded-lg text-[#aaa898] hover:text-[#1a1a1a] hover:bg-[#f2f0eb] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(trip.id)} className="p-1.5 rounded-lg text-[#aaa898] hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 城市标签 */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tripCities.slice(0, 8).map(c => (
                        <span key={c.cityCode} className="px-2 py-0.5 bg-[#faf9f6] border border-[#e5e2d8] rounded-full text-xs text-[#666660]">
                          {c.cityName}
                        </span>
                      ))}
                      {tripCities.length > 8 && (
                        <span className="px-2 py-0.5 text-xs text-[#c5c2b8]">+{tripCities.length - 8}</span>
                      )}
                    </div>

                    {trip.notes && (
                      <p className="text-xs text-[#888880] mt-2 line-clamp-2">{trip.notes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editTrip !== null && (
        <TripModal
          open
          trip={editTrip === 'new' ? null : editTrip}
          cities={cities}
          onClose={() => setEditTrip(null)}
          onSaved={loadTrips}
        />
      )}
    </div>
  )
}
