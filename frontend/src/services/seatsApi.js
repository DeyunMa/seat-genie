import { apiRequest } from './apiClient'

export const listSeats = async ({ roomId, status, q, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (roomId) params.set('roomId', String(roomId))
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/seats?${params.toString()}`)
    return Array.isArray(result) ? result : []
}

export const getSeat = async (id) => {
    const result = await apiRequest(`/api/seats/${id}`)
    return result?.data ?? null
}

export const createSeat = async (payload) => {
    const result = await apiRequest('/api/seats', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const updateSeat = async (id, payload) => {
    const result = await apiRequest(`/api/seats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const deleteSeat = async (id) => {
    await apiRequest(`/api/seats/${id}`, { method: 'DELETE' })
    return true
}

export const getSeatsByRoom = async (roomId) => {
    return listSeats({ roomId })
}
