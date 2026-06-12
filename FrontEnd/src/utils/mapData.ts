const BASE_URL = '/geo/areas_v3/bound'

const geoCache = new Map<string, unknown>()

export async function fetchGeo(adcode: string, full = true): Promise<unknown> {
  const key = `${adcode}${full ? '_full' : ''}`
  if (geoCache.has(key)) return geoCache.get(key)
  const url = `${BASE_URL}/${key}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch geo: ${url}`)
  const data = await res.json()
  geoCache.set(key, data)
  return data
}

// Province adcode → name mapping
export const PROVINCES: Record<string, string> = {
  '110000': '北京市',
  '120000': '天津市',
  '130000': '河北省',
  '140000': '山西省',
  '150000': '内蒙古自治区',
  '210000': '辽宁省',
  '220000': '吉林省',
  '230000': '黑龙江省',
  '310000': '上海市',
  '320000': '江苏省',
  '330000': '浙江省',
  '340000': '安徽省',
  '350000': '福建省',
  '360000': '江西省',
  '370000': '山东省',
  '410000': '河南省',
  '420000': '湖北省',
  '430000': '湖南省',
  '440000': '广东省',
  '450000': '广西壮族自治区',
  '460000': '海南省',
  '500000': '重庆市',
  '510000': '四川省',
  '520000': '贵州省',
  '530000': '云南省',
  '540000': '西藏自治区',
  '610000': '陕西省',
  '620000': '甘肃省',
  '630000': '青海省',
  '640000': '宁夏回族自治区',
  '650000': '新疆维吾尔自治区',
  '710000': '台湾省',
  '810000': '香港特别行政区',
  '820000': '澳门特别行政区',
}

export function getProvinceCode(adcode: string): string {
  // adcode like 440100 → province 440000
  return adcode.slice(0, 2) + '0000'
}

// 亮色主题：未访问 = 留白（parchment），访问越多颜色越深
export function getProvinceColor(visitedCount: number): string {
  if (visitedCount === 0) return '#ede9e0'  // 留白 — 宣纸色
  if (visitedCount <= 2) return '#fad06e'
  if (visitedCount <= 5) return '#f0a500'
  if (visitedCount <= 10) return '#e08a00'
  return '#c97000'
}

// 7种组合色：3单色 + 3双色 + 1全覆盖
export function getCityColor(statuses: string[] | string | undefined): string {
  const arr = !statuses ? [] : Array.isArray(statuses) ? statuses : [statuses]
  if (arr.length === 0) return '#ede9e0'

  const v = arr.includes('visited')
  const l = arr.includes('lived')
  const b = arr.includes('business')

  if (v && l && b) return '#b07030'  // 全覆盖 — 深棕金
  if (v && l)      return '#e06020'  // 旅游+居住 — 深橙
  if (v && b)      return '#50a860'  // 旅游+出差 — 草绿
  if (l && b)      return '#9040b0'  // 居住+出差 — 紫
  if (l)           return '#e84040'  // 居住 — 红砖
  if (b)           return '#5090d0'  // 出差 — 蓝
  return '#f0a500'                   // 旅游 — 橙金
}

export function primaryStatus(statuses: string[]): string {
  if (statuses.includes('lived'))   return 'lived'
  if (statuses.includes('visited')) return 'visited'
  return 'business'
}
