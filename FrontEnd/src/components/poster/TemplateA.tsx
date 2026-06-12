import type { Photo, Stats } from '@/types'

interface Props { stats: Stats; allPhotos: Photo[] }

export function TemplateA({ stats, allPhotos }: Props) {
  const recentPhotos = allPhotos.slice(-3)
  const blankPercent = 100 - stats.coveragePercent

  return (
    <div style={{ background: '#faf9f6', fontFamily: "'Noto Sans SC', sans-serif", padding: '40px 32px', minHeight: 560, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden', border: '1.5px solid #f0a500', display: 'flex' }}>
            <div style={{ width: '50%', background: '#f0a500' }} />
          </div>
          <span style={{ fontSize: 13, color: '#1a1a1a', letterSpacing: 4, fontWeight: 500 }}>留白</span>
        </div>
        <div style={{ fontSize: 11, color: '#c5c2b8', letterSpacing: 3 }}>LIU BAI · {new Date().getFullYear()}</div>
      </div>

      {/* Main stats */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: '#f0a500', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {stats.totalCities}
          </div>
          <div style={{ fontSize: 15, color: '#aaa898', marginTop: 6 }}>片留白已填色</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
          {[
            { v: stats.totalProvinces, l: '个省份' },
            { v: `${stats.coveragePercent}%`, l: '已填色' },
            { v: stats.totalPhotos, l: '张照片' },
          ].map((item, i, arr) => (
            <div key={item.l} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 36 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>{item.v}</div>
                <div style={{ fontSize: 12, color: '#aaa898', marginTop: 4 }}>{item.l}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 36, background: '#e5e2d8' }} />}
            </div>
          ))}
        </div>

        {/* 留白进度条 */}
        <div>
          <div style={{ height: 4, background: '#ede9e0', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${stats.coveragePercent}%`, height: '100%', background: 'linear-gradient(90deg, #f0a500, #ff6b35)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#c5c2b8' }}>
            <span>已填色 {stats.coveragePercent}%</span>
            <span>留白 {blankPercent}%</span>
          </div>
        </div>

        {recentPhotos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {recentPhotos.map(p => (
              <img key={p.id} src={p.thumbnail} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #e5e2d8' }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, fontSize: 10, color: '#d5d0c8', textAlign: 'center' }}>我走过的地方</div>
    </div>
  )
}
