import { useState, useMemo } from 'react'
import { Images } from 'lucide-react'
import type { CityRecord, Photo } from '@/types'
import { PhotoViewer } from '@/components/checkin/PhotoViewer'

interface GalleryViewProps {
  cities: CityRecord[]
}

interface GalleryPhoto extends Photo {
  cityName: string
  checkinName: string
  date: string
}

export function GalleryView({ cities }: GalleryViewProps) {
  const [filterCity, setFilterCity] = useState<string>('all')
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)

  const allPhotos = useMemo<GalleryPhoto[]>(() =>
    cities.flatMap(city =>
      city.checkins.flatMap(checkin =>
        checkin.photos.map(photo => ({
          ...photo,
          cityName: city.cityName,
          checkinName: checkin.name,
          date: checkin.date,
        }))
      )
    ).sort((a, b) => (b.takenAt ?? b.date).localeCompare(a.takenAt ?? a.date)),
  [cities])

  const filtered = filterCity === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.cityName === filterCity)

  const cityOptions = useMemo(() =>
    [...new Set(allPhotos.map(p => p.cityName))],
  [allPhotos])

  if (allPhotos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#c5c2b8]">
        <div className="text-center">
          <Images size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">还没有旅行照片</p>
          <p className="text-xs mt-1 opacity-60">在城市打卡时上传照片，这里会汇集所有旅行影像</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-[#e5e2d8] flex items-center gap-3">
        <span className="text-xs text-[#aaa898] shrink-0">共 {allPhotos.length} 张</span>
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterCity('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs transition-all border ${
              filterCity === 'all'
                ? 'bg-[#f0a500] text-white border-[#f0a500]'
                : 'bg-white text-[#666660] border-[#e5e2d8] hover:border-[#f0a500]/40'
            }`}
          >
            全部
          </button>
          {cityOptions.map(city => (
            <button
              key={city}
              onClick={() => setFilterCity(city)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs transition-all border ${
                filterCity === city
                  ? 'bg-[#f0a500] text-white border-[#f0a500]'
                  : 'bg-white text-[#666660] border-[#e5e2d8] hover:border-[#f0a500]/40'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-style grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="columns-3 gap-3 space-y-3">
          {filtered.map((photo, i) => (
            <div
              key={photo.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setViewingIndex(i)}
            >
              <div className="relative overflow-hidden rounded-xl border border-[#e5e2d8] bg-[#faf9f6]">
                <img
                  src={photo.thumbnail}
                  alt={photo.caption}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{photo.checkinName}</p>
                  <p className="text-white/70 text-[10px]">{photo.cityName} · {photo.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewingIndex !== null && (
        <PhotoViewer
          photos={filtered}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}
    </div>
  )
}
