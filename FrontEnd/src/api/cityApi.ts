import type { CityRecord, Checkin, Photo, MarkCityPayload, VisitStatus } from '@/types'
import { apiFetch, apiJson } from './client'
import { PROVINCES } from '@/utils/mapData'

interface PhotoDto {
  id: number
  checkinId: number
  data: string
  thumbnail: string
  originalName: string | null
  takenAt: string | null
  caption: string | null
}

interface CheckinDto {
  id: number
  cityId: number
  name: string
  category: string | null
  date: string | null
  notes: string | null
  lat: number | null
  lng: number | null
  photos: PhotoDto[]
}

interface CityDto {
  id: number
  provinceCode: string
  cityCode: string
  cityName: string
  firstVisit: string | null
  notes: string | null
  visitedAt: string[]
  statuses: string[]
  checkins: CheckinDto[]
}

function mapPhoto(p: PhotoDto): Photo {
  return {
    id: String(p.id),
    checkinId: String(p.checkinId),
    data: p.data,
    thumbnail: p.thumbnail,
    originalName: p.originalName ?? '',
    takenAt: p.takenAt ?? undefined,
    caption: p.caption ?? '',
  }
}

function mapCheckin(c: CheckinDto): Checkin {
  return {
    id: String(c.id),
    cityId: String(c.cityId),
    name: c.name,
    category: (c.category ?? 'other') as Checkin['category'],
    date: c.date ?? '',
    notes: c.notes ?? '',
    lat: c.lat ?? undefined,
    lng: c.lng ?? undefined,
    photos: (c.photos ?? []).map(mapPhoto),
  }
}

function mapCity(c: CityDto): CityRecord {
  return {
    id: String(c.id),
    provinceCode: c.provinceCode,
    provinceName: PROVINCES[c.provinceCode] ?? '',
    cityCode: c.cityCode,
    cityName: c.cityName,
    visitedAt: c.visitedAt ?? [],
    firstVisit: c.firstVisit ?? '',
    notes: c.notes ?? '',
    checkins: (c.checkins ?? []).map(mapCheckin),
    statuses: (c.statuses ?? []) as VisitStatus[],
  }
}

export async function getCities(): Promise<CityRecord[]> {
  const data = await apiJson<CityDto[]>('/cities')
  return data.map(mapCity)
}

export async function markCity(payload: MarkCityPayload): Promise<CityRecord> {
  const dto = await apiJson<CityDto>('/cities', {
    method: 'POST',
    body: JSON.stringify({
      provinceCode: payload.provinceCode,
      cityCode: payload.cityCode,
      cityName: payload.cityName,
      visitDate: payload.visitDate,
      status: payload.status,
    }),
  })
  return mapCity(dto)
}

export async function addVisit(cityId: string, visitDate: string, status: VisitStatus): Promise<void> {
  await apiFetch(`/cities/${cityId}/visits`, {
    method: 'POST',
    body: JSON.stringify({ visitDate, status }),
  })
}

export async function updateCityNotes(cityId: string, notes: string): Promise<void> {
  await apiFetch(`/cities/${cityId}`, {
    method: 'PUT',
    body: JSON.stringify({ notes }),
  })
}

export async function deleteCity(cityId: string): Promise<void> {
  await apiFetch(`/cities/${cityId}`, { method: 'DELETE' })
}

export async function clearCities(): Promise<void> {
  await apiFetch('/cities', { method: 'DELETE' })
}
