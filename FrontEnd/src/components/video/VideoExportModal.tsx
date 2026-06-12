import { useState, useRef, useCallback } from 'react'
import { Video, Loader2, Download } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { CityRecord, Stats } from '@/types'

interface VideoExportModalProps {
  open: boolean
  onClose: () => void
  cities: CityRecord[]
  stats: Stats
}

interface Slide {
  type: 'title' | 'city' | 'photo' | 'stats'
  cityName?: string
  provinceName?: string
  photoSrc?: string
  checkinName?: string
  date?: string
}

function buildSlides(cities: CityRecord[], _stats: Stats): Slide[] {
  const slides: Slide[] = []

  // 封面
  slides.push({ type: 'title' })

  // 按首次到访时间排序，每个城市最多3张照片
  const sorted = [...cities].sort((a, b) => a.firstVisit.localeCompare(b.firstVisit))
  for (const city of sorted.slice(0, 20)) {
    slides.push({ type: 'city', cityName: city.cityName, provinceName: city.provinceName, date: city.firstVisit })
    const photos = city.checkins.flatMap(c => c.photos.map(p => ({ ...p, checkinName: c.name, date: c.date }))).slice(0, 3)
    for (const p of photos) {
      slides.push({ type: 'photo', cityName: city.cityName, photoSrc: p.data, checkinName: p.checkinName, date: p.date })
    }
  }

  // 统计结尾
  slides.push({ type: 'stats' })
  return slides
}

function drawSlide(ctx: CanvasRenderingContext2D, slide: Slide, stats: Stats, progress: number) {
  const W = 720, H = 1280
  const alpha = Math.min(1, progress * 4) // fade in
  ctx.globalAlpha = alpha

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#faf9f6'
  ctx.fillRect(0, 0, W, H)

  if (slide.type === 'title') {
    // 装饰矩形
    ctx.fillStyle = '#f0a500'
    ctx.fillRect(0, H * 0.38, W, 4)
    ctx.font = 'bold 96px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.textAlign = 'center'
    ctx.fillText('留白', W / 2, H * 0.5)
    ctx.font = '28px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#aaa898'
    ctx.fillText('我走过的地方', W / 2, H * 0.58)
    ctx.font = '20px monospace'
    ctx.fillStyle = '#c5c2b8'
    ctx.fillText(new Date().getFullYear().toString(), W / 2, H * 0.64)

  } else if (slide.type === 'city') {
    ctx.fillStyle = '#f0a500'
    ctx.beginPath(); ctx.arc(W / 2, H * 0.42, 12, 0, Math.PI * 2); ctx.fill()
    ctx.font = 'bold 56px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.textAlign = 'center'
    ctx.fillText(slide.cityName ?? '', W / 2, H * 0.52)
    ctx.font = '26px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#aaa898'
    ctx.fillText(slide.provinceName ?? '', W / 2, H * 0.585)
    ctx.font = '20px monospace'
    ctx.fillStyle = '#c5c2b8'
    ctx.fillText(slide.date ?? '', W / 2, H * 0.64)

  } else if (slide.type === 'photo' && slide.photoSrc) {
    const img = new Image()
    img.src = slide.photoSrc
    if (img.complete) {
      // cover fill
      const imgAR = img.width / img.height
      const canAR = W / (H * 0.72)
      let sw = img.width, sh = img.height, sx = 0, sy = 0
      if (imgAR > canAR) { sw = img.height * canAR; sx = (img.width - sw) / 2 }
      else { sh = img.width / canAR; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H * 0.72)
    }
    // bottom info
    const infoY = H * 0.74
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 30px "Noto Sans SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(slide.checkinName ?? '', W / 2, infoY)
    ctx.font = '22px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#aaa898'
    ctx.fillText(`${slide.cityName} · ${slide.date}`, W / 2, infoY + 40)

  } else if (slide.type === 'stats') {
    ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#aaa898'
    ctx.textAlign = 'center'
    ctx.fillText('这一路', W / 2, H * 0.32)
    ctx.font = `bold 100px monospace`
    ctx.fillStyle = '#f0a500'
    ctx.fillText(String(stats.totalCities), W / 2, H * 0.48)
    ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText('座城市的留白已填色', W / 2, H * 0.56)
    ctx.font = '24px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#aaa898'
    ctx.fillText(`${stats.totalProvinces} 个省份  ·  ${stats.coveragePercent}% 足迹`, W / 2, H * 0.63)
    ctx.fillStyle = '#f0a500'
    ctx.fillRect(W * 0.3, H * 0.69, W * 0.4 * stats.coveragePercent / 100, 4)
    ctx.fillStyle = '#ede9e0'
    ctx.fillRect(W * 0.3 + W * 0.4 * stats.coveragePercent / 100, H * 0.69, W * 0.4 * (100 - stats.coveragePercent) / 100, 4)
    ctx.font = '20px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#c5c2b8'
    ctx.fillText('留白 · ' + new Date().getFullYear(), W / 2, H * 0.77)
  }

  ctx.globalAlpha = 1
}

export function VideoExportModal({ open, onClose, cities, stats }: VideoExportModalProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const generate = useCallback(async () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    setGenerating(true)
    setBlobUrl(null)

    const slides = buildSlides(cities, stats)

    // 预加载所有照片，保留引用确保浏览器不 GC，生成结束后释放
    const imgCache = new Map<string, HTMLImageElement>()
    const photoSlides = slides.filter(s => s.type === 'photo' && s.photoSrc)
    await Promise.all(photoSlides.map(s => new Promise<void>((res, _rej) => {
      const img = new Image()
      img.onload = () => { imgCache.set(s.photoSrc!, img); res() }
      img.onerror = () => res() // 加载失败跳过，不阻塞整体
      img.src = s.photoSrc!
    })))

    const FPS = 30
    const SLIDE_DURATION = 2.5 // seconds per slide
    const TOTAL_FRAMES = Math.ceil(slides.length * SLIDE_DURATION * FPS)

    const stream = canvas.captureStream(FPS)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 4_000_000 })
    const chunks: Blob[] = []
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

    recorder.start(100)

    let frame = 0
    const tick = () => {
      const slideIdx = Math.min(Math.floor(frame / (SLIDE_DURATION * FPS)), slides.length - 1)
      const slideFrame = frame % Math.ceil(SLIDE_DURATION * FPS)
      const slideProgress = slideFrame / (SLIDE_DURATION * FPS)
      drawSlide(ctx, slides[slideIdx], stats, slideProgress)
      setProgress(Math.round((frame / TOTAL_FRAMES) * 100))
      frame++
      if (frame < TOTAL_FRAMES) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        recorder.stop()
      }
    }

    recorder.onstop = () => {
      imgCache.clear() // 释放所有预加载图片引用
      const blob = new Blob(chunks, { type: 'video/webm' })
      setBlobUrl(URL.createObjectURL(blob))
      setGenerating(false)
      setProgress(100)
    }

    tick()
  }, [cities, stats])

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `留白_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.webm`
    a.click()
  }

  return (
    <Modal open={open} onClose={() => { if (animRef.current) cancelAnimationFrame(animRef.current); onClose() }} title="生成旅行回忆视频" size="md">
      <div className="p-5 space-y-4">
        <p className="text-sm text-[#666660]">
          将你走过的 {cities.length} 座城市和 {stats.totalPhotos} 张照片合成为一段约{' '}
          {Math.ceil(cities.length * 2.5 + 5)} 秒的回忆视频，导出为 WebM 格式。
        </p>

        <canvas ref={canvasRef} width={720} height={1280} className="hidden" />

        {generating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#f0a500] text-sm">
              <Loader2 size={16} className="animate-spin" />
              生成中 {progress}%
            </div>
            <div className="h-1.5 bg-[#ede9e0] rounded-full overflow-hidden">
              <div className="h-full bg-[#f0a500] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {blobUrl && (
          <video src={blobUrl} controls className="w-full rounded-xl border border-[#e5e2d8]" style={{ maxHeight: 320 }} />
        )}

        <div className="flex gap-3">
          {!blobUrl ? (
            <Button onClick={generate} disabled={generating || cities.length === 0} className="flex-1 justify-center">
              {generating ? <><Loader2 size={14} className="animate-spin" />生成中...</> : <><Video size={14} />开始生成</>}
            </Button>
          ) : (
            <Button onClick={handleDownload} className="flex-1 justify-center">
              <Download size={14} />
              下载视频
            </Button>
          )}
          {blobUrl && (
            <Button variant="secondary" onClick={generate}>重新生成</Button>
          )}
        </div>

        <p className="text-xs text-[#c5c2b8]">
          视频为 WebM 格式，可在 Chrome / Edge / Firefox 中直接播放。如需 MP4 请用格式转换工具转换。
        </p>
      </div>
    </Modal>
  )
}
