import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { loginRequest, fetchMe } from '@/api/authApi'

export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function persistUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user))
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!storedToken || !storedUser) {
      setLoading(false)
      return
    }

    // 先用本地缓存乐观登录，再向后端校验 token 是否仍有效
    setToken(storedToken)
    try {
      setUser(JSON.parse(storedUser))
    } catch {
      // 缓存的 user 已损坏：清理并退回未登录态，由下方 fetchMe 决定去留
      localStorage.removeItem('user')
    }

    fetchMe()
      .then(me => {
        const fresh: User = {
          id: me.id,
          username: me.username,
          role: me.role.toLowerCase() as 'admin' | 'user',
        }
        setUser(fresh)
        persistUser(fresh)
      })
      .catch(() => {
        // token 失效：apiFetch 已清理并跳转
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const data = await loginRequest(username, password)
    const loggedIn: User = {
      id: data.userId,
      username: data.username,
      role: data.role.toLowerCase() as 'admin' | 'user',
    }
    setToken(data.token)
    setUser(loggedIn)
    localStorage.setItem('token', data.token)
    persistUser(loggedIn)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#faf9f6]">
        <div className="w-8 h-8 border-4 border-[#f0a500] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
