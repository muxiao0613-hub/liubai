import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { Download, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TemplateA } from './TemplateA'
import { TemplateB } from './TemplateB'
import { TemplateC } from './TemplateC'
import type { CityRecord, Stats } from '@/types'

const TEMPLATES = [
  { id: 'A', label: '地图成就', desc: '地图 + 统计' },
  { id: 'B', label: '照片墙', desc: '精选照片合集' },
  { id: 'C', label: '年度总结', desc: '年度数据回顾' },
] as const

interface PosterModalProps {
  open: boolean
  onClose: () => void
  cities: CityRecord[]
  stats: Stats
}

export function PosterModal({ open, onClose, cities, stats }: PosterModalProps) {
  const [template, setTemplate] = useState<'A' | 'B' | 'C'>('A')
  const [exporting, setExporting] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!posterRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#faf9f6',
        logging: false,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `留白_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  // Collect all photos across cities
  const allPhotos = cities.flatMap(c => c.checkins.flatMap(ck => ck.photos))

  return (
    <Modal open={open} onClose={onClose} title="导出朋友圈海报" size="xl">
      <div className="p-5">
        {/* Template selector */}
        <div className="flex gap-2 mb-5">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                template === t.id
                  ? 'border-[#f0a500] bg-[#f0a500]/10 text-[#e09400]'
                  : 'border-[#e5e2d8] bg-white text-[#666660] hover:border-[#f0a500]/40'
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Poster preview */}
        <div className="flex justify-center mb-5">
          <div
            ref={posterRef}
            style={{ width: 360, minHeight: 560 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            {template === 'A' && <TemplateA stats={stats} allPhotos={allPhotos} />}
            {template === 'B' && <TemplateB stats={stats} cities={cities} allPhotos={allPhotos} />}
            {template === 'C' && <TemplateC stats={stats} allPhotos={allPhotos} />}
          </div>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full justify-center" size="lg">
          {exporting ? (
            <><Loader2 size={16} className="animate-spin" />生成中...</>
          ) : (
            <><Download size={16} />保存图片</>
          )}
        </Button>
      </div>
    </Modal>
  )
}
