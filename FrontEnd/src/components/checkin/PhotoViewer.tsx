import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Photo } from '@/types'

interface PhotoViewerProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex(i => Math.min(photos.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, photos.length])

  const photo = photos[index]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X size={20} className="text-white" />
      </button>

      {index > 0 && (
        <button
          onClick={() => setIndex(i => i - 1)}
          className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      <img
        src={photo.data}
        alt={photo.caption}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
      />

      {index < photos.length - 1 && (
        <button
          onClick={() => setIndex(i => i + 1)}
          className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      <div className="absolute bottom-4 text-sm text-white/60">
        {index + 1} / {photos.length}
        {photo.caption && <span className="ml-3">{photo.caption}</span>}
      </div>
    </div>
  )
}
