import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CityRecord } from '@/types'
import { getCities } from '@/api/cityApi'

interface CitiesContextValue {
  cities: CityRecord[] | undefined
  refresh: () => Promise<void>
}

const CitiesContext = createContext<CitiesContextValue | undefined>(undefined)

export function CitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<CityRecord[] | undefined>(undefined)

  const refresh = useCallback(async () => {
    try {
      setCities(await getCities())
    } catch (error) {
      console.error('加载城市数据失败:', error)
      setCities([])
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <CitiesContext.Provider value={{ cities, refresh }}>
      {children}
    </CitiesContext.Provider>
  )
}

export function useCitiesContext(): CitiesContextValue {
  const ctx = useContext(CitiesContext)
  if (!ctx) {
    throw new Error('useCitiesContext must be used within a CitiesProvider')
  }
  return ctx
}
