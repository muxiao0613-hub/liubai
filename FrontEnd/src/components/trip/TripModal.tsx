import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createTrip, updateTrip } from '@/api/tripApi'
import type { CityRecord, Trip } from '@/types'

interface TripModalProps {
  open: boolean
  trip: Trip | null
  cities: CityRecord[]
  onClose: () => void
  onSaved?: () => void
}

export function TripModal({ open, trip, cities, onClose, onSaved }: TripModalProps) {
  const [name, setName] = useState(trip?.name ?? '')
  const [startDate, setStartDate] = useState(trip?.startDate ?? '')
  const [endDate, setEndDate] = useState(trip?.endDate ?? '')
  const [notes, setNotes] = useState(trip?.notes ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set(trip?.cityCodes ?? []))
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const inputCls = 'w-full bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-[#f0a500]'

  const filtered = cities.filter(c =>
    !search || c.cityName.includes(search) || c.provinceName.includes(search)
  )

  const handleSave = async () => {
    if (!name.trim() || selected.size === 0) return
    setSaving(true)
    const input = {
      name,
      startDate,
      endDate,
      cityCodes: [...selected],
      notes,
      coverPhoto: trip?.coverPhoto,
    }
    try {
      if (trip) {
        await updateTrip(trip.id, input)
      } else {
        await createTrip(input)
      }
      onSaved?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={trip ? '编辑行程' : '新建行程'} size="lg">
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">行程名称 *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="如：2024云南之旅" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#aaa898] mb-1.5 block">出发日期</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-[#aaa898] mb-1.5 block">结束日期</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[#aaa898]">选择城市 * <span className="text-[#f0a500]">{selected.size} 座已选</span></label>
          </div>
          <div className="relative mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c2b8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索城市..."
              className={`${inputCls} pl-8`}
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
            {filtered.map(city => {
              const checked = selected.has(city.cityCode)
              return (
                <button
                  key={city.cityCode}
                  onClick={() => {
                    setSelected(prev => {
                      const next = new Set(prev)
                      checked ? next.delete(city.cityCode) : next.add(city.cityCode)
                      return next
                    })
                    if (!startDate && city.firstVisit) setStartDate(city.firstVisit)
                  }}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                    checked
                      ? 'border-[#f0a500] bg-[#f0a500]/10 text-[#e09400]'
                      : 'border-[#e5e2d8] bg-white text-[#666660] hover:border-[#f0a500]/40'
                  }`}
                >
                  <span className="truncate">{city.cityName}</span>
                  {checked && <Check size={10} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-[#aaa898] mb-1.5 block">行程记录</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="这次旅行的感受..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button onClick={handleSave} disabled={!name.trim() || selected.size === 0 || saving} className="flex-1 justify-center">
            {saving ? '保存中...' : (trip ? '保存修改' : '创建行程')}
          </Button>
          <Button variant="secondary" onClick={onClose}>取消</Button>
        </div>
      </div>
    </Modal>
  )
}
