import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Camera } from 'lucide-react'
import type { Checkin } from '@/types'
import { deleteCheckin } from '@/api/checkinApi'
import { useRefreshCities } from '@/hooks/useApiCities'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import { PhotoViewer } from './PhotoViewer'

const CAT_ICONS: Record<string, string> = {
  scenic: '🏞',
  food: '🍜',
  hotel: '🏨',
  other: '📍',
}

interface CheckinCardProps {
  checkin: Checkin
}

export function CheckinCard({ checkin }: CheckinCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<number | null>(null)
  const refresh = useRefreshCities()

  const handleDelete = async () => {
    const ok = await confirm({ message: `删除打卡记录「${checkin.name}」？`, danger: true, confirmText: '删除' })
    if (!ok) return
    await deleteCheckin(checkin.id)
    await refresh()
    toast(`已删除 ${checkin.name}`, 'info')
  }

  return (
    <div className="bg-white border border-[#e5e2d8] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#faf9f6] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-base">{CAT_ICONS[checkin.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#1a1a1a] truncate">{checkin.name}</div>
          <div className="text-xs text-[#aaa898]">{checkin.date}</div>
        </div>
        {checkin.photos.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-[#c5c2b8]">
            <Camera size={12} />
            {checkin.photos.length}
          </span>
        )}
        {expanded
          ? <ChevronUp size={14} className="text-[#c5c2b8]" />
          : <ChevronDown size={14} className="text-[#c5c2b8]" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#f2f0eb]">
          {checkin.notes && (
            <p className="text-xs text-[#666660] leading-relaxed pt-2">{checkin.notes}</p>
          )}
          {checkin.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {checkin.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setViewingPhoto(i)}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={photo.thumbnail} alt={photo.caption || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
              删除
            </button>
          </div>
        </div>
      )}

      {viewingPhoto !== null && (
        <PhotoViewer
          photos={checkin.photos}
          initialIndex={viewingPhoto}
          onClose={() => setViewingPhoto(null)}
        />
      )}
    </div>
  )
}
