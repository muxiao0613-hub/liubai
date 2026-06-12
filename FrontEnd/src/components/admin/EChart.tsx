import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

/** 轻量 echarts 容器：初始化、option 更新、自适应、卸载。 */
export function EChart({ option, className }: { option: echarts.EChartsCoreOption; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(ref.current)
    return () => { observer.disconnect(); chart.dispose() }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return <div ref={ref} className={className} />
}
