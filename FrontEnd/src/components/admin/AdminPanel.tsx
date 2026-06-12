import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import {
  Users, Trash2, Edit, Plus, ArrowLeft, KeyRound, Search,
  ChevronLeft, ChevronRight, UserCheck, UserX,
  LayoutDashboard, ScrollText, Download, ChevronsUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import {
  getStats, getUsers, createUser, updateUser, resetPassword, deleteUser,
  type AdminUser, type AdminStats, type SortField, type SortOrder,
} from '@/api/adminApi'
import { DashboardTab } from './DashboardTab'
import { AuditLogTab } from './AuditLogTab'
import { UserDetailDrawer } from './UserDetailDrawer'

const PAGE_SIZE = 10
type Tab = 'dashboard' | 'users' | 'audit'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('zh-CN', { hour12: false })
}

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('dashboard')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsError, setStatsError] = useState(false)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortField>('createdAt')
  const [order, setOrder] = useState<SortOrder>('desc')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [resetting, setResetting] = useState<AdminUser | null>(null)
  const [detail, setDetail] = useState<AdminUser | null>(null)

  const loadStats = useCallback(() => {
    setStatsError(false)
    getStats().then(setStats).catch(() => setStatsError(true))
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsers(page, PAGE_SIZE, q || undefined, sort, order)
      setUsers(data.content)
      setTotalPages(data.totalPages)
      setTotal(data.totalElements)
      setSelected(new Set())
    } catch (error) {
      console.error('加载用户失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, q, sort, order])

  useEffect(() => { loadStats() }, [loadStats])

  useEffect(() => {
    const t = setTimeout(loadUsers, 300)
    return () => clearTimeout(t)
  }, [loadUsers])

  const reloadAll = () => { loadUsers(); loadStats() }

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(o => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(field)
      setOrder('desc')
    }
    setPage(0)
  }

  const handleDelete = async (user: AdminUser) => {
    const ok = await confirm({
      title: `删除用户 ${user.username}`,
      message: '该用户的所有城市、打卡、照片和行程数据都会被永久删除，此操作不可恢复。',
      confirmText: '确认删除',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteUser(user.id)
      toast(`已删除用户 ${user.username}`, 'info')
      reloadAll()
    } catch (err) {
      toast(err instanceof Error ? err.message : '删除失败', 'error')
    }
  }

  const handleToggleEnabled = async (user: AdminUser) => {
    try {
      await updateUser(user.id, { enabled: !user.enabled })
      toast(user.enabled ? `已禁用 ${user.username}` : `已启用 ${user.username}`)
      loadUsers()
    } catch (err) {
      toast(err instanceof Error ? err.message : '操作失败', 'error')
    }
  }

  // ---- 批量操作 ----
  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === users.length ? new Set() : new Set(users.map(u => u.id)))
  }

  const runBatch = async (apply: (id: number) => Promise<void>, label: string) => {
    const ids = [...selected]
    let ok = 0, fail = 0
    for (const id of ids) {
      try { await apply(id); ok++ } catch { fail++ }
    }
    toast(`${label}：成功 ${ok}${fail ? `，失败 ${fail}` : ''}`, fail ? 'error' : 'info')
    reloadAll()
  }

  const batchEnable = () => runBatch(id => updateUser(id, { enabled: true }), '批量启用')
  const batchDisable = () => runBatch(id => updateUser(id, { enabled: false }), '批量禁用')
  const batchDelete = async () => {
    const ok = await confirm({
      title: `删除选中的 ${selected.size} 个用户`,
      message: '这些用户的全部数据将被永久删除，不可恢复。受保护的账号（如最后一个管理员）会被跳过。',
      confirmText: '确认删除',
      danger: true,
    })
    if (!ok) return
    runBatch(id => deleteUser(id), '批量删除')
  }

  // ---- CSV 导出 ----
  const handleExport = async () => {
    try {
      const data = await getUsers(0, Math.max(total, 1), q || undefined, sort, order)
      const header = ['ID', '用户名', '角色', '状态', '城市', '打卡', '照片', '创建时间', '最后登录']
      const rows = data.content.map(u => [
        u.id, u.username, u.role === 'ADMIN' ? '管理员' : '普通用户',
        u.enabled ? '启用' : '禁用',
        u.cityCount ?? 0, u.checkinCount ?? 0, u.photoCount ?? 0,
        formatDate(u.createdAt), formatDate(u.lastLoginAt),
      ])
      const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\n')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `留白_用户_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      toast(err instanceof Error ? err.message : '导出失败', 'error')
    }
  }

  const allSelected = users.length > 0 && selected.size === users.length

  return (
    <div className="h-full flex flex-col">
      {/* 顶栏 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-[#e5e2d8]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-[#1a1a1a]">管理面板</h2>
          </div>
        </div>
        {tab === 'users' && (
          <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus size={18} className="mr-1" />
            添加用户
          </Button>
        )}
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-1 px-4 pt-3 bg-white border-b border-[#e5e2d8]">
        <NavTab active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
          <LayoutDashboard size={15} />仪表盘
        </NavTab>
        <NavTab active={tab === 'users'} onClick={() => setTab('users')}>
          <Users size={15} />用户管理
        </NavTab>
        <NavTab active={tab === 'audit'} onClick={() => setTab('audit')}>
          <ScrollText size={15} />审计日志
        </NavTab>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {tab === 'dashboard' && (
          <DashboardTab stats={stats} statsError={statsError} onRetryStats={loadStats} />
        )}

        {tab === 'audit' && <AuditLogTab />}

        {tab === 'users' && (
          <div className="space-y-4">
            {/* 搜索 + 导出 */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c2b8]" />
                <input
                  value={q}
                  onChange={e => { setPage(0); setQ(e.target.value) }}
                  placeholder="搜索用户名..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#e5e2d8] rounded-lg text-sm text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-amber-500"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleExport} disabled={total === 0}>
                <Download size={14} className="mr-1" />导出 CSV
              </Button>
            </div>

            {/* 批量操作条 */}
            {selected.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <span className="text-amber-800">已选 {selected.size} 项</span>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={batchEnable}>批量启用</Button>
                <Button variant="ghost" size="sm" onClick={batchDisable}>批量禁用</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={batchDelete}>批量删除</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>取消</Button>
              </div>
            )}

            {/* 用户表 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e2d8] overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                          className="accent-amber-500" />
                      </th>
                      <SortTh label="用户名" field="username" sort={sort} order={order} onSort={toggleSort} />
                      <SortTh label="角色" field="role" sort={sort} order={order} onSort={toggleSort} />
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">数据</th>
                      <SortTh label="创建时间" field="createdAt" sort={sort} order={order} onSort={toggleSort} />
                      <SortTh label="最后登录" field="lastLoginAt" sort={sort} order={order} onSort={toggleSort} />
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(user.id)}
                            onChange={() => toggleSelect(user.id)} className="accent-amber-500" />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => setDetail(user)}
                            className="text-gray-800 hover:text-amber-600 hover:underline font-medium">
                            {user.username}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {user.enabled ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {user.cityCount ?? 0} 城 · {user.checkinCount ?? 0} 卡 · {user.photoCount ?? 0} 图
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn title={user.enabled ? '禁用' : '启用'} onClick={() => handleToggleEnabled(user)}>
                              {user.enabled ? <UserX size={16} /> : <UserCheck size={16} />}
                            </IconBtn>
                            <IconBtn title="重置密码" onClick={() => setResetting(user)}>
                              <KeyRound size={16} />
                            </IconBtn>
                            <IconBtn title="编辑" onClick={() => setEditing(user)}>
                              <Edit size={16} />
                            </IconBtn>
                            <IconBtn title="删除" danger onClick={() => handleDelete(user)}>
                              <Trash2 size={16} />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">没有匹配的用户</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>共 {total} 名用户</span>
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
        )}
      </div>

      {/* 弹窗 / 抽屉 */}
      {showAdd && (
        <UserFormModal
          title="添加用户"
          withPassword
          onClose={() => setShowAdd(false)}
          onSubmit={async (form) => {
            await createUser({ username: form.username, password: form.password, role: form.role })
            toast(`已创建用户 ${form.username}`)
            setShowAdd(false)
            reloadAll()
          }}
        />
      )}

      {editing && (
        <UserFormModal
          title="编辑用户"
          initial={{ username: editing.username, role: editing.role, enabled: editing.enabled }}
          withEnabled
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            await updateUser(editing.id, { username: form.username, role: form.role, enabled: form.enabled })
            toast('已保存修改')
            setEditing(null)
            reloadAll()
          }}
        />
      )}

      {resetting && (
        <ResetPasswordModal
          username={resetting.username}
          onClose={() => setResetting(null)}
          onSubmit={async (password) => {
            await resetPassword(resetting.id, password)
            toast(`已重置 ${resetting.username} 的密码`)
            setResetting(null)
          }}
        />
      )}

      {detail && (
        <UserDetailDrawer userId={detail.id} username={detail.username} onClose={() => setDetail(null)} />
      )}
    </div>
  )
}

function NavTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg border-b-2 transition-colors ${
        active ? 'border-amber-500 text-[#1a1a1a] font-medium' : 'border-transparent text-[#aaa898] hover:text-[#666660]'
      }`}
    >
      {children}
    </button>
  )
}

function SortTh({ label, field, sort, order, onSort }: {
  label: string; field: SortField; sort: SortField; order: SortOrder; onSort: (f: SortField) => void
}) {
  const active = sort === field
  return (
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-amber-600">
        {label}
        {active
          ? (order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)
          : <ChevronsUpDown size={13} className="text-gray-300" />}
      </button>
    </th>
  )
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${
        danger ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function csvCell(value: string | number): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

interface UserForm { username: string; password: string; role: string; enabled: boolean }

function UserFormModal({
  title, withPassword, withEnabled, initial, onClose, onSubmit,
}: {
  title: string
  withPassword?: boolean
  withEnabled?: boolean
  initial?: { username: string; role: string; enabled?: boolean }
  onClose: () => void
  onSubmit: (form: UserForm) => Promise<void>
}) {
  const [username, setUsername] = useState(initial?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initial?.role ?? 'USER')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!username.trim()) { toast('请输入用户名', 'error'); return }
    if (withPassword && password.length < 6) { toast('密码至少 6 位', 'error'); return }
    setSaving(true)
    try {
      await onSubmit({ username: username.trim(), password, role, enabled })
    } catch (err) {
      toast(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none'

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <Field label="用户名">
          <input value={username} onChange={e => setUsername(e.target.value)} className={inputCls} placeholder="用户名" />
        </Field>
        {withPassword && (
          <Field label="密码">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="至少 6 位" />
          </Field>
        )}
        <Field label="角色">
          <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
            <option value="USER">普通用户</option>
            <option value="ADMIN">管理员</option>
          </select>
        </Field>
        {withEnabled && (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4" />
            账号启用（取消勾选则禁用登录）
          </label>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>取消</Button>
          <Button className="flex-1 justify-center bg-amber-500 hover:bg-amber-600" disabled={saving} onClick={submit}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </Overlay>
  )
}

function ResetPasswordModal({ username, onClose, onSubmit }: { username: string; onClose: () => void; onSubmit: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (password.length < 6) { toast('密码至少 6 位', 'error'); return }
    setSaving(true)
    try {
      await onSubmit(password)
    } catch (err) {
      toast(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold mb-1">重置密码</h3>
      <p className="text-sm text-gray-500 mb-4">为用户「{username}」设置新密码</p>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="至少 6 位"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
      />
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>取消</Button>
        <Button className="flex-1 justify-center bg-amber-500 hover:bg-amber-600" disabled={saving} onClick={submit}>
          {saving ? '保存中...' : '确认重置'}
        </Button>
      </div>
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
