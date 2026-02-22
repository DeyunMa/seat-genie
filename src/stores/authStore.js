import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginUser, updateUser } from '../services/usersApi'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (username, password) => {
                try {
                    const user = await loginUser(username, password)
                    const { password: _, ...userWithoutPassword } = user
                    set({ user: userWithoutPassword, isAuthenticated: true })
                    return { success: true, user: userWithoutPassword }
                } catch (error) {
                    return { success: false, error: error.message || '用户名或密码错误' }
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false })
            },

            updateUserInfo: (updates) => {
                const currentUser = get().user
                if (currentUser) {
                    set({ user: { ...currentUser, ...updates } })
                }
            },

            changePassword: async (oldPassword, newPassword) => {
                const currentUser = get().user
                if (!currentUser) {
                    return { success: false, error: '用户未登录' }
                }

                // Verify old password by attempting login
                try {
                    await loginUser(currentUser.username, oldPassword)
                } catch (error) {
                    return { success: false, error: '原密码错误' }
                }

                // Update password
                try {
                    await updateUser(currentUser.id, { password: newPassword })
                    return { success: true }
                } catch (error) {
                    return { success: false, error: '密码修改失败' }
                }
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
