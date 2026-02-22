import { apiRequest } from './apiClient'

export const listRooms = async ({ q, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/rooms?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const getRoom = async (id) => {
    return await apiRequest(`/api/rooms/${id}`)
}

export const createRoom = async (payload) => {
    return await apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const updateRoom = async (id, payload) => {
    return await apiRequest(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
}

export const deleteRoom = async (id) => {
    await apiRequest(`/api/rooms/${id}`, { method: 'DELETE' })
    return true
}
