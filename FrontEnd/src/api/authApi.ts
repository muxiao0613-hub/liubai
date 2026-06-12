import { apiFetch, apiJson } from './client'

export interface LoginResult {
  token: string
  userId: number
  username: string
  role: string
}

export interface MeResult {
  id: number
  username: string
  role: string
  enabled: boolean
}

/** 登录/注册失败不应触发全局 401 跳转，单独处理错误。 */
async function rawPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = '请求失败'
    try {
      const e = await res.json()
      if (e && typeof e.message === 'string') message = e.message
    } catch {
      // 忽略
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function loginRequest(username: string, password: string): Promise<LoginResult> {
  return rawPost<LoginResult>('/auth/login', { username, password })
}

export function registerRequest(username: string, password: string): Promise<MeResult> {
  return rawPost<MeResult>('/auth/register', { username, password })
}

export function fetchMe(): Promise<MeResult> {
  return apiJson<MeResult>('/auth/me')
}

/** 自助修改密码：校验原密码后设置新密码。 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  })
}
