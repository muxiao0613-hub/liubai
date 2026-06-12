import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getAuditLogs, type AuditLog } from '@/api/adminApi'

const PAGE_SIZE = 15

const ACTION_META: Record<string, { label: string; cls: string }> = {
  CREATE_USER:    { label: '创建用户', cls: 'bg-green-100 text-green-700' },
  UPDATE_USER:    { label: '修改用户', cls: 'bg-blue-100 text-blue-700' },
  RESET_PASSWORD: { label: '重置密码', cls: 'bg-amber-100 text-amber-700' },
  DELETE_USER:    { label: '删除用户', cls: 'bg-red-100 text-red-700' },
  ENABLE_USER:    { label: '启用用户', cls: 'bg-emerald-100 text-emerald-700' },
  DISABLE_USER:   { label: '禁用用户', cls: 'bg-gray-200 text-gray-600' },
  CHANGE_PASSWORD:{ label: '修改密码', cls: 'bg-amber-100 text-amber-700' },
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', { hour12: false })
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAuditLogs(page, PAGE_SIZE, action || undefined)
      setLogs(data.content)
      setTotalPages(data.totalPages)
      setTotal(data.totalElements)
    } catch (e) {
      console.error('加载审计日志失败:', e)
    } finally {
      setLoading(false)
    }
  }, [page, action])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      {/* 筛选 */}
      <div className="flex items-center gap-2">
        <select
          value={action}
          onChange={e => { setPage(0); setAction(e.target.value) }}
          className="px-3 py-2 bg-white border border-[#e5e2d8] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-amber-500"
        >
          <option value="">全部操作</option>
          {Object.entries(ACTION_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e2d8] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作者</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">对象</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => {
                const meta = ACTION_META[log.action] ?? { label: log.action, cls: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{log.actorUsername ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${meta.cls}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{log.targetLabel ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{log.detail ?? '—'}</td>
                  </tr>
                )
              })}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  <ScrollText size={20} className="mx-auto mb-2 text-gray-300" />
                  暂无操作记录
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 {total} 条记录</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
            <ChevronLeft size={16} />
          </Button>
          <span>{totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
