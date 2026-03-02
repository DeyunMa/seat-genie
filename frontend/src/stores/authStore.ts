import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiRequest } from '../services/apiClient'
import type { User } from '../types'

interface LoginResult {
    success: boolean
    user?: User
    error?: string
}

interface ChangePasswordResult {
    success: boolean
    error?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (username: string, password: string) => Promise<LoginResult>
    logout: () => void
    updateUserInfo: (updates: Partial<User>) => void
    changePassword: (oldPassword: string, newPassword: string) => Promise<ChangePasswordResult>
    hasPermission: (requiredRoles?: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (username: string, password: string): Promise<LoginResult> => {
                try {
                    const result = await apiRequest('/api/users/login', {
                        method: 'POST',
                        body: JSON.stringify({ username, password })
                    }) as { token: string; user: User }
                    const { token, user } = result
                    set({ user, token, isAuthenticated: true })
                    return { success: true, user }
                } catch (error) {
                    return { success: false, error: (error as Error).message || '用户名或密码错误' }
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
            },

            updateUserInfo: (updates: Partial<User>) => {
                const currentUser = get().user
                if (currentUser) {
                    set({ user: { ...currentUser, ...updates } })
                }
            },

            changePassword: async (oldPassword: string, newPassword: string): Promise<ChangePasswordResult> => {
                const currentUser = get().user
                if (!currentUser) {
                    return { success: false, error: '用户未登录' }
                }

                try {
                    await apiRequest('/api/users/login', {
                        method: 'POST',
                        body: JSON.stringify({ username: currentUser.username, password: oldPassword })
                    })
                } catch {
                    return { success: false, error: '原密码错误' }
                }

                try {
                    await apiRequest(`/api/users/${currentUser.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ password: newPassword })
                    })
                    return { success: true }
                } catch {
                    return { success: false, error: '密码修改失败' }
                }
            },

            hasPermission: (requiredRoles?: string[]): boolean => {
                const user = get().user
                if (!user) return false
                if (!requiredRoles || requiredRoles.length === 0) return true
                return requiredRoles.includes(user.role)
            }
        }),
        {
            name: 'seat_genie_auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
