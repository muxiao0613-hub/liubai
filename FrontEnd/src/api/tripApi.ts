import type { Trip } from '@/types'
import { apiFetch, apiJson } from './client'

interface TripDto {
  id: number
  name: string
  startDate: string | null
  endDate: string | null
  coverPhoto: string | null
  notes: string | null
  createdAt: string | null
  cityCodes: string[]
}

export interface TripInput {
  name: string
  startDate: string
  endDate: string
  cityCodes: string[]
  coverPhoto?: string
  notes: string
}

function mapTrip(t: TripDto): Trip {
  return {
    id: String(t.id),
    name: t.name,
    startDate: t.startDate ?? '',
    endDate: t.endDate ?? '',
    cityCodes: t.cityCodes ?? [],
    coverPhoto: t.coverPhoto ?? undefined,
    notes: t.notes ?? '',
    createdAt: t.createdAt ?? '',
  }
}

export async function getTrips(): Promise<Trip[]> {
  const data = await apiJson<TripDto[]>('/trips')
  return data.map(mapTrip)
}

export async function createTrip(input: TripInput): Promise<void> {
  await apiFetch('/trips', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateTrip(id: string, input: TripInput): Promise<void> {
  await apiFetch(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteTrip(id: string): Promise<void> {
  await apiFetch(`/trips/${id}`, { method: 'DELETE' })
}
