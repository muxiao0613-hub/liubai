import { useState } from 'react'
import { Search, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { markCity } from '@/api/cityApi'
import { useRefreshCities } from '@/hooks/useApiCities'
import { fetchGeo, PROVINCES } from '@/utils/mapData'
import type { VisitStatus } from '@/types'

interface BatchMarkModalProps {
  open: boolean
  onClose: () => void
  existingCodes: Set<string>
}

interface CityItem {
  code: string
  name: string
  provinceCode: string
  provinceName: string
}

const STATUS_OPTIONS: { value: VisitStatus; label: string }[] = [
  { value: 'visited', label: '旅游' },
  { value: 'lived',   label: '居住' },
  { value: 'business', label: '出差' },
]

export function BatchMarkModal({ open, onClose, existingCodes }: BatchMarkModalProps) {
  const [step, setStep] = useState<'province' | 'city'>('province')
  const [selectedProvince, setSelectedProvince] = useState<{ code: string; name: string } | null>(null)
  const [cities, setCities] = useState<CityItem[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<VisitStatus>('visited')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const refresh = useRefreshCities()

  const loadCities = async (provinceCode: string, provinceName: string) => {
    setLoadingCities(true)
    setSelectedProvince({ code: provinceCode, name: provinceName })
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geo: any = await fetchGeo(provinceCode, true).catch(() => fetchGeo(provinceCode, false))
      const features = geo.features ?? []
      const list: CityItem[] = features
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((f: any) => String(f.properties.adcode) !== provinceCode)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((f: any) => ({
          code: String(f.properties.adcode),
          name: f.properties.name,
          provinceCode,
          provinceName,
        }))
      // 若无子级（台湾等），把省本身作为一个选项
      if (list.length === 0) {
        list.push({ code: provinceCode, name: provinceName, provinceCode, provinceName })
      }
      setCities(list)
      setStep('city')
    } finally {
      setLoadingCities(false)
    }
  }

  const toggleCity = (code: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  const toggleAll = () => {
    const unmarked = filtered.filter(c => !existingCodes.has(c.code)).map(c => c.code)
    const allSelected = unmarked.every(c => selected.has(c))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) { unmarked.forEach(c => next.delete(c)) }
      else { unmarked.forEach(c => next.add(c)) }
      return next
    })
  }

  const handleSave = async () => {
    if (selected.size === 0) return
    setSaving(true)
    for (const cityCode of selected) {
      const city = cities.find(c => c.code === cityCode)
      if (!city) continue
      await markCity({
        cityCode: city.code,
        cityName: city.name,
        provinceCode: city.provinceCode,
        provinceName: city.provinceName,
        visitDate: date,
        status,
      })
    }
    await refresh()
    setSaving(false)
    setSelected(new Set())
    setStep('province')
    onClose()
  }

  const filtered = cities.filter(c =>
    !search || c.name.includes(search)
  )

  const provinceList = Object.entries(PROVINCES)

  return (
    <Modal open={open} onClose={() => { setStep('province'); setSelected(new Set()); onClose() }} title="批量标记城市" size="lg">
      <div className="p-5">
        {step === 'province' ? (
          <>
            <p className="text-xs text-[#aaa898] mb-4">选择省份，进入后勾选去过的城市</p>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {provinceList.map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => loadCities(code, name)}
                  disabled={loadingCities}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#e5e2d8] bg-white hover:border-[#f0a500]/50 hover:bg-[#faf9f6] text-sm text-[#1a1a1a] transition-all disabled:opacity-40"
                >
                  <span className="truncate">{name}</span>
                  <ChevronRight size={14} className="text-[#c5c2b8] shrink-0" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('province')}
              className="flex items-center gap-1 text-sm text-[#999990] hover:text-[#1a1a1a] mb-4 transition-colors"
            >
              <ChevronLeft size={14} />
              返回省份列表
            </button>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c2b8]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`搜索 ${selectedProvince?.name} 的城市`}
                  className="w-full pl-8 pr-3 py-2 bg-[#faf9f6] border border-[#e5e2d8] rounded-lg text-sm text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-[#f0a500]"
                />
              </div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as VisitStatus)}
                className="bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#f0a500]"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#f0a500]"
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <button onClick={toggleAll} className="text-xs text-[#f0a500] hover:underline">
                全选/取消
              </button>
              <span className="text-xs text-[#aaa898]">已选 {selected.size} 座城市</span>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {filtered.map(city => {
                const already = existingCodes.has(city.code)
                const checked = selected.has(city.code)
                return (
                  <button
                    key={city.code}
                    onClick={() => !already && toggleCity(city.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                      already
                        ? 'border-[#f0a500]/30 bg-[#f0a500]/5 text-[#f0a500] cursor-default'
                        : checked
                          ? 'border-[#f0a500] bg-[#f0a500]/10 text-[#e09400]'
                          : 'border-[#e5e2d8] bg-white text-[#1a1a1a] hover:border-[#f0a500]/40'
                    }`}
                  >
                    <span className="flex-1 text-left truncate">{city.name}</span>
                    {(already || checked) && <Check size={13} className="shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-[#e5e2d8]">
              <Button onClick={handleSave} disabled={selected.size === 0 || saving} className="flex-1 justify-center">
                {saving ? '保存中...' : `标记 ${selected.size} 座城市`}
              </Button>
              <Button variant="secondary" onClick={() => { setStep('province'); setSelected(new Set()) }}>
                换省份
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
