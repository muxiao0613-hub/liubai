export interface Photo {
  id: string
  checkinId: string
  data: string          // base64 compressed
  thumbnail: string     // smaller base64 for list display
  originalName: string
  takenAt?: string      // ISO string from EXIF
  caption: string
}

export interface Checkin {
  id: string
  cityId: string
  name: string
  category: 'scenic' | 'food' | 'hotel' | 'other'
  date: string          // ISO date string
  photos: Photo[]
  notes: string
  lat?: number
  lng?: number
}

export type VisitStatus = 'visited' | 'lived' | 'business'

export interface CityRecord {
  id: string
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  visitedAt: string[]      // ISO date strings
  firstVisit: string       // ISO date string
  notes: string
  checkins: Checkin[]
  statuses: VisitStatus[]  // 可同时有多种到访类型
}

export interface Stats {
  totalCities: number
  totalProvinces: number
  totalCheckins: number
  totalPhotos: number
  coveragePercent: number
  mostVisited: CityRecord | null
  latestVisit: CityRecord | null
}

export interface AppSettings {
  aiApiKey: string
}

export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  cityCodes: string[]
  coverPhoto?: string   // base64 thumbnail
  notes: string
  createdAt: string
}

// For marking a new city
export interface MarkCityPayload {
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  visitDate: string
  status: VisitStatus
}
