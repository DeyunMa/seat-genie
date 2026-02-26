import { apiRequest } from './apiClient'

export const listNotifications = async ({ type, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/notifications?${params.toString()}`)
    return Array.isArray(result?.data) ? result.data : []
}

export const getNotification = async (id) => {
    const result = await apiRequest(`/api/notifications/${id}`)
    return result?.data ?? null
}

export const createNotification = async (payload) => {
    const result = await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const updateNotification = async (id, payload) => {
    const result = await apiRequest(`/api/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const deleteNotification = async (id) => {
    await apiRequest(`/api/notifications/${id}`, { method: 'DELETE' })
    return true
}

export const markAsRead = async (notificationId, userId) => {
    const result = await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    })
    return result?.data ?? result
}

export const getReadStatus = async (ids, userId) => {
    const result = await apiRequest('/api/notifications/read-status', {
        method: 'POST',
        body: JSON.stringify({ ids, userId })
    })
    return result?.data ?? result
}

export const getUnreadCount = async (userId) => {
    const result = await apiRequest(`/api/notifications/unread/count?userId=${userId}`)
    return result?.data?.count || result?.count || 0
}
