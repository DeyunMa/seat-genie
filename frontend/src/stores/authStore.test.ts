import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

vi.mock('../services/apiClient', () => ({
    apiRequest: vi.fn(),
}))

import { useAuthStore } from './authStore'
import { apiRequest } from '../services/apiClient'

beforeEach(() => {
    useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
    })
    vi.clearAllMocks()
})

describe('authStore', () => {
    describe('login', () => {
        it('sets user and token on success', async () => {
            const mockUser = { id: 1, username: 'admin', name: 'Admin', role: 'admin' };
            (apiRequest as Mock).mockResolvedValue({ token: 'jwt-token', user: mockUser })

            const result = await useAuthStore.getState().login('admin', 'pass')

            expect(result.success).toBe(true)
            expect(result.user).toEqual(mockUser)

            const state = useAuthStore.getState()
            expect(state.isAuthenticated).toBe(true)
            expect(state.token).toBe('jwt-token')
            expect(state.user).toEqual(mockUser)
        })

        it('returns error on failure', async () => {
            (apiRequest as Mock).mockRejectedValue(new Error('Invalid credentials'))

            const result = await useAuthStore.getState().login('bad', 'bad')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Invalid credentials')
            expect(useAuthStore.getState().isAuthenticated).toBe(false)
        })
    })

    describe('logout', () => {
        it('clears auth state', () => {
            useAuthStore.setState({
                user: { id: 1, name: 'Admin' } as any,
                token: 'token',
                isAuthenticated: true,
            })

            useAuthStore.getState().logout()

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.token).toBeNull()
            expect(state.isAuthenticated).toBe(false)
        })
    })

    describe('updateUserInfo', () => {
        it('merges updates into user', () => {
            useAuthStore.setState({
                user: { id: 1, name: 'Old', email: 'old@test.com' } as any,
            })

            useAuthStore.getState().updateUserInfo({ name: 'New' })

            expect(useAuthStore.getState().user!.name).toBe('New')
            expect((useAuthStore.getState().user as any).email).toBe('old@test.com')
        })

        it('does nothing when no user', () => {
            useAuthStore.setState({ user: null })
            useAuthStore.getState().updateUserInfo({ name: 'New' })
            expect(useAuthStore.getState().user).toBeNull()
        })
    })

    describe('hasPermission', () => {
        it('returns true when user role matches', () => {
            useAuthStore.setState({ user: { role: 'admin' } as any })
            expect(useAuthStore.getState().hasPermission(['admin', 'staff'])).toBe(true)
        })

        it('returns false when user role does not match', () => {
            useAuthStore.setState({ user: { role: 'student' } as any })
            expect(useAuthStore.getState().hasPermission(['admin'])).toBe(false)
        })

        it('returns false when no user', () => {
            useAuthStore.setState({ user: null })
            expect(useAuthStore.getState().hasPermission(['admin'])).toBe(false)
        })

        it('returns true when no roles required', () => {
            useAuthStore.setState({ user: { role: 'student' } as any })
            expect(useAuthStore.getState().hasPermission([])).toBe(true)
            expect(useAuthStore.getState().hasPermission(null as any)).toBe(true)
        })
    })

    describe('changePassword', () => {
        it('returns error when not logged in', async () => {
            useAuthStore.setState({ user: null })
            const result = await useAuthStore.getState().changePassword('old', 'new')
            expect(result.success).toBe(false)
            expect(result.error).toBe('用户未登录')
        })

        it('returns error when old password is wrong', async () => {
            useAuthStore.setState({ user: { id: 1, username: 'admin' } as any });
            (apiRequest as Mock).mockRejectedValueOnce(new Error('Invalid'))

            const result = await useAuthStore.getState().changePassword('wrong', 'New12345678!')
            expect(result.success).toBe(false)
            expect(result.error).toBe('原密码错误')
        })

        it('succeeds with correct old password', async () => {
            useAuthStore.setState({ user: { id: 1, username: 'admin' } as any });
            (apiRequest as Mock)
                .mockResolvedValueOnce({ token: 't', user: {} })
                .mockResolvedValueOnce({})

            const result = await useAuthStore.getState().changePassword('old', 'New12345678!')
            expect(result.success).toBe(true)
        })
    })
})
