import { apiRequest } from './apiClient'

export const listReservations = async ({ userId, seatId, date, status, sortBy, sortOrder, limit = 200, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (userId) params.set('userId', String(userId))
    if (seatId) params.set('seatId', String(seatId))
    if (date) params.set('date', date)
    if (status) params.set('status', status)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/reservations?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const getReservation = async (id) => {
    return await apiRequest(`/api/reservations/${id}`)
}

export const createReservation = async (payload) => {
    return await apiRequest('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const updateReservation = async (id, payload) => {
    return await apiRequest(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
}

export const cancelReservation = async (id) => {
    return await apiRequest(`/api/reservations/${id}/cancel`, {
        method: 'POST'
    })
}

export const deleteReservation = async (id) => {
    await apiRequest(`/api/reservations/${id}`, { method: 'DELETE' })
    return true
}
