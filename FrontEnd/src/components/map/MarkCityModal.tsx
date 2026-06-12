import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { markCity } from '@/api/cityApi'
import { toast } from '@/components/ui/Toast'
import type { VisitStatus } from '@/types'

const STATUS_OPTIONS: { value: VisitStatus; label: string; desc: string }[] = [
  { value: 'visited', label: '旅游', desc: '打卡旅行' },
  { value: 'lived', label: '居住', desc: '在此生活过' },
  { value: 'business', label: '出差', desc: '工作出行' },
]

interface MarkCityModalProps {
  open: boolean
  onClose: () => void
  cityCode: string
  cityName: string
  provinceCode: string
  provinceName: string
  onMarked: (cityCode: string) => void
}

export function MarkCityModal({
  open, onClose, cityCode, cityName, provinceCode, provinceName, onMarked,
}: MarkCityModalProps) {
  const [status, setStatus] = useState<VisitStatus>('visited')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleMark = async () => {
    setSaving(true)
    await markCity({ cityCode, cityName, provinceCode, provinceName, visitDate: date, status })
    toast(`${cityName} 已填色 ✓`)
    setSaving(false)
    onMarked(cityCode)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="填色这片留白" size="sm">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#1a1a1a]">
          <MapPin size={18} className="text-[#f0a500]" />
          <span className="font-medium">{cityName}</span>
          <span className="text-[#999990] text-sm">{provinceName}</span>
        </div>

        <div>
          <label className="text-xs text-[#aaa898] mb-2 block">到访类型</label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                  status === opt.value
                    ? 'border-[#f0a500] bg-[#f0a500]/8 text-[#e09400]'
                    : 'border-[#e5e2d8] bg-white text-[#666660] hover:border-[#f0a500]/40'
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">到访日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#f0a500]"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button onClick={handleMark} disabled={saving} className="flex-1 justify-center">
            {saving ? '标记中...' : '确认填色'}
          </Button>
          <Button variant="secondary" onClick={onClose}>取消</Button>
        </div>
      </div>
    </Modal>
  )
}
