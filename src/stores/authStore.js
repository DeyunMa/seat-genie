import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { selectQuery, updateRow } from '../services/sqliteService'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: (username, password) => {
                const users = selectQuery(
                    "SELECT * FROM users WHERE username = ? AND password = ? AND activeStatus = 'Y'",
                    [username, password]
                )
                const user = users[0]

                if (user) {
                    const { password: _, ...userWithoutPassword } = user
                    set({ user: userWithoutPassword, isAuthenticated: true })
                    return { success: true, user: userWithoutPassword }
                }

                return { success: false, error: '用户名或密码错误' }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false })
            },

            updateUser: (updates) => {
                const currentUser = get().user
                if (currentUser) {
                    set({ user: { ...currentUser, ...updates } })
                }
            },

            changePassword: (oldPassword, newPassword) => {
                const currentUser = get().user
                if (!currentUser) {
                    return { success: false, error: '用户未登录' }
                }

                const users = selectQuery(
                    'SELECT * FROM users WHERE id = ?',
                    [currentUser.id]
                )
                const user = users[0]

                if (!user) {
                    return { success: false, error: '用户不存在' }
                }

                if (user.password !== oldPassword) {
                    return { success: false, error: '原密码错误' }
                }

                updateRow('users', currentUser.id, {
                    password: newPassword,
                    updatedAt: new Date().toISOString()
                })

                return { success: true }
            },

            hasPermission: (requiredRoles) => {
                const user = get().user
                if (!user) return false
                if (!requiredRoles || requiredRoles.length === 0) return true
                return requiredRoles.includes(user.role)
            }
        }),
        {
            name: 'seat_genie_auth',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
        }
    )
)
