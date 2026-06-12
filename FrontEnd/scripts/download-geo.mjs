// 把阿里云 GeoJSON 文件下载到 public/geo/ 目录
// 服务器上运行：node scripts/download-geo.mjs

import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../public/geo/areas_v3/bound')
const BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

const CODES = [
  '100000', // 全国
  '110000','120000','130000','140000','150000',
  '210000','220000','230000',
  '310000','320000','330000','340000','350000','360000','370000',
  '410000','420000','430000','440000','450000','460000',
  '500000','510000','520000','530000','540000',
  '610000','620000','630000','640000','650000',
  '710000','810000','820000',
]

async function download(code) {
  const filename = `${code}_full.json`
  const dest = join(OUTPUT_DIR, filename)
  if (existsSync(dest)) {
    console.log(`跳过（已存在）: ${filename}`)
    return
  }
  const url = `${BASE}/${filename}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    await writeFile(dest, text, 'utf8')
    console.log(`✓ ${filename}`)
  } catch (e) {
    console.error(`✗ ${filename}: ${e.message}`)
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  console.log(`下载到：${OUTPUT_DIR}\n`)
  for (const code of CODES) {
    await download(code)
    await new Promise(r => setTimeout(r, 200)) // 避免触发限速
  }
  console.log('\n完成！')
}

main()
