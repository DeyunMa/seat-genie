import { apiRequest } from './apiClient'
import type { User } from '../types'

interface ListUsersParams {
    role?: string
    q?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateUserPayload {
    username: string
    password: string
    name: string
    role: string
    email?: string
    phone?: string
    studentId?: string
    activeStatus?: string
}

interface UpdateUserPayload {
    name?: string
    role?: string
    email?: string
    phone?: string
    studentId?: string
    password?: string
    activeStatus?: string
}

export const listUsers = async ({ role, q, sortBy, sortOrder, limit = 100, offset = 0 }: ListUsersParams = {}): Promise<User[]> => {
    const params = new URLSearchParams()
    if (role) params.set('role', role)
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/users?${params.toString()}`)
    return Array.isArray(result) ? result as User[] : []
}

export const getUser = async (id: number): Promise<User | null> => {
    const result = await apiRequest(`/api/users/${id}`) as Record<string, unknown> | null
    return (result?.data ?? null) as User | null
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const result = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | User
    return ((result as Record<string, unknown>)?.data ?? result) as User
}

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const result = await apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | User
    return ((result as Record<string, unknown>)?.data ?? result) as User
}

export const deleteUser = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/users/${id}`, { method: 'DELETE' })
    return true
}

export const loginUser = async (username: string, password: string): Promise<User> => {
    const users = await listUsers()
    const user = users.find(u => u.username === username && (u as User & { password?: string }).password === password && u.activeStatus === 'Y')
    if (!user) {
        throw new Error('用户名或密码错误')
    }
    return user
}
