import type { Photo, Stats } from '@/types'

interface Props { stats: Stats; allPhotos: Photo[] }

export function TemplateC({ stats, allPhotos }: Props) {
  const year = new Date().getFullYear()
  const featuredPhotos = allPhotos.slice(0, 3)

  return (
    <div style={{ background: '#faf9f6', fontFamily: "'Noto Sans SC', sans-serif", padding: '36px 28px', minHeight: 560, display: 'flex', flexDirection: 'column' }}>
      {/* Year header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#ede9e0', lineHeight: 1, marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
          {year}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>我的留白</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: '城市', value: stats.totalCities },
          { label: '省份', value: stats.totalProvinces },
          { label: '打卡', value: stats.totalCheckins },
          { label: '照片', value: stats.totalPhotos },
        ].map(item => (
          <div key={item.label} style={{ padding: '16px', background: '#ffffff', border: '1px solid #e5e2d8', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f0a500', lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#aaa898', marginTop: 6 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {stats.mostVisited && (
        <div style={{ marginBottom: 6, fontSize: 13, color: '#666660' }}>
          去得最多 · <span style={{ color: '#f0a500' }}>{stats.mostVisited.cityName}</span>
          <span style={{ color: '#c5c2b8' }}> {stats.mostVisited.visitedAt.length} 次</span>
        </div>
      )}
      {stats.latestVisit && (
        <div style={{ marginBottom: 20, fontSize: 13, color: '#666660' }}>
          最近到访 · <span style={{ color: '#f0a500' }}>{stats.latestVisit.cityName}</span>
        </div>
      )}

      {featuredPhotos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {featuredPhotos.map((p, i) => (
            <img key={p.id} src={p.thumbnail} alt="" style={{ flex: i === 0 ? 2 : 1, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e2d8' }} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, overflow: 'hidden', border: '1.5px solid #f0a500', display: 'flex' }}>
            <div style={{ width: '50%', background: '#f0a500' }} />
          </div>
          <span style={{ fontSize: 11, color: '#aaa898', letterSpacing: 3 }}>留白</span>
        </div>
        <div style={{ fontSize: 10, color: '#c5c2b8' }}>
          已填色 {stats.coveragePercent}% · 留白 {100 - stats.coveragePercent}%
        </div>
      </div>
    </div>
  )
}
