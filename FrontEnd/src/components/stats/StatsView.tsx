import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import { BarChart2 } from 'lucide-react'
import type { CityRecord } from '@/types'

interface StatsViewProps {
  cities: CityRecord[]
}

// 城市粗略坐标（用于距离计算）
const CITY_COORDS: Record<string, [number, number]> = {
  // 直辖市
  '110100': [116.4, 39.9], '120100': [117.2, 39.1], '310100': [121.5, 31.2], '500100': [106.5, 29.6],
  // 广东
  '440100': [113.3, 23.1], '440300': [114.1, 22.5], '440400': [113.1, 22.5], '440600': [113.4, 23.4],
  '440700': [110.4, 21.2], '440800': [110.3, 22.9], '441300': [116.4, 23.9], '441400': [114.7, 23.1],
  '441500': [115.4, 24.1], '441600': [115.7, 23.1], '441700': [115.7, 24.3], '441800': [111.6, 21.9],
  '440900': [111.0, 21.7], '441100': [112.5, 23.1], '441200': [112.0, 22.6], '440500': [113.6, 22.8],
  // 四川
  '510100': [104.1, 30.6], '510300': [104.7, 31.5], '510400': [119.4, 32.4], '510500': [105.6, 31.0],
  '510600': [106.1, 30.8], '510700': [104.6, 29.6], '511000': [105.1, 30.5], '511100': [103.8, 29.6],
  '511300': [105.9, 31.1], '511400': [105.0, 29.4], '511500': [105.4, 28.9], '511600': [104.5, 29.4],
  '511700': [103.0, 29.0], '511800': [101.7, 26.6], '511900': [106.7, 30.4], '512000': [107.5, 31.2],
  // 浙江
  '330100': [120.1, 30.3], '330200': [121.6, 29.9], '330300': [120.7, 28.0], '330400': [120.4, 28.9],
  '330500': [119.9, 29.1], '330600': [120.2, 30.9], '330700': [119.7, 29.5], '330800': [119.0, 28.5],
  '330900': [121.1, 29.3], '331000': [121.4, 28.7], '331100': [119.4, 27.2],
  // 江苏
  '320100': [118.8, 32.1], '320200': [120.3, 31.6], '320300': [118.3, 31.3], '320400': [119.4, 33.4],
  '320500': [120.6, 31.3], '320600': [119.0, 33.0], '320700': [119.2, 34.6], '320800': [119.5, 33.4],
  '320900': [119.0, 33.0], '321000': [119.9, 32.4], '321100': [119.4, 32.4], '321200': [118.6, 32.2],
  '321300': [119.6, 31.7],
  // 山东
  '370100': [117.0, 36.7], '370200': [120.4, 36.1], '370300': [118.0, 36.2], '370400': [117.7, 36.4],
  '370500': [121.4, 37.5], '370600': [120.4, 37.2], '370700': [119.1, 35.4], '370800': [116.6, 35.4],
  '370900': [116.1, 35.8], '371000': [118.3, 35.1], '371100': [122.1, 37.5], '371200': [117.4, 36.0],
  '371300': [118.1, 36.7], '371400': [122.1, 37.5], '371500': [117.5, 35.1], '371600': [115.5, 35.2],
  '371700': [119.9, 37.4],
  // 河南
  '410100': [113.6, 34.8], '410200': [114.3, 36.1], '410300': [112.5, 34.1], '410400': [113.7, 33.8],
  '410500': [114.0, 34.0], '410600': [114.4, 35.7], '410700': [113.4, 35.2], '410800': [115.7, 35.0],
  '410900': [114.9, 35.7], '411000': [116.6, 33.6], '411100': [114.0, 32.1], '411200': [112.1, 33.0],
  '411300': [113.0, 32.3], '411400': [114.9, 34.2], '411500': [111.3, 33.0], '411600': [115.6, 34.4],
  '411700': [114.0, 36.1], '419001': [113.9, 35.0],
  // 湖北
  '420100': [114.3, 30.6], '420200': [114.9, 30.4], '420300': [112.2, 31.0], '420500': [112.1, 30.4],
  '420600': [111.3, 30.7], '420700': [112.1, 31.7], '420800': [112.9, 32.0], '420900': [113.5, 31.7],
  '421000': [115.0, 30.4], '421100': [114.9, 30.9], '421200': [115.8, 30.9], '421300': [113.0, 31.2],
  // 湖南
  '430100': [113.0, 28.2], '430200': [112.9, 27.8], '430300': [113.1, 28.6], '430400': [111.7, 27.2],
  '430500': [112.0, 27.7], '430600': [111.6, 26.9], '430700': [112.4, 26.4], '430800': [111.5, 25.3],
  '430900': [113.6, 27.2], '431000': [116.4, 27.1], '431100': [111.0, 27.7], '431200': [109.7, 28.3],
  '431300': [110.5, 29.3],
  // 陕西
  '610100': [108.9, 34.3], '610200': [107.2, 34.4], '610300': [107.9, 34.4], '610400': [109.5, 35.3],
  '610500': [110.5, 35.0], '610600': [108.0, 36.6], '610700': [107.2, 35.7], '610800': [109.0, 33.1],
  '610900': [109.5, 33.1], '611000': [109.8, 32.7],
  // 其余省会/重要城市
  '130100': [114.5, 38.0], '140100': [112.6, 37.9], '150100': [111.8, 40.8], '210100': [123.4, 41.8],
  '220100': [125.3, 43.9], '230100': [126.6, 45.8], '340100': [117.2, 31.9], '350100': [119.3, 26.1],
  '360100': [115.9, 28.7], '450100': [108.4, 22.8], '460100': [110.3, 20.0], '510200': [104.7, 31.5],
  '520100': [106.7, 26.6], '530100': [102.7, 25.0], '540100': [91.1, 29.7], '620100': [103.8, 36.1],
  '630100': [101.8, 36.6], '640100': [106.3, 38.5], '650100': [87.6, 43.8],
  // 其他重要城市
  '210200': [122.0, 41.1], '210300': [123.1, 41.6], '210400': [123.5, 41.5], '210500': [124.4, 40.1],
  '210600': [124.1, 40.8], '220200': [126.5, 43.2], '220300': [124.4, 43.5], '220400': [125.9, 44.0],
  '220500': [126.2, 43.7], '220600': [125.9, 42.9], '230200': [130.9, 45.3], '230300': [131.2, 46.6],
  '230400': [129.6, 44.6], '230500': [130.4, 47.3], '230600': [126.5, 48.1], '230700': [131.0, 47.7],
  '230800': [132.5, 47.7], '230900': [125.1, 47.5], '231000': [126.1, 47.1], '231100': [125.0, 44.6],
  '231200': [128.0, 44.4], '350200': [118.1, 25.0], '350300': [117.7, 25.5], '350400': [118.6, 26.0],
  '350500': [118.0, 25.4], '350600': [117.0, 26.6], '350700': [119.5, 27.0], '350800': [119.5, 26.9],
  '350900': [120.1, 27.0], '360200': [116.0, 29.3], '360300': [115.0, 28.7], '360400': [116.0, 28.3],
  '360500': [114.9, 28.2], '360600': [117.2, 27.0], '360700': [115.0, 27.0], '360800': [115.0, 28.0],
  '360900': [117.5, 28.5], '361000': [114.4, 27.1], '361100': [114.9, 27.6],
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function EChart({ option, className }: { option: Record<string, unknown>; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chart.setOption(option)
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => { chart.dispose(); ro.disconnect() }
  }, [option])
  return <div ref={ref} className={className} />
}

export function StatsView({ cities }: StatsViewProps) {
  const stats = useMemo(() => {
    // 按年统计城市数
    const byYear: Record<string, Set<string>> = {}
    cities.forEach(c => {
      c.visitedAt.forEach(d => {
        const y = d.slice(0, 4)
        if (!byYear[y]) byYear[y] = new Set()
        byYear[y].add(c.cityCode)
      })
    })

    // 按月统计
    const byMonth: Record<string, number> = {}
    cities.forEach(c => {
      c.visitedAt.forEach(d => {
        const m = d.slice(5, 7)
        byMonth[m] = (byMonth[m] ?? 0) + 1
      })
    })

    // 状态分布
    const statusCount = { visited: 0, lived: 0, business: 0 }
    cities.forEach(c => {
      c.statuses.forEach(s => {
        if (s in statusCount) statusCount[s as keyof typeof statusCount]++
      })
    })

    // 估算总距离（北京出发依次累加）
    let totalKm = 0
    const sorted = [...cities].sort((a, b) => a.firstVisit.localeCompare(b.firstVisit))
    let prev: [number, number] = [116.4, 39.9]
    sorted.forEach(c => {
      const coord = CITY_COORDS[c.cityCode]
      if (coord) {
        totalKm += getDistance(prev[1], prev[0], coord[1], coord[0])
        prev = coord
      }
    })

    return { byYear, byMonth, statusCount, totalKm: Math.round(totalKm) }
  }, [cities])

  const years = Object.keys(stats.byYear).sort()

  const yearOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 10, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: years, axisLine: { lineStyle: { color: '#e5e2d8' } }, axisLabel: { color: '#888880', fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f2f0eb' } }, axisLabel: { color: '#888880', fontSize: 11 } },
    series: [{ type: 'bar', data: years.map(y => stats.byYear[y].size), itemStyle: { color: '#f0a500', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 40 }],
  }

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const monthOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 30, right: 10, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: monthNames, axisLine: { lineStyle: { color: '#e5e2d8' } }, axisLabel: { color: '#888880', fontSize: 10 } },
    yAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f2f0eb' } }, axisLabel: { color: '#888880', fontSize: 11 } },
    series: [{ type: 'bar', data: Array.from({ length: 12 }, (_, i) => stats.byMonth[String(i+1).padStart(2,'0')] ?? 0), itemStyle: { color: '#ff6b35', borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 }],
  }

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      data: [
        { name: '旅游', value: stats.statusCount.visited, itemStyle: { color: '#f0a500' } },
        { name: '居住', value: stats.statusCount.lived,   itemStyle: { color: '#e84040' } },
        { name: '出差', value: stats.statusCount.business, itemStyle: { color: '#5090d0' } },
      ].filter(d => d.value > 0),
      label: { color: '#444440', fontSize: 11 },
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
    }],
  }

  if (cities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#c5c2b8]">
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">还没有数据可统计</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* 顶部数字 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '走过城市', value: cities.length, unit: '座' },
          { label: '旅行照片', value: cities.reduce((s, c) => s + c.checkins.flatMap(ck => ck.photos).length, 0), unit: '张' },
          { label: '打卡地点', value: cities.reduce((s, c) => s + c.checkins.length, 0), unit: '处' },
          { label: '估算里程', value: stats.totalKm.toLocaleString(), unit: 'km' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-[#e5e2d8] rounded-2xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-[#1a1a1a]">{item.value}</div>
            <div className="text-xs text-[#aaa898] mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 年度趋势 */}
      {years.length > 0 && (
        <div className="bg-white border border-[#e5e2d8] rounded-2xl p-4">
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">每年新增城市</h3>
          <EChart option={yearOption} className="h-36" />
        </div>
      )}

      {/* 月份分布 */}
      <div className="bg-white border border-[#e5e2d8] rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">最爱在几月出行</h3>
        <EChart option={monthOption} className="h-36" />
      </div>

      {/* 到访类型 */}
      <div className="bg-white border border-[#e5e2d8] rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">到访类型分布</h3>
        <EChart option={pieOption} className="h-48" />
      </div>

      {/* 最近 10 座城市 */}
      <div className="bg-white border border-[#e5e2d8] rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">最近填色的城市</h3>
        <div className="space-y-2">
          {[...cities]
            .sort((a, b) => b.firstVisit.localeCompare(a.firstVisit))
            .slice(0, 10)
            .map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-[#f2f0eb] last:border-0">
                <div>
                  <span className="text-sm text-[#1a1a1a]">{c.cityName}</span>
                  <span className="text-xs text-[#aaa898] ml-2">{c.provinceName}</span>
                </div>
                <span className="text-xs text-[#c5c2b8]">{c.firstVisit}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
