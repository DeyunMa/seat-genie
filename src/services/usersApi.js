import { apiRequest } from './apiClient'

export const listUsers = async ({ role, q, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (role) params.set('role', role)
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/users?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const getUser = async (id) => {
    return await apiRequest(`/api/users/${id}`)
}

export const createUser = async (payload) => {
    return await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const updateUser = async (id, payload) => {
    return await apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
}

export const deleteUser = async (id) => {
    await apiRequest(`/api/users/${id}`, { method: 'DELETE' })
    return true
}

export const loginUser = async (username, password) => {
    // For now, we'll get all users and find the matching one
    // In production, this should be a separate login endpoint with JWT
    const users = await listUsers()
    const user = users.find(u => u.username === username && u.password === password && u.activeStatus === 'Y')
    if (!user) {
        throw new Error('用户名或密码错误')
    }
    return user
}
