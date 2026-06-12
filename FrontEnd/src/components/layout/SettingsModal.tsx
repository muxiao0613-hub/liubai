import { useState, useEffect } from 'react'
import { Key, Database, Download, Upload, Trash2, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import { markCity, addVisit, updateCityNotes, clearCities } from '@/api/cityApi'
import { createCheckin } from '@/api/checkinApi'
import { changePassword } from '@/api/authApi'
import { useRefreshCities } from '@/hooks/useApiCities'
import type { CityRecord, VisitStatus } from '@/types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  cities: CityRecord[]
}

export function SettingsModal({ open, onClose, cities }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [importing, setImporting] = useState(false)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)
  const refresh = useRefreshCities()

  useEffect(() => {
    if (open) {
      setApiKey(localStorage.getItem('aiApiKey') ?? '')
      setOldPwd(''); setNewPwd(''); setConfirmPwd('')
    }
  }, [open])

  const handleChangePassword = async () => {
    if (!oldPwd) { toast('请输入原密码', 'error'); return }
    if (newPwd.length < 6) { toast('新密码至少 6 位', 'error'); return }
    if (newPwd !== confirmPwd) { toast('两次输入的新密码不一致', 'error'); return }
    if (newPwd === oldPwd) { toast('新密码不能与原密码相同', 'error'); return }
    setChangingPwd(true)
    try {
      await changePassword(oldPwd, newPwd)
      toast('密码已修改')
      setOldPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (err) {
      toast(err instanceof Error ? err.message : '修改失败', 'error')
    } finally {
      setChangingPwd(false)
    }
  }

  const handleSaveKey = () => {
    localStorage.setItem('aiApiKey', apiKey)
    setSaved(true)
    toast('API Key 已保存')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportData = () => {
    const exportData = cities.map(c => ({
      ...c,
      checkins: c.checkins.map(ck => ({ ...ck, photos: [] })),
    }))
    downloadJson(exportData, `留白_${new Date().toISOString().split('T')[0]}.footprint`)
  }

  const handleExportFull = () => {
    downloadJson(cities, `留白_完整_${new Date().toISOString().split('T')[0]}.footprint-full`)
  }

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCity = async (city: CityRecord) => {
    const statuses: VisitStatus[] = city.statuses?.length ? city.statuses : ['visited']
    const visits = city.visitedAt?.length ? city.visitedAt : [city.firstVisit].filter(Boolean)
    const firstDate = visits[0] || city.firstVisit || new Date().toISOString().split('T')[0]

    const created = await markCity({
      provinceCode: city.provinceCode,
      provinceName: city.provinceName,
      cityCode: city.cityCode,
      cityName: city.cityName,
      visitDate: firstDate,
      status: statuses[0],
    })

    for (let i = 1; i < visits.length; i++) {
      await addVisit(created.id, visits[i], statuses[i] ?? statuses[0])
    }
    for (let i = visits.length; i < statuses.length; i++) {
      await addVisit(created.id, firstDate, statuses[i])
    }
    if (city.notes) await updateCityNotes(created.id, city.notes)

    for (const ck of city.checkins ?? []) {
      await createCheckin({
        cityId: created.id,
        name: ck.name,
        category: ck.category,
        date: ck.date,
        notes: ck.notes,
        photos: ck.photos ?? [],
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.footprint,.footprint-full,application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data: CityRecord[] = JSON.parse(text)
        const ok = await confirm({ message: `即将导入 ${data.length} 条城市记录，已存在的城市会追加到访记录。`, confirmText: '确认导入' })
        if (!ok) return
        setImporting(true)
        for (const city of data) {
          await importCity(city)
        }
        await refresh()
        toast(`已导入 ${data.length} 座城市记录`)
      } catch (err) {
        console.error(err)
        toast('导入失败，请检查文件格式', 'error')
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  const handleClearAll = async () => {
    const ok = await confirm({ title: '清空所有数据', message: '你的所有城市记录、打卡点和照片将被永久删除，此操作不可恢复。', confirmText: '确认清空', danger: true })
    if (!ok) return
    await clearCities()
    await refresh()
    toast('已清空所有数据', 'info')
    onClose()
  }

  const inputCls = 'w-full bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-[#f0a500]'

  return (
    <Modal open={open} onClose={onClose} title="设置" size="md">
      <div className="p-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} className="text-[#f0a500]" />
            <span className="text-sm font-medium text-[#1a1a1a]">AI 助手 API Key</span>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className={`${inputCls} mb-2`}
          />
          <p className="text-xs text-[#aaa898] mb-3">
            用于 AI 城市助手功能。Key 仅保存在本地浏览器中，不会上传。
          </p>
          <Button size="sm" onClick={handleSaveKey}>
            {saved ? '已保存 ✓' : '保存 Key'}
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-[#f0a500]" />
            <span className="text-sm font-medium text-[#1a1a1a]">修改密码</span>
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={oldPwd}
              onChange={e => setOldPwd(e.target.value)}
              placeholder="原密码"
              autoComplete="current-password"
              className={inputCls}
            />
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="新密码（至少 6 位）"
              autoComplete="new-password"
              className={inputCls}
            />
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="确认新密码"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <Button size="sm" onClick={handleChangePassword} disabled={changingPwd} className="mt-2">
            {changingPwd ? '修改中...' : '修改密码'}
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-[#f0a500]" />
            <span className="text-sm font-medium text-[#1a1a1a]">数据管理</span>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportData} className="flex-1 justify-center">
                <Download size={13} />
                导出备份（不含照片）
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportFull} className="flex-1 justify-center">
                <Download size={13} />
                导出完整数据
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={handleImport} disabled={importing} className="w-full justify-center">
              <Upload size={13} />
              {importing ? '导入中...' : '导入数据'}
            </Button>
            <Button variant="danger" size="sm" onClick={handleClearAll} className="w-full justify-center">
              <Trash2 size={13} />
              清空所有数据
            </Button>
          </div>
          <p className="text-xs text-[#aaa898] mt-2">
            当前共 {cities.length} 座城市记录
          </p>
        </div>
      </div>
    </Modal>
  )
}
