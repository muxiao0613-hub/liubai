import { apiFetch, apiJson } from './client'

export interface AdminUser {
  id: number
  username: string
  role: string
  enabled: boolean
  createdAt: string | null
  lastLoginAt: string | null
  cityCount: number | null
  checkinCount: number | null
  photoCount: number | null
}

export interface Paged<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdminStats {
  totalUsers: number
  adminCount: number
  newUsers7d: number
  totalCities: number
  totalCheckins: number
  totalPhotos: number
}

export function getStats(): Promise<AdminStats> {
  return apiJson<AdminStats>('/admin/stats')
}

export type SortField = 'username' | 'createdAt' | 'lastLoginAt' | 'role'
export type SortOrder = 'asc' | 'desc'

export function getUsers(
  page: number,
  size: number,
  q?: string,
  sort?: SortField,
  order?: SortOrder,
): Promise<Paged<AdminUser>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (q) params.set('q', q)
  if (sort) params.set('sort', sort)
  if (order) params.set('order', order)
  return apiJson<Paged<AdminUser>>(`/admin/users?${params.toString()}`)
}

export async function createUser(body: { username: string; password: string; role: string }): Promise<void> {
  await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(body) })
}

export async function updateUser(id: number, body: { username?: string; role?: string; enabled?: boolean }): Promise<void> {
  await apiFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function resetPassword(id: number, password: string): Promise<void> {
  await apiFetch(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) })
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch(`/admin/users/${id}`, { method: 'DELETE' })
}

// ---- 用户足迹下钻 ----

export interface AdminCheckin {
  id: number
  cityId: number
  name: string
  category: string | null
  date: string | null
  notes: string | null
  photos: { id: number }[]
}

export interface AdminCity {
  id: number
  provinceCode: string
  cityCode: string
  cityName: string
  firstVisit: string | null
  notes: string | null
  visitedAt: string[]
  statuses: string[]
  checkins: AdminCheckin[]
}

export interface AdminTrip {
  id: number
  name: string
  startDate: string | null
  endDate: string | null
  notes: string | null
  cityCodes: string[]
}

export interface UserFootprint {
  user: AdminUser
  cities: AdminCity[]
  trips: AdminTrip[]
}

export function getUserFootprint(id: number): Promise<UserFootprint> {
  return apiJson<UserFootprint>(`/admin/users/${id}/footprint`)
}

// ---- 仪表盘趋势 ----

export interface AdminTrends {
  registrations: { date: string; count: number }[]
  activeUsers7d: number
  activeUsers30d: number
  adminCount: number
  userCount: number
  topProvinces: { provinceCode: string; count: number }[]
}

export function getTrends(): Promise<AdminTrends> {
  return apiJson<AdminTrends>('/admin/stats/trends')
}

// ---- 操作审计日志 ----

export interface AuditLog {
  id: number
  actorId: number | null
  actorUsername: string | null
  action: string
  targetType: string | null
  targetId: number | null
  targetLabel: string | null
  detail: string | null
  createdAt: string | null
}

export function getAuditLogs(page: number, size: number, action?: string): Promise<Paged<AuditLog>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (action) params.set('action', action)
  return apiJson<Paged<AuditLog>>(`/admin/audit-logs?${params.toString()}`)
}
