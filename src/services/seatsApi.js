import { apiRequest } from './apiClient'

export const listSeats = async ({ roomId, status, q, sortBy, sortOrder, limit = 200, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (roomId) params.set('roomId', String(roomId))
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/seats?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const getSeat = async (id) => {
    return await apiRequest(`/api/seats/${id}`)
}

export const createSeat = async (payload) => {
    return await apiRequest('/api/seats', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const updateSeat = async (id, payload) => {
    return await apiRequest(`/api/seats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
}

export const deleteSeat = async (id) => {
    await apiRequest(`/api/seats/${id}`, { method: 'DELETE' })
    return true
}

export const getSeatsByRoom = async (roomId) => {
    return listSeats({ roomId })
}
