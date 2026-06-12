import type { Checkin, Photo } from '@/types'
import { apiFetch } from './client'

export interface NewCheckinInput {
  cityId: string
  name: string
  category: Checkin['category']
  date: string
  notes: string
  photos: Photo[]
}

/** 后端 takenAt 是 LocalDateTime；EXIF 读出的是日期，补足时间部分。 */
function toDateTime(value?: string): string | null {
  if (!value) return null
  return value.length === 10 ? `${value}T00:00:00` : value
}

export async function createCheckin(input: NewCheckinInput): Promise<void> {
  await apiFetch('/checkins', {
    method: 'POST',
    body: JSON.stringify({
      cityId: Number(input.cityId),
      name: input.name,
      category: input.category,
      date: input.date,
      notes: input.notes,
      photos: input.photos.map(p => ({
        data: p.data,
        thumbnail: p.thumbnail,
        originalName: p.originalName,
        takenAt: toDateTime(p.takenAt),
        caption: p.caption,
      })),
    }),
  })
}

export async function updateCheckin(checkinId: string, updates: Partial<Pick<Checkin, 'name' | 'category' | 'date' | 'notes'>>): Promise<void> {
  await apiFetch(`/checkins/${checkinId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteCheckin(checkinId: string): Promise<void> {
  await apiFetch(`/checkins/${checkinId}`, { method: 'DELETE' })
}
