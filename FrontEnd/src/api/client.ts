const API_BASE = '/api'

/** 统一的带鉴权请求封装：自动附加 token、解析后端 JSON 错误体、401 时登出。 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    let message = `请求失败 (${response.status})`
    try {
      const body = await response.json()
      if (body && typeof body.message === 'string') message = body.message
    } catch {
      // 忽略非 JSON 错误体
    }
    throw new Error(message)
  }

  return response
}

/** 发请求并解析 JSON；204 No Content 或空响应体返回 undefined。 */
export async function apiJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options)
  if (response.status === 204) return undefined as T
  // 后端偶尔会在 200 下返回空体；直接 response.json() 会抛
  // SyntaxError（Safari: "The string did not match the expected pattern"）。
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
