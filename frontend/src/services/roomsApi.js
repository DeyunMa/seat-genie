import { apiRequest } from './apiClient'

export const listRooms = async ({ q, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/rooms?${params.toString()}`)
    return Array.isArray(result) ? result : []
}

export const getRoom = async (id) => {
    const result = await apiRequest(`/api/rooms/${id}`)
    return result?.data ?? null
}

export const createRoom = async (payload) => {
    const result = await apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const updateRoom = async (id, payload) => {
    const result = await apiRequest(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const deleteRoom = async (id) => {
    await apiRequest(`/api/rooms/${id}`, { method: 'DELETE' })
    return true
}
