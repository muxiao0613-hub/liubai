import type { CityRecord } from '@/types'
import { useCitiesContext } from '@/context/CitiesContext'

export function useCities() {
  const { cities, refresh } = useCitiesContext()
  return { cities, refresh }
}

export function useCity(cityCode: string | null): CityRecord | undefined {
  const { cities } = useCitiesContext()
  if (!cityCode || cities === undefined) return undefined
  return cities.find(c => c.cityCode === cityCode)
}

export function useRefreshCities() {
  return useCitiesContext().refresh
}
