import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createCheckin } from '@/api/checkinApi'
import { useRefreshCities } from '@/hooks/useApiCities'
import { toast } from '@/components/ui/Toast'
import { compressImage, makeThumbnail, readExifDate } from '@/utils/imageUtils'
import { nanoid } from '@/utils/nanoid'
import type { Photo } from '@/types'

const CATEGORIES = [
  { value: 'scenic', label: '🏞 景点' },
  { value: 'food', label: '🍜 美食' },
  { value: 'hotel', label: '🏨 住宿' },
  { value: 'other', label: '📍 其他' },
] as const

interface AddCheckinModalProps {
  open: boolean
  onClose: () => void
  cityId: string
  cityName: string
}

export function AddCheckinModal({ open, onClose, cityId, cityName }: AddCheckinModalProps) {
  const refresh = useRefreshCities()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'scenic' | 'food' | 'hotel' | 'other'>('scenic')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputCls = 'w-full bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-[#f0a500]'

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const exifDate = await readExifDate(file)
      if (exifDate && !date) setDate(exifDate)
      const data = await compressImage(file)
      const thumbnail = await makeThumbnail(data)
      setPhotos(prev => [...prev, {
        id: nanoid(),
        checkinId: '',
        data,
        thumbnail,
        originalName: file.name,
        takenAt: exifDate,
        caption: '',
      }])
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await createCheckin({ cityId, name, category, date, notes, photos })
    await refresh()
    toast(`已添加打卡：${name}`)
    setSaving(false)
    setName('')
    setCategory('scenic')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setPhotos([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`在 ${cityName} 添加打卡`} size="lg">
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">打卡地点 *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="如：广州塔、陶陶居..."
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#aaa898] mb-1.5 block">分类</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as typeof category)}
              className={inputCls}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#aaa898] mb-1.5 block">日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">记录</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="写下你的感受..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">照片</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#e5e2d8] rounded-xl p-4 text-center cursor-pointer hover:border-[#f0a500]/50 transition-colors"
          >
            <Upload size={20} className="mx-auto mb-1 text-[#c5c2b8]" />
            <p className="text-xs text-[#c5c2b8]">点击或拖拽上传照片</p>
            <p className="text-xs text-[#d5d0c8] mt-0.5">自动压缩到 500KB 以内</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
          {uploading && <p className="text-xs text-[#f0a500] mt-2 animate-pulse">处理中...</p>}
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={photo.thumbnail} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 p-0.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-[#e5e2d8] flex items-center justify-center hover:border-[#f0a500]/50 transition-colors"
              >
                <ImageIcon size={18} className="text-[#c5c2b8]" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="flex-1 justify-center">
            {saving ? '保存中...' : '保存打卡'}
          </Button>
          <Button variant="secondary" onClick={onClose}>取消</Button>
        </div>
      </div>
    </Modal>
  )
}
