import type { CityRecord, Stats } from '@/types'

const TOTAL_CITIES = 340

export function calcStats(cities: CityRecord[]): Stats {
  // 只有纯出差的城市不计入「走过」
  const visited = cities.filter(c => c.statuses.some(s => s !== 'business'))
  const provinces = new Set(cities.map(c => c.provinceCode))
  const totalCheckins = cities.reduce((s, c) => s + c.checkins.length, 0)
  const totalPhotos = cities.reduce((s, c) =>
    s + c.checkins.reduce((cs, ck) => cs + ck.photos.length, 0), 0)

  const mostVisited = cities.reduce<CityRecord | null>((best, c) =>
    !best || c.visitedAt.length > best.visitedAt.length ? c : best, null)

  const latestVisit = cities.reduce<CityRecord | null>((best, c) => {
    if (!best) return c
    return c.firstVisit > best.firstVisit ? c : best
  }, null)

  return {
    totalCities: visited.length,
    totalProvinces: provinces.size,
    totalCheckins,
    totalPhotos,
    coveragePercent: Math.round((visited.length / TOTAL_CITIES) * 100),
    mostVisited,
    latestVisit,
  }
}
