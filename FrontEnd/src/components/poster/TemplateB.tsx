import type { CityRecord, Photo, Stats } from '@/types'

interface Props { stats: Stats; cities: CityRecord[]; allPhotos: Photo[] }

export function TemplateB({ stats, cities, allPhotos }: Props) {
  const gridPhotos = allPhotos.slice(0, 9)
  const recentCities = cities.slice(-8).map(c => c.cityName)

  return (
    <div style={{ background: '#ffffff', fontFamily: "'Noto Sans SC', sans-serif", minHeight: 560 }}>
      {/* Photo grid */}
      {gridPhotos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {gridPhotos.map(p => (
            <img key={p.id} src={p.thumbnail} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
          ))}
          {Array.from({ length: Math.max(0, 9 - gridPhotos.length) }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: '#f2f0eb' }} />
          ))}
        </div>
      ) : (
        <div style={{ height: 240, background: '#f2f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c2b8', fontSize: 14 }}>
          上传照片后更精彩
        </div>
      )}

      <div style={{ padding: '24px 28px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, overflow: 'hidden', border: '1.5px solid #f0a500', display: 'flex' }}>
              <div style={{ width: '50%', background: '#f0a500' }} />
            </div>
            <span style={{ fontSize: 11, color: '#aaa898', letterSpacing: 3 }}>留白</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
            走过 <span style={{ color: '#f0a500' }}>{stats.totalCities}</span> 城
            <span style={{ margin: '0 8px', color: '#e5e2d8' }}>·</span>
            <span style={{ color: '#f0a500' }}>{stats.totalProvinces}</span> 个省份
          </div>
        </div>

        {recentCities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {recentCities.map(name => (
              <span key={name} style={{ padding: '3px 10px', background: '#faf9f6', border: '1px solid #e5e2d8', borderRadius: 999, fontSize: 11, color: '#666660' }}>
                {name}
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 3, background: '#f2f0eb', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${stats.coveragePercent}%`, height: '100%', background: '#f0a500', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#c5c2b8' }}>
          <span>已填色 {stats.coveragePercent}%</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
