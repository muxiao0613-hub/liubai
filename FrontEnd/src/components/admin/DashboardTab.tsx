import { useEffect, useState } from 'react'
import type { EChartsCoreOption } from 'echarts'
import {
  Users, ShieldCheck, UserCheck, MapPin, Camera, Image as ImageIcon, Activity, AlertCircle,
} from 'lucide-react'
import { EChart } from './EChart'
import { getTrends, type AdminStats, type AdminTrends } from '@/api/adminApi'
import { PROVINCES } from '@/utils/mapData'

interface DashboardTabProps {
  stats: AdminStats | null
  statsError: boolean
  onRetryStats: () => void
}

export function DashboardTab({ stats, statsError, onRetryStats }: DashboardTabProps) {
  const [trends, setTrends] = useState<AdminTrends | null>(null)
  const [trendsError, setTrendsError] = useState(false)

  const loadTrends = () => {
    setTrendsError(false)
    getTrends().then(setTrends).catch(() => setTrendsError(true))
  }

  useEffect(() => { loadTrends() }, [])

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {statsError ? (
        <ErrorCard text="统计数据加载失败" onRetry={onRetryStats} />
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={<Users size={16} />} label="用户总数" value={stats.totalUsers} />
          <StatCard icon={<ShieldCheck size={16} />} label="管理员" value={stats.adminCount} />
          <StatCard icon={<UserCheck size={16} />} label="近7天新增" value={stats.newUsers7d} />
          <StatCard icon={<MapPin size={16} />} label="城市记录" value={stats.totalCities} />
          <StatCard icon={<Camera size={16} />} label="打卡记录" value={stats.totalCheckins} />
          <StatCard icon={<ImageIcon size={16} />} label="照片数" value={stats.totalPhotos} />
        </div>
      ) : (
        <div className="h-20 animate-pulse bg-white/50 rounded-xl" />
      )}

      {/* 活跃用户 */}
      {trends && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Activity size={16} />} label="近7天活跃" value={trends.activeUsers7d} />
          <StatCard icon={<Activity size={16} />} label="近30天活跃" value={trends.activeUsers30d} />
          <StatCard icon={<ShieldCheck size={16} />} label="管理员" value={trends.adminCount} />
          <StatCard icon={<Users size={16} />} label="普通用户" value={trends.userCount} />
        </div>
      )}

      {trendsError && <ErrorCard text="趋势数据加载失败" onRetry={loadTrends} />}

      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 注册趋势 */}
          <Panel title="近 30 天注册趋势">
            <EChart className="h-64 w-full" option={registrationsOption(trends)} />
          </Panel>

          {/* 角色分布 */}
          <Panel title="角色分布">
            <EChart className="h-64 w-full" option={roleOption(trends)} />
          </Panel>

          {/* Top 省份 */}
          <Panel title="城市记录 Top 省份" className="lg:col-span-2">
            {trends.topProvinces.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-[#aaa898]">暂无数据</div>
            ) : (
              <EChart className="h-72 w-full" option={topProvincesOption(trends)} />
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function registrationsOption(t: AdminTrends): EChartsCoreOption {
  return {
    grid: { left: 40, right: 16, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: t.registrations.map(r => r.date.slice(5)),
      axisLabel: { fontSize: 10, color: '#aaa898' },
      axisLine: { lineStyle: { color: '#e5e2d8' } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 10, color: '#aaa898' },
      splitLine: { lineStyle: { color: '#f0ede5' } },
    },
    series: [{
      type: 'line',
      smooth: true,
      data: t.registrations.map(r => r.count),
      areaStyle: { color: 'rgba(240,165,0,0.12)' },
      lineStyle: { color: '#f0a500' },
      itemStyle: { color: '#f0a500' },
      symbol: 'circle',
      symbolSize: 5,
    }],
  }
}

function roleOption(t: AdminTrends): EChartsCoreOption {
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#888880' } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: { formatter: '{b}\n{c}', color: '#666660' },
      data: [
        { name: '管理员', value: t.adminCount, itemStyle: { color: '#e87820' } },
        { name: '普通用户', value: t.userCount, itemStyle: { color: '#f0a500' } },
      ],
    }],
  }
}

function topProvincesOption(t: AdminTrends): EChartsCoreOption {
  const rows = [...t.topProvinces].reverse()
  return {
    grid: { left: 80, right: 24, top: 10, bottom: 20 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 10, color: '#aaa898' },
      splitLine: { lineStyle: { color: '#f0ede5' } },
    },
    yAxis: {
      type: 'category',
      data: rows.map(p => PROVINCES[p.provinceCode] ?? p.provinceCode),
      axisLabel: { fontSize: 11, color: '#666660' },
      axisLine: { lineStyle: { color: '#e5e2d8' } },
    },
    series: [{
      type: 'bar',
      data: rows.map(p => p.count),
      barWidth: '55%',
      itemStyle: { color: '#f0a500', borderRadius: [0, 4, 4, 0] },
    }],
  }
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white border border-[#e5e2d8] rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[#aaa898] text-xs mb-1">{icon}{label}</div>
      <div className="text-2xl font-semibold text-[#1a1a1a] font-mono">{value}</div>
    </div>
  )
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#e5e2d8] rounded-xl p-4 ${className ?? ''}`}>
      <h4 className="text-xs font-medium text-[#aaa898] uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  )
}

function ErrorCard({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="bg-white border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm text-red-600">
      <AlertCircle size={16} />
      <span>{text}</span>
      <button onClick={onRetry} className="ml-auto px-3 py-1 text-xs rounded-lg border border-red-200 hover:bg-red-50">
        重试
      </button>
    </div>
  )
}
