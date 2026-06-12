import { useState } from 'react'
import { MapPin, Plus, Trash2, Edit3, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import type { CityRecord, VisitStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import { deleteCity, updateCityNotes, addVisit } from '@/api/cityApi'
import { useRefreshCities } from '@/hooks/useApiCities'
import { AddCheckinModal } from '@/components/checkin/AddCheckinModal'
import { CheckinCard } from '@/components/checkin/CheckinCard'
import { AIAssistant } from '@/components/ai/AIAssistant'

const STATUS_LABELS: Record<string, string> = {
  visited: '旅游',
  lived: '居住',
  business: '出差',
}

const STATUS_COLORS: Record<string, string> = {
  visited:  'text-[#f0a500] bg-[#f0a500]/10 border-[#f0a500]/30',
  lived:    'text-[#e84040] bg-[#e84040]/10 border-[#e84040]/30',
  business: 'text-[#5090d0] bg-[#5090d0]/10 border-[#5090d0]/30',
}

const STATUS_OPTIONS: { value: VisitStatus; label: string }[] = [
  { value: 'visited', label: '旅游' },
  { value: 'lived',   label: '居住' },
  { value: 'business', label: '出差' },
]

interface CityPanelProps {
  city: CityRecord
  onClose: () => void
  apiKey: string
}

export function CityPanel({ city, onClose, apiKey }: CityPanelProps) {
  const [showAddCheckin, setShowAddCheckin] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(city.notes)
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [showVisitHistory, setShowVisitHistory] = useState(false)
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [visitStatus, setVisitStatus] = useState<VisitStatus>('visited')
  const [savingVisit, setSavingVisit] = useState(false)
  const refresh = useRefreshCities()

  const handleUnmark = async () => {
    const ok = await confirm({
      title: `取消标记 ${city.cityName}`,
      message: '该城市下的所有打卡记录和照片也将一并删除，此操作不可恢复。',
      confirmText: '确认删除',
      danger: true,
    })
    if (!ok) return
    await deleteCity(city.id)
    await refresh()
    toast(`已取消标记 ${city.cityName}`, 'info')
    onClose()
  }

  const saveNotes = async () => {
    await updateCityNotes(city.id, notes)
    await refresh()
    setEditingNotes(false)
    toast('备注已保存')
  }

  const handleAddVisit = async () => {
    if (!visitDate) return
    setSavingVisit(true)
    await addVisit(city.id, visitDate, visitStatus)
    await refresh()
    toast(`已记录 ${city.cityName} 第 ${city.visitedAt.length + 1} 次到访`)
    setSavingVisit(false)
    setShowAddVisit(false)
    setVisitDate(new Date().toISOString().split('T')[0])
  }

  const sortedVisits = [...city.visitedAt].sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e5e2d8]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-medium text-[#1a1a1a]">{city.cityName}</h2>
            <p className="text-sm text-[#999990]">{city.provinceName}</p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {city.statuses.map(s => (
              <span key={s} className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* 到访次数 + 历史展开 */}
        <div className="flex items-center gap-2 mt-2">
          <Calendar size={12} className="text-[#c5c2b8]" />
          <span className="text-xs text-[#aaa898]">首次 {city.firstVisit}</span>
          <button
            onClick={() => setShowVisitHistory(!showVisitHistory)}
            className="flex items-center gap-1 text-xs text-[#aaa898] hover:text-[#1a1a1a] transition-colors ml-1"
          >
            共 <span className="text-[#f0a500] font-medium">{city.visitedAt.length}</span> 次到访
            {showVisitHistory ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          <button
            onClick={() => setShowAddVisit(!showAddVisit)}
            className="ml-auto flex items-center gap-1 text-xs text-[#f0a500] hover:text-[#e09400] transition-colors font-medium"
          >
            <Plus size={11} />
            再次到访
          </button>
        </div>

        {/* 到访历史列表 */}
        {showVisitHistory && (
          <div className="mt-2 pl-4 space-y-0.5">
            {sortedVisits.map((d, i) => (
              <div key={d + i} className="flex items-center gap-2 text-xs text-[#888880]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f0a500]/60 shrink-0" />
                <span>{d}</span>
                {i === 0 && <span className="text-[#c5c2b8]">最近</span>}
              </div>
            ))}
          </div>
        )}

        {/* 添加到访内联表单 */}
        {showAddVisit && (
          <div className="mt-3 p-3 bg-[#faf9f6] border border-[#e5e2d8] rounded-xl space-y-2">
            <p className="text-xs font-medium text-[#1a1a1a]">记录新的到访</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                className="flex-1 bg-white border border-[#e5e2d8] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#f0a500]"
              />
              <select
                value={visitStatus}
                onChange={e => setVisitStatus(e.target.value as VisitStatus)}
                className="bg-white border border-[#e5e2d8] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#f0a500]"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddVisit} disabled={savingVisit} className="flex-1 justify-center">
                {savingVisit ? '保存中...' : '确认'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddVisit(false)}>取消</Button>
            </div>
          </div>
        )}

        {/* 备注 */}
        <div className="mt-3">
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="添加城市备注..."
                rows={2}
                className="w-full bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#c5c2b8] resize-none focus:outline-none focus:border-[#f0a500]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveNotes}>保存</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>取消</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-1.5 text-xs text-[#c5c2b8] hover:text-[#999990] transition-colors"
            >
              <Edit3 size={12} />
              {city.notes || '添加备注...'}
            </button>
          )}
        </div>
      </div>

      {/* Checkins */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#1a1a1a]">
              打卡记录 <span className="text-[#f0a500] font-mono">{city.checkins.length}</span>
            </span>
            <Button size="sm" onClick={() => setShowAddCheckin(true)}>
              <Plus size={13} />
              添加打卡
            </Button>
          </div>

          {city.checkins.length === 0 ? (
            <div className="text-center py-8 text-[#c5c2b8]">
              <MapPin size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">还没有打卡记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {city.checkins.map(checkin => (
                <CheckinCard key={checkin.id} checkin={checkin} />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <AIAssistant city={city} apiKey={apiKey} />
        </div>
      </div>

      <div className="p-4 border-t border-[#e5e2d8] shrink-0">
        <Button variant="danger" size="sm" onClick={handleUnmark} className="w-full justify-center">
          <Trash2 size={13} />
          取消标记此城市
        </Button>
      </div>

      <AddCheckinModal
        open={showAddCheckin}
        onClose={() => setShowAddCheckin(false)}
        cityId={city.id}
        cityName={city.cityName}
      />
    </div>
  )
}
