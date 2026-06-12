import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { CityRecord } from '@/types'
import { fetchGeo, getProvinceColor, getCityColor, PROVINCES } from '@/utils/mapData'

interface ChinaMapProps {
  cities: CityRecord[]
  onCityClick: (cityCode: string, cityName: string, provinceCode: string, provinceName: string) => void
  selectedCityCode: string | null
  onViewChange?: (level: 'nation' | 'province') => void
}

interface MapView {
  level: 'nation' | 'province'
  provinceCode?: string
  provinceName?: string
}

export function ChinaMap({ cities, onCityClick, selectedCityCode, onViewChange }: ChinaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const viewRef = useRef<MapView>({ level: 'nation' })
  const [view, setView] = useState<MapView>({ level: 'nation' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const citiesRef = useRef(cities)
  const onCityClickRef = useRef(onCityClick)
  const onViewChangeRef = useRef(onViewChange)
  citiesRef.current = cities
  onCityClickRef.current = onCityClick
  onViewChangeRef.current = onViewChange

  // 把当前视图层级回传给父组件（用于控制空状态提示等）
  useEffect(() => {
    onViewChangeRef.current?.(view.level)
  }, [view.level])

  const renderNationMap = useCallback(async () => {
    if (!chartRef.current) return
    setLoading(true)
    setError(null)

    const provinceVisitCounts = citiesRef.current.reduce<Record<string, number>>((acc, c) => {
      acc[c.provinceCode] = (acc[c.provinceCode] ?? 0) + 1
      return acc
    }, {})

    try {
      const geo = await fetchGeo('100000')
      echarts.registerMap('china', geo as Parameters<typeof echarts.registerMap>[1])

      const data = Object.entries(PROVINCES).map(([code, name]) => ({
        name,
        value: provinceVisitCounts[code] ?? 0,
        adcode: code,
        itemStyle: { areaColor: getProvinceColor(provinceVisitCounts[code] ?? 0) },
      }))

      chartRef.current.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any) => {
            const count = params.data?.value ?? 0
            return count > 0
              ? `<b>${params.name}</b><br/>走过 ${count} 座城市`
              : `<b>${params.name}</b><br/>留白`
          },
        },
        series: [{
          type: 'map',
          map: 'china',
          roam: true,
          scaleLimit: { min: 0.8, max: 8 },
          data,
          label: { show: false },
          emphasis: {
            label: { show: true, color: '#333', fontSize: 11 },
            itemStyle: { areaColor: '#e87820' },
          },
          itemStyle: {
            areaColor: '#ede9e0',
            borderColor: '#d5d0c8',
            borderWidth: 0.8,
          },
          select: { disabled: true },
        }],
      }, true)

      chartRef.current.off('click')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chartRef.current.on('click', (params: any) => {
        const adcode = params.data?.adcode
        if (adcode && PROVINCES[adcode]) {
          renderProvinceMap(adcode, PROVINCES[adcode])
        }
      })
    } catch {
      setError('地图数据加载失败')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderProvinceMap = useCallback(async (provinceCode: string, provinceName: string) => {
    if (!chartRef.current) return
    setLoading(true)
    setError(null)
    viewRef.current = { level: 'province', provinceCode, provinceName }
    setView({ level: 'province', provinceCode, provinceName })

    const cityStatusMap = citiesRef.current.reduce<Record<string, string[]>>((acc, c) => {
      acc[c.cityCode] = c.statuses
      return acc
    }, {})

    try {
      // 优先取含子级的 full 数据，失败则回退到省级边界
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let geo: any
      try {
        geo = await fetchGeo(provinceCode, true)
      } catch {
        geo = await fetchGeo(provinceCode, false)
      }

      const mapName = `province_${provinceCode}`
      echarts.registerMap(mapName, geo as Parameters<typeof echarts.registerMap>[1])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allFeatures: any[] = geo.features ?? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subFeatures = allFeatures.filter((f: any) => String(f.properties.adcode) !== provinceCode)

      // 是否有下级城市（台湾、港、澳等没有）
      const hasSub = subFeatures.length > 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (hasSub ? subFeatures : allFeatures).map((f: any) => {
        const code = String(f.properties.adcode)
        // 没有子级时，用省级 code 查是否已标记
        const lookupCode = hasSub ? code : provinceCode
        const status = cityStatusMap[lookupCode]
        return {
          name: f.properties.name,
          value: status ? 1 : 0,
          adcode: code,
          itemStyle: { areaColor: getCityColor(status) },
        }
      })

      chartRef.current.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any) => {
            const visited = (params.data?.value ?? 0) > 0
            if (!hasSub) {
              return visited
                ? `<b>${params.name}</b><br/>✓ 走过了`
                : `<b>${params.name}</b><br/>留白 · 点击填色`
            }
            return visited
              ? `<b>${params.name}</b><br/>✓ 走过了`
              : `<b>${params.name}</b><br/>留白 · 点击填色`
          },
        },
        series: [{
          type: 'map',
          map: mapName,
          roam: true,
          scaleLimit: { min: 0.8, max: 10 },
          data,
          label: {
            show: hasSub,   // 没有子级时不显示文字（只有一块区域）
            color: '#888880',
            fontSize: 10,
          },
          emphasis: {
            label: { show: true, color: '#333', fontSize: hasSub ? 11 : 14 },
            itemStyle: { areaColor: '#e87820' },
          },
          itemStyle: {
            areaColor: '#ede9e0',
            borderColor: '#d5d0c8',
            borderWidth: 0.8,
          },
        }],
      }, true)

      chartRef.current.off('click')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chartRef.current.on('click', (params: any) => {
        const adcode = params.data?.adcode ?? ''
        const name = params.name ?? ''
        if (!adcode) return

        if (hasSub) {
          // 正常省份：点城市
          if (adcode !== provinceCode) {
            onCityClickRef.current(adcode, name, provinceCode, provinceName)
          }
        } else {
          // 整体单元（台湾/港/澳）：点整块
          onCityClickRef.current(provinceCode, provinceName, provinceCode, provinceName)
        }
      })
    } catch {
      // full / 非-full 边界数据都取不到（如台湾在数据源缺失）
      setError(`${provinceName}暂无地图数据`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    chartRef.current = echarts.init(containerRef.current)
    renderNationMap()
    return () => chartRef.current?.dispose()
  }, [renderNationMap])

  useEffect(() => {
    const cur = viewRef.current
    if (cur.level === 'nation') {
      renderNationMap()
    } else if (cur.provinceCode) {
      renderProvinceMap(cur.provinceCode, cur.provinceName!)
    }
  }, [cities, selectedCityCode, renderNationMap, renderProvinceMap])

  useEffect(() => {
    const observer = new ResizeObserver(() => chartRef.current?.resize())
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const goBack = () => {
    viewRef.current = { level: 'nation' }
    setView({ level: 'nation' })
    renderNationMap()
  }

  return (
    <div className="relative flex-1 h-full">
      {view.level === 'province' && (
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-[#e5e2d8] rounded-lg text-sm text-[#1a1a1a] hover:bg-[#f2f0eb] transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          返回全国
        </button>
      )}
      {view.level === 'province' && view.provinceName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-white/90 border border-[#e5e2d8] rounded-full text-sm text-[#1a1a1a] shadow-sm">
          {view.provinceName}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <Loader2 size={32} className="text-[#f0a500] animate-spin" />
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center px-6 py-4 bg-white/95 border border-[#e5e2d8] rounded-2xl shadow-lg">
            <p className="text-sm font-medium text-[#1a1a1a]">{error}</p>
            <p className="text-xs text-[#aaa898] mt-1">换个地区试试</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
